import { NextResponse } from "next/server";
import { validWebhookSignature, verifyPayment, paymentReferencePattern, paymentMode, referenceMode } from "@/lib/paystack";
import { finalizePayment } from "@/lib/commerce";
import { sendPaymentEmails } from "@/lib/order-emails";
import { requireDb, commerceFailure } from "@/lib/commerce-http";
import { CommerceError } from "@/lib/commerce-validation";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const raw = Buffer.from(await req.arrayBuffer());
    if (raw.length > 100000) throw new CommerceError("Webhook too large.", 413);
    if (!validWebhookSignature(raw, req.headers))
      throw new CommerceError("Invalid signature.", 401);
    let body;
    try {
      body = JSON.parse(raw.toString("utf8"));
    } catch {
      throw new CommerceError("Invalid webhook.", 400);
    }
    if (!body || typeof body.event !== "string")
      throw new CommerceError("Invalid webhook.", 400);
    if (body.event !== "charge.success")
      return NextResponse.json({ received: true });
    const reference = body.data?.reference;
    if (typeof reference !== "string" || !reference)
      throw new CommerceError("Invalid reference.", 400);
    if (!paymentReferencePattern.test(reference) || referenceMode(reference) !== paymentMode())
      return NextResponse.json({ received: true });
    const db = requireDb();
    const payment = await db.payment.findUnique({
      where: { reference }, select: { orderId: true },
    });
    if (!payment) return NextResponse.json({ received: true });
    const result = await finalizePayment(db, await verifyPayment(reference));
    if (result.paid)
      await sendPaymentEmails(db, payment.orderId);
    return NextResponse.json({ received: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
