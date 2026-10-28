import { createHash } from "node:crypto";
import { z } from "zod";
import { catalogue } from "./catalogue";
export const linesSchema = z
  .array(
    z
      .object({
        productId: z
          .string()
          .refine(
            (id) => catalogue.some((p) => p.id === id),
            "Unknown product",
          ),
        quantity: z.number().int().min(1).max(99),
      })
      .strict(),
  )
  .min(1)
  .max(15)
  .refine(
    (lines) => new Set(lines.map((l) => l.productId)).size === lines.length,
    "Duplicate products",
  );
export const quoteCheckoutSchema = z
  .object({ lines: linesSchema, deliveryOptionId: z.string().min(1).max(100) })
  .strict();
export const checkoutSchema = quoteCheckoutSchema
  .extend({
    checkoutKey: z.string().uuid(),
    accessToken: z.string().regex(/^[a-zA-Z0-9_-]{43}$/),
    expectedTotalKobo: z.number().int().min(1).max(2_000_000_000),
    customer: z
      .object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().toLowerCase().email().max(254),
        phone: z.string().trim().min(7).max(30),
      })
      .strict(),
    address: z
      .object({
        line1: z.string().trim().max(250),
        city: z.string().trim().max(100),
        state: z.string().trim().max(100),
      })
      .strict(),
    consent: z.literal(true),
  })
  .strict();
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export const deliveryOptionSchema = z
  .object({
    label: z.string().trim().min(3).max(100),
    method: z.enum(["DELIVERY", "PICKUP"]),
    state: z.string().trim().max(100).nullable(),
    city: z.string().trim().max(100).nullable(),
    pickupAddress: z.string().trim().max(250).nullable(),
    feeKobo: z.number().int().min(0).max(100_000_000),
    enabled: z.boolean(),
  })
  .strict()
  .refine(
    (v) => (v.method === "PICKUP" ? !!v.pickupAddress : !!v.state),
    "A delivery state or a pickup address is required",
  );
export class CommerceError extends Error {
  constructor(
    message: string,
    public status = 409,
  ) {
    super(message);
  }
}
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex") as string;
