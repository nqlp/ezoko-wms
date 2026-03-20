/**
 * Server-side Stock Movement Logging
 *
 * Single entry point for all stock movement logs.
 * For client-side (Shopify Extension) logging,
 * use the API endpoint /api/stock-movements-logs instead.
 */

import { Activity } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { StockMovementLogInput } from "@/lib/validation/stockMovement";

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Write a single stock movement log entry.
 * Works for all activity types: MOVEMENT, PUTAWAY, CORRECTION,
 * GOODS_RECEIPT, etc.
 */
export async function writeStockMovementLog(
    input: StockMovementLogInput
): Promise<void> {
    try {
        await prisma.stockMovementLog.create({
            data: {
                activity: input.activity as Activity,
                barcode: input.barcode ?? null,
                variantTitle: input.variantTitle ?? null,
                srcLocation: input.srcLocation ?? null,
                srcQty: input.srcQty ?? null,
                destinationLocation: input.destinationLocation ?? null,
                destinationQty: input.destinationQty ?? null,
                referenceDoc: input.referenceDoc ?? null,
                user: input.user ?? null,
            },
        });
    } catch (error) {
        console.error("Error logging stock movement:", error);
        throw error;
    }
}