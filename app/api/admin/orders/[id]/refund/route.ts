import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminMutation,
  requireDb,
  smallJson,
  commerceFailure,
} from "@/lib/commerce-http";
import { verifyCompletedRefund } from "@/lib/operations";
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const actor = await adminMutation(req, true);
    const input = z
      .object({ providerRefundId: z.string().regex(/^[1-9][0-9]{0,14}$/) })
      .strict()
      .parse(await smallJson(req));
    await verifyCompletedRefund(
      requireDb(),
      params.id,
      input.providerRefundId,
      actor.id,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
