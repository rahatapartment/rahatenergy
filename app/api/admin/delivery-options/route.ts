import { NextResponse } from "next/server";
import { deliveryOptionSchema } from "@/lib/commerce-validation";
import {
  requireDb,
  adminMutation,
  commerceFailure,
  smallJson,
} from "@/lib/commerce-http";
export async function POST(req: Request) {
  try {
    const actor = await adminMutation(req);
    const input = deliveryOptionSchema.parse(await smallJson(req));
    const db = requireDb();
    await db.$transaction(async (tx) => {
      const option = await tx.deliveryOption.create({ data: input });
      await tx.auditLog.create({
        data: {
          actor: actor.id,
          action: "DELIVERY_OPTION_CREATE",
          subject: option.id,
          data: input,
        },
      });
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return commerceFailure(e);
  }
}
export async function PATCH(req: Request) {
  try {
    const actor = await adminMutation(req);
    const body = await smallJson(req);
    const { id, ...fields } = body;
    if (typeof id !== "string")
      return NextResponse.json(
        { error: "Option ID required." },
        { status: 400 },
      );
    const values = deliveryOptionSchema.parse(fields);
    await requireDb().$transaction(async (tx) => {
      await tx.deliveryOption.update({ where: { id }, data: values });
      await tx.auditLog.create({
        data: {
          actor: actor.id,
          action: "DELIVERY_OPTION_UPDATE",
          subject: id,
          data: values,
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
