"use server";

import { ApiResponse } from "@/lib/types/ApiResponse";
import { UpdateStockResult } from "@/lib/types/ApiResponse";
import { updateMetaobjectQty } from "@/lib/shopify/offlineApi";
import { handleServerActionError } from "@/lib/server-action-utils";

export async function UpdateBinQtyByID(
    id: string,
    newQty: number,
    accessToken?: string
): Promise<ApiResponse<UpdateStockResult>> {
    try {
        const result = await updateMetaobjectQty(id, newQty.toString(), accessToken);
        
        const updatePayload = result?.metaobjectUpdate;
        const metaobject = updatePayload?.metaobject;
        const error = updatePayload?.userErrors?.[0]?.message;

        if (!metaobject || error) {
            return {
                success: false,
                message: error || "Failed to update bin quantity",
            };
        }

        return {
            success: true,
            data: {
                id: metaobject.id || "",
                displayName: metaobject.displayName || "",
                updatedQty: parseInt(metaobject.field?.value || "0", 10),
            },
        };
    } catch (error) {
        return handleServerActionError(error, "Error updating bin quantity");
    }
}