import { auditCreate } from "@/lib/audit";
import { z } from "zod";
import type { Prisma, ProductContent } from "@prisma/client";
import { catalogue, categories, type ProductDefinition } from "./catalogue";
import { CommerceError } from "./commerce-validation";

const suppliedImages = new Set(catalogue.flatMap((p) => p.images));
export const productContentSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().min(10).max(3000),
    category: z.enum(categories),
    images: z
      .array(
        z
          .string()
          .max(500)
          .refine(
            (src) =>
              suppliedImages.has(src) ||
              /^\/api\/product-images\/[a-f0-9]{64}$/.test(src),
            "Choose an uploaded product image",
          ),
      )
      .min(1)
      .max(20)
      .refine(
        (images) => new Set(images).size === images.length,
        "Remove duplicate images",
      ),
    specifications: z
      .record(
        z.string().trim().min(1).max(100),
        z.string().trim().min(1).max(500),
      )
      .refine((value) => Object.keys(value).length <= 30),
    seoTitle: z.string().trim().min(2).max(150),
    seoDescription: z.string().trim().min(10).max(300),
    version: z.number().int().min(0),
    reason: z.string().trim().min(5).max(500),
  })
  .strict();
export function withProductContent(
  product: ProductDefinition,
  content?: ProductContent | null,
): ProductDefinition {
  if (!content) return product;
  return {
    ...product,
    name: content.name,
    description: content.description,
    category: content.category,
    images: content.images,
    specifications: content.specifications as Record<string, string>,
    seo: { title: content.seoTitle, description: content.seoDescription },
  };
}
export async function updateProductContent(
  tx: Prisma.TransactionClient,
  id: string,
  input: z.infer<typeof productContentSchema>,
  actor: string,
) {
  if (!catalogue.some((p) => p.id === id))
    throw new CommerceError("Unknown product.", 404);
  await tx.$queryRaw`SELECT "id" FROM "Product" WHERE "id"=${id} FOR UPDATE`;
  const current = await tx.productContent.findUnique({
    where: { productId: id },
  });
  if ((current?.version ?? 0) !== input.version)
    throw new CommerceError(
      "This product changed. Refresh before saving.",
      409,
    );
  const imageIds = input.images
    .filter((src) => src.startsWith("/api/product-images/"))
    .map((src) => src.split("/").pop()!);
  if (
    imageIds.length &&
    (await tx.productImage.count({ where: { id: { in: imageIds } } })) !==
      imageIds.length
  )
    throw new CommerceError("One or more uploaded images are unavailable.");
  const { version, reason, ...values } = input;
  const saved = await tx.productContent.upsert({
    where: { productId: id },
    create: { productId: id, ...values, version: 1 },
    update: { ...values, version: { increment: 1 } },
  });
  await auditCreate(tx, {
    data: {
      actor,
      action: "PRODUCT_CONTENT_UPDATED",
      subject: id,
      data: { reason, before: current, after: saved },
    },
  });
  return saved;
}
