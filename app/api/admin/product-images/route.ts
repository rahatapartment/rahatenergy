import { auditCreate } from "@/lib/audit";
import { NextResponse } from "next/server";
import { adminMutation, commerceFailure, requireDb } from "@/lib/commerce-http";
import { CommerceError } from "@/lib/commerce-validation";
import { prepareProductImage, MAX_UPLOAD_BYTES } from "@/lib/product-images";
import { limitRequest } from "@/lib/security";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const actor = await adminMutation(req, "products.edit");
    const db = requireDb();
    if (!(await limitRequest(`product-upload:${actor.id}`, 20, 60_000)))
      throw new CommerceError("Too many uploads. Try again shortly.", 429);
    // Bound the body while streaming, including requests without Content-Length.
    const reader = req.body?.getReader();
    if (!reader) throw new CommerceError("Choose an image.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_UPLOAD_BYTES) {
        await reader.cancel();
        throw new CommerceError("Choose an image smaller than 10 MB.", 413);
      }
      chunks.push(value);
    }
    const image = await prepareProductImage(Buffer.concat(chunks));
    await db.$transaction(async (tx) => {
      await tx.productImage.upsert({
        where: { id: image.id },
        create: image,
        update: {},
      });
      await auditCreate(tx, {
        data: {
          actor: actor.id,
          action: "PRODUCT_IMAGE_UPLOADED",
          subject: image.id,
          data: {
            width: image.width,
            height: image.height,
            bytes: image.data.length,
          },
        },
      });
    });
    return NextResponse.json({
      src: `/api/product-images/${image.id}`,
      width: image.width,
      height: image.height,
      bytes: image.data.length,
    });
  } catch (e) {
    return commerceFailure(e);
  }
}
