import { NextResponse } from "next/server";
import { z } from "zod";
import { permissionKeys } from "@/lib/admin-permissions";
import {
  adminMutation,
  requireDb,
  smallJson,
  commerceFailure,
} from "@/lib/commerce-http";
import { inviteAdmin } from "@/lib/admin-invitations";
import { processNotifications } from "@/lib/notifications";
import { auditCreate } from "@/lib/audit";
export async function POST(req: Request) {
  try {
    const actor = await adminMutation(req, true);
    const input = z
      .object({
        email: z.string().trim().toLowerCase().email().max(254),
        roleLabel: z.string().trim().min(2).max(60),
        permissions: z
          .array(z.string().refine((v) => permissionKeys.includes(v as never)))
          .min(1)
          .max(30),
      })
      .strict()
      .parse(await smallJson(req));
    const db = requireDb();
    const id = await inviteAdmin(db, actor, input);
    await processNotifications(db, 3);
    const job = await db.notification.findUnique({
      where: { eventKey: `admin-invite:${id}` },
      select: { sentAt: true },
    });
    return NextResponse.json({
      ok: true,
      message: job?.sentAt
        ? "Invitation accepted by the email provider. The link expires in 48 hours."
        : "Invitation queued. Email delivery is pending; check Monitoring for retries.",
    });
  } catch (e) {
    return commerceFailure(e);
  }
}
export async function DELETE(req: Request) {
  try {
    const actor = await adminMutation(req, true);
    const { id } = z
      .object({ id: z.string().max(100) })
      .strict()
      .parse(await smallJson(req));
    await requireDb().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('energy-admin-management'))::text`;
      await tx.adminInvitation.updateMany({
        where: { id, acceptedAt: null, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.notification.updateMany({
        where: { eventKey: `admin-invite:${id}`, sentAt: null },
        data: { attempts: 12, lastError: "Invitation revoked." },
      });
      await auditCreate(tx, {
        data: {
          actor: actor.id,
          action: "INVITATION_REVOKED",
          subject: id,
          data: {},
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
