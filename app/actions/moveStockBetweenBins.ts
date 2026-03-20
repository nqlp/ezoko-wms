"use server";

import { ApiResponse } from "@/lib/types/ApiResponse";
import { UpdateBinQtyByID } from "./updateBinQty";
import { writeStockMovementLog } from "@/lib/activityLog";
import { requireSession } from "@/lib/auth/session";

interface MoveStockInput {
    sourceBinId: string;
    sourceBinName: string;
    sourceBinQtyBefore: number;
    destinationBinId: string;
    destinationBinName: string;
    destinationBinQtyBefore: number;
    moveQty: number;
    barcode?: string;
    variantTitle?: string;
    activity?: "MOVEMENT" | "PUTAWAY";
}

export async function moveStockBetweenBins(input: MoveStockInput): Promise<ApiResponse<void>> {
    const {
        sourceBinId,
        sourceBinName,
        sourceBinQtyBefore,
        destinationBinId,
        destinationBinName,
        destinationBinQtyBefore,
        moveQty,
        activity = "MOVEMENT",
    } = input;

    const session = await requireSession();

    if (!session) {
        return {
            success: false,
            message: "User not authenticated",
        };
    }
    const user = session.shopifyUserName;

    const sourceQtyAfter = sourceBinQtyBefore - moveQty;
    const destQtyAfter = destinationBinQtyBefore + moveQty;

    // Update source bin (decrease)
    const sourceResult = await UpdateBinQtyByID(sourceBinId, sourceQtyAfter);
    if (!sourceResult.success) {
        return {
            success: false,
            message: `Failed to update source bin: ${sourceResult.message}`,
        };
    }

    // Update destination bin (increase)
    const destResult = await UpdateBinQtyByID(destinationBinId, destQtyAfter);
    if (!destResult.success) {
        // Rollback: restore source bin to its original quantity
        const rollback = await UpdateBinQtyByID(sourceBinId, sourceBinQtyBefore);

        if (!rollback.success) {
            // Worst case: rollback also failed — log the inconsistency
            console.error(
                `[CRITICAL] Stock inconsistency: source bin ${sourceBinName} (${sourceBinId}) ` +
                `was decremented to ${sourceQtyAfter} but destination ${destinationBinName} (${destinationBinId}) ` +
                `update failed, AND rollback failed. Manual correction needed. ` +
                `Original source qty: ${sourceBinQtyBefore}`
            );
            return {
                success: false,
                message:
                    `Failed to update destination bin AND failed to rollback source bin. ` +
                    `Source ${sourceBinName} may show ${sourceQtyAfter} instead of ${sourceBinQtyBefore}. ` +
                    `Please verify and correct manually.`,
            };
        }

        return {
            success: false,
            message: `Failed to update destination bin: ${destResult.message}. Source bin was rolled back.`,
        };
    }
    
    try {
        // Log to database only if both updates succeeded
        await writeStockMovementLog({
            activity,
            barcode: input.barcode ?? null,
            variantTitle: input.variantTitle ?? null,
            srcLocation: sourceBinName,
            srcQty: sourceBinQtyBefore,
            destinationLocation: destinationBinName,
            destinationQty: destinationBinQtyBefore,
            user,
        });
    } catch (error) {
        console.error(
            `[WARNING] Stock moved from ${sourceBinName} to ${destinationBinName} (qty: ${moveQty}) ` +
            `but logging failed:`,
            error
        );

        return {
            success: true,
            data: undefined,
        };
    }

    return {
        success: true,
        data: undefined,
    };
}