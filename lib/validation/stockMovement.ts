import { z } from "zod";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { optionalQtySchema } from "@/lib/validation/field-schemas";

export const stockMovementLogInputSchema = z.object({
  activity: z.enum(ACTIVITY_TYPES),
  barcode: z.string().trim().nullable().optional(),
  variantTitle: z.string().trim().nullable().optional(),
  srcLocation: z.string().trim().nullable().optional(),
  srcQty: optionalQtySchema,
  destinationLocation: z.string().trim().nullable().optional(),
  destinationQty: optionalQtySchema,
  referenceDoc: z.string().trim().nullable().optional(),
  user: z.string().trim().nullable().optional(),
});

export type StockMovementLogInput = z.infer<typeof stockMovementLogInputSchema>;