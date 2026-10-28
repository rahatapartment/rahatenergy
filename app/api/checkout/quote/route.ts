import { NextResponse } from "next/server";
import { checkoutQuote } from "@/lib/commerce";
import { quoteCheckoutSchema, CommerceError } from "@/lib/commerce-validation";
import { requireDb, commerceFailure, smallJson } from "@/lib/commerce-http";
import { sameOrigin, limitRequest } from "@/lib/security";
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req))
      throw new CommerceError("Invalid request origin.", 403);
    if (!(await limitRequest("checkout-quotes", 120, 60000)))
      throw new CommerceError("Please try again shortly.", 429);
    const input = quoteCheckoutSchema.parse(await smallJson(req));
    const result = await checkoutQuote(
      requireDb(),
      input.lines,
      input.deliveryOptionId,
    );
    return NextResponse.json(
      {
        items: result.items,
        subtotalKobo: result.subtotalKobo,
        deliveryFeeKobo: result.deliveryFeeKobo,
        totalKobo: result.totalKobo,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return commerceFailure(e);
  }
}
