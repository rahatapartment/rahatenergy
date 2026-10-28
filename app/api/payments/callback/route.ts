export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { verifyPayment, appOrigin } from "@/lib/paystack";
import { finalizePayment } from "@/lib/commerce";
import { requireDb, commerceFailure } from "@/lib/commerce-http";
import { processNotifications } from "@/lib/notifications";
export async function GET(req: Request) {
  let origin: string;
  try {
    origin = appOrigin();
  } catch (e) {
    return commerceFailure(e);
  }
  const reference = new URL(req.url).searchParams.get("reference");
  let target = "/track-order";
  try {
    if (!reference || !/^REPAY-[a-f0-9]{32}$/.test(reference))
      return NextResponse.redirect(new URL(target, origin));
    const db = requireDb();
    const payment = await db.payment.findUnique({
      where: { reference },
      include: { order: { select: { reference: true } } },
    });
    if (!payment) return NextResponse.redirect(new URL(target, origin));
    target = `/orders/${payment.order.reference}`;
    await finalizePayment(db, await verifyPayment(reference));
    await processNotifications(db, 1).catch(() => undefined);
  } catch {
    /* The order page displays persisted status and offers server verification again. */
  }
  const res = NextResponse.redirect(new URL(target, origin));
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
