import { NextResponse } from "next/server";
import {
  adminMutation,
  commerceFailure,
  requireDb,
  smallJson,
} from "@/lib/commerce-http";
import {
  productContentSchema,
  updateProductContent,
} from "@/lib/product-content";
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const actor = await adminMutation(req, "products.edit");
    const input = productContentSchema.parse(await smallJson(req));
    const saved = await requireDb().$transaction((tx) =>
      updateProductContent(tx, params.id, input, actor.id),
    );
    return NextResponse.json({ ok: true, version: saved.version });
  } catch (e) {
    return commerceFailure(e);
  }
}
