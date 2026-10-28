import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { finalizePayment, orderCookie } from "@/lib/commerce";
import { hashToken, CommerceError } from "@/lib/commerce-validation";
import { requireDb, commerceFailure, smallJson } from "@/lib/commerce-http";
import { sameOrigin, limitRequest } from "@/lib/security";
import { verifyPayment } from "@/lib/paystack";
import { processNotifications } from "@/lib/notifications";
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req))
      throw new CommerceError("Invalid request origin.", 403);
    if (!(await limitRequest("payment-verify", 50, 60000)))
      throw new CommerceError("Please try again shortly.", 429);
    const input = await smallJson(req);
    if (
      typeof input.reference !== "string" ||
      !/^RE-[A-F0-9]{20}$/.test(input.reference)
    )
      throw new CommerceError("Invalid reference.", 400);
    const token = cookies().get(orderCookie(input.reference))?.value;
    if (!token) throw new CommerceError("Order access required.", 401);
    const db = requireDb();
    const order = await db.order.findFirst({
      where: { reference: input.reference, accessTokenHash: hashToken(token) },
      include: { payments: true },
    });
    if (!order) throw new CommerceError("Order access required.", 401);
    const result = await finalizePayment(
      db,
      await verifyPayment(order.payments[0].reference),
    );
    await processNotifications(db, 1).catch(() => undefined);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return commerceFailure(e);
  }
}
