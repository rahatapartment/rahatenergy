import { NextResponse } from "next/server";
import { validSignature, verifyPayment } from "@/lib/paystack";
import { finalizePayment } from "@/lib/commerce";
import { requireDb, commerceFailure } from "@/lib/commerce-http";
import { CommerceError } from "@/lib/commerce-validation";
export async function POST(req: Request) {
  try {
    const raw = await req.text();
    if (raw.length > 100000) throw new CommerceError("Webhook too large.", 413);
    if (!validSignature(raw, req.headers.get("x-paystack-signature")))
      throw new CommerceError("Invalid signature.", 401);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      throw new CommerceError("Invalid webhook.", 400);
    }
    if (body.event !== "charge.success")
      return NextResponse.json({ received: true });
    const reference = body.data?.reference;
    if (
      typeof reference !== "string" ||
      !/^REPAY-[a-f0-9]{32}$/.test(reference)
    )
      throw new CommerceError("Invalid reference.", 400);
    const db = requireDb();
    if (!(await db.payment.findUnique({ where: { reference } })))
      return NextResponse.json({ received: true });
    await finalizePayment(db, await verifyPayment(reference));
    return NextResponse.json({ received: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
