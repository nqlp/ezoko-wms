import { z } from "zod";
import { ACTIVITY_TYPES } from "@/lib/constants";

export const stockMovementLogInputSchema = z.object({
  activity: z.enum(ACTIVITY_TYPES),
  barcode: z.string().trim().nullable().optional(),
  variantTitle: z.string().trim().nullable().optional(),
  srcLocation: z.string().trim().nullable().optional(),
  srcQty: z.number().int().nullable().optional(),
  destinationLocation: z.string().trim().nullable().optional(),
  destinationQty: z.number().int().nullable().optional(),
  referenceDoc: z.string().trim().nullable().optional(),
  user: z.string().trim().nullable().optional(),
});

export type StockMovementLogInput = z.infer<typeof stockMovementLogInputSchema>;