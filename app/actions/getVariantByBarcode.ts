"use server";

import { ShopifyClient } from "@/lib/shopify/client";
import { ProductsApi } from "@/lib/shopify/productsApi";
import { ApiResponse } from "@/lib/types/ApiResponse";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { requireSession } from "@/lib/auth/session";

export async function getVariantByBarcode(
  barcode: string
): Promise<ApiResponse<ProductVariant>> {
  try {
    const session = await requireSession();
    const trimmedBarcode = barcode.trim();
    const client = new ShopifyClient(session.accessToken);
    const productApi = new ProductsApi(client);

    const productVariants = await productApi.findVariantsByBarcode(trimmedBarcode);

    // safety net: there should never be more than 1 variant per barcode
    if (productVariants.length > 1) {
      return {
        success: false,
        message: `Error: Multiple variants found with the same barcode (${trimmedBarcode}). Please make the changes in Shopify.`,
        errorCode: "MULTIPLE_VARIANTS",
      };
    }

    if (productVariants.length === 0) {
      return {
        success: false,
        message: `Barcode ${trimmedBarcode} does NOT exist`,
        errorCode: "NOT_FOUND",
      };
    }

    return { success: true, data: productVariants[0] };
  } catch (error) {
    console.error("Error fetching product by barcode:", error);

    if (error instanceof Error) {
      return { success: false, message: error.message, errorCode: "SERVER_ERROR" };
    }

    return { success: false, message: "Erreur serveur", errorCode: "SERVER_ERROR" };
  }
}
