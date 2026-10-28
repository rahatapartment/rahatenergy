import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { adminMutation, commerceFailure } from "@/lib/commerce-http";
import { catalogue } from "@/lib/catalogue";
import { getDb } from "@/lib/db";
import { inventorySchema } from "@/lib/validation";
import { unavailable } from "@/lib/security";
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  let actor;
  try {
    actor = await adminMutation(req);
  } catch (e) {
    return commerceFailure(e);
  }
  if (!catalogue.some((p) => p.id === params.id))
    return NextResponse.json(
      { error: "Unknown fixed catalogue identity." },
      { status: 404 },
    );
  const parsed = inventorySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check prices, stock, version and adjustment reason." },
      { status: 400 },
    );
  const db = getDb();
  if (!db) return unavailable();
  const { reason, version, ...values } = parsed.data;
  try {
    await db.$transaction(async (tx) => {
      const current = await tx.inventory.findUnique({
        where: { productId: params.id },
      });
      if (!current || current.version !== version) throw new Error("CONFLICT");
      if (values.stock < current.reserved) throw new Error("RESERVED");
      if (values.enabled && values.priceKobo === null) throw new Error("PRICE");
      const updated = await tx.inventory.updateMany({
        where: { productId: params.id, version },
        data: { ...values, version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new Error("CONFLICT");
      await tx.inventoryMovement.create({
        data: {
          productId: params.id,
          delta: values.stock - current.stock,
          reason,
          actor: actor.id,
          eventKey: randomUUID(),
        },
      });
      await tx.auditLog.create({
        data: {
          actor: actor.id,
          action: "INVENTORY_UPDATE",
          subject: params.id,
          data: { before: current, after: values, reason },
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (["CONFLICT", "RESERVED", "PRICE"].includes(message))
      return NextResponse.json(
        {
          error:
            message === "CONFLICT"
              ? "Inventory changed. Refresh before saving."
              : message === "RESERVED"
                ? "Stock cannot be below reserved quantity."
                : "Set a valid price before enabling purchases.",
        },
        { status: 409 },
      );
    return unavailable();
  }
}
