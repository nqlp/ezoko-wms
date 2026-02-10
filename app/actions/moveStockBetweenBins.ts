"use server";

import { cookies } from "next/headers";
import { ApiResponse } from "@/lib/types/ApiResponse";
import { UpdateBinQtyByID } from "./updateBinQty";
import { logMoveMovement } from "@/lib/stockMovement";
import { prisma } from "@/lib/prisma";

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

async function getCurrentUserName(): Promise<string | null> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("wms_session")?.value;

    if (!sessionToken) {
        return null;
    }

    const userSession = await prisma.userSession.findFirst({
        where: {
            sessionToken,
            expiresAt: {
                gte: new Date(),
            },
        },
    });

    return userSession?.shopifyUserName ?? null;
}

export async function moveStockBetweenBins(input: MoveStockInput): Promise<ApiResponse<void>> {
    const {
        sourceBinId,
        sourceBinQtyBefore,
        destinationBinId,
        destinationBinQtyBefore,
        moveQty,
        activity = "MOVEMENT",
    } = input;
    const user = await getCurrentUserName();

    if (!user) {
        return {
            success: false,
            message: "User not authenticated"
        };
    }

    // Calculate quantities after move
    const sourceQtyAfter = sourceBinQtyBefore - moveQty;
    const destQtyAfter = destinationBinQtyBefore + moveQty;

    // Update source bin (decrease)
    const sourceResult = await UpdateBinQtyByID(sourceBinId, sourceQtyAfter);
    if (!sourceResult.success) {
        return {
            success: false,
            message: `Failed to update source bin: ${sourceResult.message}`
        };
    }

    // Update destination bin (increase)
    const destResult = await UpdateBinQtyByID(destinationBinId, destQtyAfter);
    if (!destResult.success) {
        return {
            success: false,
            message: `Failed to update destination bin: ${destResult.message}`
        };
    }
    try {
        // Log to database only if both updates succeeded
        await logMoveMovement({
            activity,
            barcode: input.barcode ?? null,
            variantTitle: input.variantTitle ?? null,
            srcLocation: input.sourceBinName,
            srcQty: input.sourceBinQtyBefore,
            destinationLocation: input.destinationBinName,
            destinationQty: input.destinationBinQtyBefore,
            user: user,
        });
    }
    catch (error) {
        return {
            success: false,
            message: `Failed to log stock movement: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
    return { success: true, data: undefined };
}
