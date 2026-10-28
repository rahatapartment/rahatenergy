import type { PrismaClient } from "@prisma/client";
import { catalogue } from "./catalogue";
export async function seedCatalogue(db: PrismaClient) {
  await db.$transaction(async (tx) => {
    await tx.product.createMany({
      data: catalogue.map((p) => ({ id: p.id, sku: p.sku })),
      skipDuplicates: true,
    });
    await tx.inventory.createMany({
      data: catalogue.map((p) => ({ productId: p.id })),
      skipDuplicates: true,
    });
  });
}
