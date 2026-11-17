import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminMutation,
  requireDb,
  smallJson,
  commerceFailure,
} from "@/lib/commerce-http";
import { limitRequest } from "@/lib/security";
export async function POST(req: Request) {
  try {
    const actor = await adminMutation(req);
    const { path, eventId } = z
      .object({
        path: z
          .string()
          .regex(/^\/admin(?:\/[a-zA-Z0-9_-]+)*$/)
          .max(250),
        eventId: z.string().uuid(),
      })
      .strict()
      .parse(await smallJson(req));
    if (!(await limitRequest(`activity:${actor.id}`, 120, 60000)))
      return NextResponse.json({ error: "Too many events." }, { status: 429 });
    await requireDb().auditLog.upsert({
      where: { eventId },
      create: {
        actor: actor.id,
        actorEmail: actor.email,
        action: "PAGE_VIEW",
        subject: path,
        eventId,
        data: {},
      },
      update: {},
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
