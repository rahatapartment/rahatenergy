import { z } from "zod";
import { quoteStatuses } from "./operation-rules";
export const quoteUpdateSchema = z
  .object({
    status: z.enum(quoteStatuses),
    internalNotes: z.string().trim().max(5000),
    version: z.number().int().min(0),
    reason: z.string().trim().min(5).max(500),
  })
  .strict();
export const deliveryUpdateSchema = z
  .object({
    status: z.enum([
      "PENDING",
      "PREPARING",
      "READY_FOR_DISPATCH",
      "READY_FOR_PICKUP",
      "DISPATCHED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "FAILED_DELIVERY",
    ]),
    trackingReference: z.string().trim().max(120),
    version: z.number().int().min(0),
    reason: z.string().trim().min(5).max(500),
  })
  .strict();
export const cancelSchema = z
  .object({
    referenceConfirmation: z.string().min(1).max(100),
    reason: z.string().trim().min(10).max(1000),
  })
  .strict();
