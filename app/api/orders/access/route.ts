import { NextResponse } from "next/server";
import { z } from "zod";
import { hashToken, CommerceError } from "@/lib/commerce-validation";
import { orderCookie } from "@/lib/commerce";
import { requireDb, commerceFailure, smallJson } from "@/lib/commerce-http";
import { sameOrigin, limitRequest } from "@/lib/security";
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req))
      throw new CommerceError("Invalid request origin.", 403);
    if (!(await limitRequest("order-access", 20, 60000)))
      throw new CommerceError("Please try again in a minute.", 429);
    const input = z
      .object({
        reference: z.string().regex(/^RE-[A-F0-9]{20}$/),
        accessToken: z.string().regex(/^[a-zA-Z0-9_-]{43}$/),
      })
      .strict()
      .parse(await smallJson(req));
    const order = await requireDb().order.findFirst({
      where: {
        reference: input.reference,
        accessTokenHash: hashToken(input.accessToken),
      },
      select: { reference: true },
    });
    if (!order)
      throw new CommerceError(
        "The reference and access code could not be verified.",
        404,
      );
    const res = NextResponse.json({ url: `/orders/${order.reference}` });
    res.cookies.set(orderCookie(order.reference), input.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e) {
    return commerceFailure(e);
  }
}
