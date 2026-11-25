import { NextResponse } from "next/server";
import {
  adminMutation,
  requireDb,
  smallJson,
  commerceFailure,
} from "@/lib/commerce-http";
import { updateDelivery } from "@/lib/operations";
import { processNotifications } from "@/lib/notifications";
import { orderEmailKey } from "@/lib/order-emails";
export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } },
) {
  try {
    const actor = await adminMutation(req, "deliveries.manage");
    const db = requireDb();
    const status = await updateDelivery(
      db,
      params.orderId,
      await smallJson(req),
      actor.id,
    );
    if (status === "DELIVERED")
      await processNotifications(db, 1, orderEmailKey("order-fulfilled", params.orderId)).catch(() => undefined);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
