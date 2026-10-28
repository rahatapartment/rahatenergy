import { NextResponse } from "next/server";
import { z } from "zod";
import { CommerceError, hashToken } from "@/lib/commerce-validation";
import { orderCookie } from "@/lib/commerce";
import { requireDb, commerceFailure, smallJson } from "@/lib/commerce-http";
import { sameOrigin, limitRequest } from "@/lib/security";
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req))
      throw new CommerceError("Invalid request origin.", 403);
    if (!(await limitRequest("checkout-resume", 30, 60000)))
      throw new CommerceError("Please try again shortly.", 429);
    const input = z
      .object({
        checkoutKey: z.string().uuid(),
        accessToken: z.string().regex(/^[a-zA-Z0-9_-]{43}$/),
      })
      .strict()
      .parse(await smallJson(req));
    const order = await requireDb().order.findFirst({
      where: {
        checkoutKey: input.checkoutKey,
        accessTokenHash: hashToken(input.accessToken),
      },
      select: { reference: true },
    });
    if (!order)
      throw new CommerceError(
        "No saved order was found for this attempt.",
        404,
      );
    const res = NextResponse.json(
      { url: `/orders/${order.reference}` },
      { headers: { "Cache-Control": "no-store" } },
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
