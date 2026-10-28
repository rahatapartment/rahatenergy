import { NextResponse } from "next/server";
import { z } from "zod";
import { updateFulfillment } from "@/lib/commerce";
import {
  requireDb,
  adminMutation,
  commerceFailure,
  smallJson,
} from "@/lib/commerce-http";
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const actor = await adminMutation(req);
    const { status } = z
      .object({
        status: z.enum([
          "PROCESSING",
          "READY_FOR_PICKUP",
          "DISPATCHED",
          "DELIVERED",
        ]),
      })
      .strict()
      .parse(await smallJson(req));
    await updateFulfillment(requireDb(), params.id, status, actor.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return commerceFailure(e);
  }
}
