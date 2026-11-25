import { NextResponse } from "next/server";
import { z } from "zod";
import { updateFulfillment } from "@/lib/commerce";
import { processNotifications } from "@/lib/notifications";
import { orderEmailKey } from "@/lib/order-emails";
import {
  requireDb,
  adminMutation,
  commerceFailure,
  smallJson,
} from "@/lib/commerce-http";
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const actor = await adminMutation(req, "orders.manage");
    const { status } = z
      .object({
        status: z.enum([
          "PROCESSING",
          "READY_FOR_PICKUP",
          "DISPATCHED",
          "DELIVERED",
        ]),
      })
      .strict()
      .parse(await smallJson(req));
    const db = requireDb();
    await updateFulfillment(db, params.id, status, actor.id);
    if (status === "DELIVERED")
      await processNotifications(db, 1, orderEmailKey("order-fulfilled", params.id)).catch(() => undefined);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
