import { inventoryPermissionErrors } from "@/lib/admin-permissions";
import { CommerceError } from "@/lib/commerce-validation";
import { revalidatePath } from "next/cache";
import { auditCreate } from "@/lib/audit";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { adminMutation, commerceFailure, smallJson } from "@/lib/commerce-http";
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
    actor = await adminMutation(req, "inventory.view");
  } catch (e) {
    return commerceFailure(e);
  }
  if (!catalogue.some((p) => p.id === params.id))
    return NextResponse.json(
      { error: "Unknown fixed catalogue identity." },
      { status: 404 },
    );
  let body;
  try {
    body = await smallJson(req);
  } catch (e) {
    return commerceFailure(e);
  }
  const parsed = inventorySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check prices, stock and version." },
      { status: 400 },
    );
  const db = getDb();
  if (!db) return unavailable();
  const { reason: suppliedReason, version, ...values } = parsed.data;
  const reason = suppliedReason || "Inventory updated";
  try {
    const inventory = await db.$transaction(async (tx) => {
      const current = await tx.inventory.findUnique({
        where: { productId: params.id },
      });
      if (!current || current.version !== version) throw new Error("CONFLICT");
      if (inventoryPermissionErrors(actor, current, values).length)
        throw new CommerceError(
          "Your permissions do not allow this inventory change.",
          403,
        );
      if (
        values.stock === current.stock &&
        values.priceKobo === current.priceKobo &&
        values.enabled === current.enabled &&
        values.lowStockThreshold === current.lowStockThreshold
      )
        return current;
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
      await auditCreate(tx, {
        data: {
          actor: actor.id,
          action: "INVENTORY_UPDATE",
          subject: params.id,
          data: { before: current, after: values, reason },
        },
      });
      return tx.inventory.findUniqueOrThrow({
        where: { productId: params.id },
      });
    });
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/shop", "layout");
    return NextResponse.json({ ok: true, inventory });
  } catch (error) {
    if (error instanceof CommerceError) return commerceFailure(error);
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
