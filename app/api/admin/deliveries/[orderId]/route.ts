import { NextResponse } from "next/server";
import {
  adminMutation,
  requireDb,
  smallJson,
  commerceFailure,
} from "@/lib/commerce-http";
import { updateDelivery } from "@/lib/operations";
export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } },
) {
  try {
    const actor = await adminMutation(req);
    await updateDelivery(
      requireDb(),
      params.orderId,
      await smallJson(req),
      actor.id,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
