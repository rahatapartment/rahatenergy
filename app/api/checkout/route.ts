import { NextResponse } from "next/server";
import { checkoutSchema, CommerceError } from "@/lib/commerce-validation";
import { createCheckout, beginPayment, orderCookie } from "@/lib/commerce";
import { requireDb, commerceFailure, smallJson } from "@/lib/commerce-http";
import { sameOrigin, limitRequest } from "@/lib/security";
import { testKey, appOrigin } from "@/lib/paystack";
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req))
      throw new CommerceError("Invalid request origin.", 403);
    if (!(await limitRequest("checkout-create", 50, 60000)))
      throw new CommerceError("Please try again shortly.", 429);
    testKey();
    appOrigin();
    const input = checkoutSchema.parse(await smallJson(req));
    const db = requireDb();
    const order = await createCheckout(db, input);
    // Set customer access before payment initialization, including initialization failures.
    let redirectUrl: string | undefined;
    let error: string | undefined;
    try {
      redirectUrl = await beginPayment(db, order.id);
    } catch (e) {
      error =
        e instanceof CommerceError
          ? e.message
          : "Payment initialization was interrupted. Check your order status.";
    }
    const res = NextResponse.json(
      {
        reference: order.reference,
        orderUrl: `/orders/${order.reference}`,
        redirectUrl,
        error,
      },
      {
        status: redirectUrl ? 200 : 409,
        headers: { "Cache-Control": "no-store" },
      },
    );
    res.cookies.set(orderCookie(order.reference), input.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 3600,
    });
    return res;
  } catch (e) {
    return commerceFailure(e);
  }
}
