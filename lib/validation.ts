import { z } from "zod";
import { catalogue } from "./catalogue";
export const quoteSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(7).max(30),
    productId: z
      .string()
      .refine(
        (id) => id === "" || catalogue.some((p) => p.id === id),
        "Unknown product",
      ),
    quantity: z.number().int().min(1).max(10000),
    location: z.string().trim().min(2).max(200),
    requirements: z.string().trim().min(10).max(5000),
    notes: z.string().trim().max(2000).optional(),
    consent: z.literal(true),
  })
  .strict();
export const inventorySchema = z
  .object({
    priceKobo: z.number().int().min(1).max(2_000_000_000).nullable(),
    stock: z.number().int().min(0).max(1_000_000),
    lowStockThreshold: z.number().int().min(0).max(1_000_000),
    enabled: z.boolean(),
    version: z.number().int().min(0),
    reason: z.string().trim().min(5).max(500),
  })
  .strict();
