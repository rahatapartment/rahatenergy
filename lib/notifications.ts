import type { Prisma, PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
export async function processNotifications(db: PrismaClient, limit = 3, eventKey?: string) {
  if (!process.env.ENERGY_RESEND_API_KEY) return { configured: false, sent: 0 };
  const jobs = await db.notification.findMany({
    where: {
      eventKey,
      sentAt: null,
      attempts: { lt: 12 },
      nextAttemptAt: { lte: new Date() },
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  let sent = 0;
  for (const job of jobs) {
    const payload = job.payload as Prisma.InputJsonObject;
    const from = typeof payload.from === "string" ? payload.from : process.env.ENERGY_EMAIL_FROM;
    if (!from) continue;
    const message = { ...payload, from };
    const token = randomUUID();
    const claim = await db.notification.updateMany({
      where: {
        id: job.id,
        sentAt: null,
        attempts: job.attempts,
        OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }],
      },
      data: {
        lockToken: token,
        lockedUntil: new Date(Date.now() + 120_000),
        attempts: { increment: 1 },
        firstAttemptAt: job.firstAttemptAt ?? new Date(),
        ...(payload.from ? {} : { payload: message }),
      },
    });
    if (!claim.count) continue;
    try {
      if (
        job.firstAttemptAt &&
        Date.now() - job.firstAttemptAt.getTime() >= 23 * 3600_000
      )
        throw new Error("WINDOW_EXPIRED");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ENERGY_RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `energy/${job.id}`,
        },
        body: JSON.stringify(message),
        signal: AbortSignal.timeout(8000),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || typeof body?.id !== "string")
        throw new Error("SEND_FAILED");
      await db.notification.updateMany({
        where: { id: job.id, lockToken: token },
        data: {
          sentAt: new Date(),
          providerId: body.id,
          lastError: null,
          lockToken: null,
          lockedUntil: null,
        },
      });
      sent++;
    } catch (error) {
      const expired =
        error instanceof Error && error.message === "WINDOW_EXPIRED";
      await db.notification.updateMany({
        where: { id: job.id, lockToken: token },
        data: {
          lockToken: null,
          lockedUntil: null,
          lastError: expired
            ? "Retry window expired; review provider logs before resending."
            : "Email delivery attempt failed.",
          attempts: expired ? 12 : undefined,
          nextAttemptAt: new Date(
            Date.now() + Math.min(3600, 30 * 2 ** job.attempts) * 1000,
          ),
        },
      });
    }
  }
  return { configured: true, sent };
}
