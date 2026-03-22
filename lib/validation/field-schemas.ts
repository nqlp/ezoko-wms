import { z } from "zod";

/**
 * Positive integer quantity (>= 1). 
 * Used for order quantities, move quantities, etc.
 * Accepts string input (from forms/CSV) and coerces to number.
 */
export const orderQtySchema = z.coerce.number().int().min(1, "Quantity must be at least 1");

/**
 * Positive integer quantity (>= 1) without coercion.
 * Used when the input is already a number (e.g. from server-side logic).
 */
export const requiredQtySchema = z.number().int().min(1, "Quantity must be at least 1");

/**
 * Optional integer quantity, nullable.
 * Used for optional quantity fields like srcQty, destinationQty in stock movements.
 */
export const optionalQtySchema = z.number().int().nullable().optional();

/**
 * Non-negative monetary value with max 2 decimal places.
 * Used for unit cost, shipping fees, etc.
 * Accepts string input (from forms/CSV) and coerces to number.
 * Normalizes comma decimal separators (e.g. "12,50" → 12.5).
 */

export const moneySchema = z
    .union([z.number(), z.string()])
    .transform((val) => {
        if (typeof val === "string") {
            return Number(val.replace(",", "."));
        }
        return val;
    })
    .pipe(
        z.number()
            .refine(Number.isFinite, "Must be a valid number")
            .min(0, "Must be zero or positive")
            .transform((value) => Math.round((value + Number.EPSILON) * 100) / 100)
    );