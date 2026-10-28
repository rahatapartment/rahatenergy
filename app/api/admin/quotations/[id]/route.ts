import { NextResponse } from "next/server";
import {
  adminMutation,
  requireDb,
  smallJson,
  commerceFailure,
} from "@/lib/commerce-http";
import { updateQuotation } from "@/lib/operations";
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const actor = await adminMutation(req);
    await updateQuotation(
      requireDb(),
      params.id,
      await smallJson(req),
      actor.id,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
