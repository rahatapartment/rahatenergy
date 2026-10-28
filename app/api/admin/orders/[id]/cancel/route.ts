import { NextResponse } from "next/server";
import {
  adminMutation,
  requireDb,
  smallJson,
  commerceFailure,
} from "@/lib/commerce-http";
import { cancelOrder } from "@/lib/operations";
import { cancelSchema } from "@/lib/operations-validation";
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const actor = await adminMutation(req, true);
    const input = cancelSchema.parse(await smallJson(req));
    await cancelOrder(
      requireDb(),
      params.id,
      input.referenceConfirmation,
      input.reason,
      actor.id,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
