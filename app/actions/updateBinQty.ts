"use server";

import { ProductsApi } from "@/lib/shopify/productsApi";
import { ShopifyClient } from "@/lib/shopify/client";
import { ApiResponse } from "@/lib/types/ApiResponse";
import { UpdateStockResult } from "@/lib/types/ApiResponse";

export async function UpdateBinQtyByID(id: string, newQty: number, accessToken?: string): Promise<ApiResponse<UpdateStockResult>> {
    try {
        const client = new ShopifyClient(accessToken);
        const productsApi = new ProductsApi(client);

        const result = await productsApi.updateMetaobjectQty(id, newQty.toString());
        const updatePayload = result.metaobjectUpdate;
        const metaobject = updatePayload.metaobject;
        const error = updatePayload.userErrors[0]?.message;

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
        console.error("Error updating bin quantity:", error);
        return {
            success: false,
            message: "Failed to update bin quantity",
        };
    }
}

