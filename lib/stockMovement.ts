/**
 * Server-side Stock Movement Logging
 * 
 * This module provides direct database access for logging stock movements
 * from Next.js server actions. For client-side (Shopify Extension) logging,
 * use the API endpoint /api/stock-movements instead.
 */

import { Activity } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

type CorrectionLogInput = {
    barcode?: string | null;
    variantTitle?: string | null;
    destinationLocation?: string | null;
    destinationQty?: number | null;
    referenceDoc?: string | null;
    user?: string | null;
};

type MoveLogInput = {
    activity?: Activity;
    barcode?: string | null;
    variantTitle?: string | null;
    srcLocation: string;
    srcQty: number;
    destinationLocation: string;
    destinationQty: number;
    user?: string | null;
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Logs a correction stock movement directly to the database.
 * Use this from server actions where direct DB access is available.
 */
export async function logCorrectionMovement(input: CorrectionLogInput): Promise<void> {
    try {
        await prisma.stockMovementLog.create({
            data: {
                activity: Activity.CORRECTION,
                barcode: input.barcode ?? null,
                variantTitle: input.variantTitle ?? null,
                srcLocation: null,
                srcQty: null,
                destinationLocation: input.destinationLocation ?? null,
                destinationQty: input.destinationQty ?? null,
                referenceDoc: input.referenceDoc ?? null,
                user: input.user ?? null,
            },
        });
    } catch (error) {
        console.error("Error logging correction stock movement:", error);
    }
}

/**
 * Logs a move stock movement directly to the database.
 * Use this from server actions where direct DB access is available.
 */
export async function logMoveMovement(input: MoveLogInput): Promise<void> {
    try {
        await prisma.stockMovementLog.create({
            data: {
                activity: input.activity ?? Activity.MOVEMENT,
                barcode: input.barcode ?? null,
                variantTitle: input.variantTitle ?? null,
                srcLocation: input.srcLocation,
                srcQty: input.srcQty,
                destinationLocation: input.destinationLocation,
                destinationQty: input.destinationQty,
                referenceDoc: null,
                user: input.user ?? null,
            },
        });
    } catch (error) {
        console.error("Error logging move stock movement:", error);
        throw error;
    }
}
