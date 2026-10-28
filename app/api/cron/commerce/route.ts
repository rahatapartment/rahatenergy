export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { expireReservations } from "@/lib/commerce";
import { processNotifications } from "@/lib/notifications";
import { requireDb, commerceFailure } from "@/lib/commerce-http";
export async function GET(req: Request) {
  const secret = process.env.ENERGY_CRON_SECRET;
  const supplied = req.headers.get("authorization") || "";
  const expected = `Bearer ${secret || ""}`;
  if (
    !secret ||
    secret.length < 32 ||
    Buffer.byteLength(supplied) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
  )
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const db = requireDb();
    const run = await db.jobRun.create({ data: { job: "commerce" } });
    try {
      const result = {
        expired: await expireReservations(db),
        notifications: await processNotifications(db),
      };
      await db.rateLimitBucket.deleteMany({
        where: { expiresAt: { lt: new Date(Date.now() - 86400_000) } },
      });
      await db.jobRun.update({
        where: { id: run.id },
        data: { status: "SUCCEEDED", finishedAt: new Date(), result },
      });
      return NextResponse.json(result, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      await db.jobRun
        .update({
          where: { id: run.id },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            error:
              "Commerce job failed; inspect application and provider logs.",
          },
        })
        .catch(() => undefined);
      throw error;
    }
  } catch (e) {
    return commerceFailure(e);
  }
}
