"use server";

import { ShopifyClient } from "@/lib/shopify/client";
import { ProductsApi } from "@/lib/shopify/productsApi";
import { ApiResponse } from "@/lib/types/ApiResponse";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { requireSession } from "@/lib/auth/session";

export async function getVariantById(
    variantId: string
): Promise<ApiResponse<ProductVariant>> {
    try {
        const session = await requireSession();
        const client = new ShopifyClient(session.accessToken);
        const productApi = new ProductsApi(client);

        // Use the same method but query by ID instead of barcode
        const productVariants = await productApi.findVariantsByBarcode(`id:${variantId}`);

        if (productVariants.length === 0) {
            return {
                success: false,
                message: "Variant not found",
            };
        }

        return {
            success: true,
            data: productVariants[0]
        };
        
    } catch (error) {
        console.error("Error fetching product by ID:", error);

        if (error instanceof Error) {
            return {
                success: false,
                message: error.message
            };
        }

        return {
            success: false,
            message: "Server error"
        };
    }
}
