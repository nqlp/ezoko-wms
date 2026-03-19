"use server";

import { ShopifyClient } from "@/lib/shopify/client";
import { ProductsApi } from "@/lib/shopify/productsApi";
import { ApiResponse } from "@/lib/types/ApiResponse";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { requireSession } from "@/lib/auth/session";
import { validateBarcodeLookup } from "@/lib/barcode/validation";

export async function getVariantByBarcode(
  barcode: string
): Promise<ApiResponse<ProductVariant>> {
  try {
    const trimmedBarcode = barcode.trim();
    await requireSession();
    const client = new ShopifyClient();
    const productApi = new ProductsApi(client);

    const productVariants = await productApi.findVariantsByBarcode(trimmedBarcode);

    return validateBarcodeLookup(productVariants, trimmedBarcode);

  } catch (error) {
    console.error("Error fetching product by barcode:", error);

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        errorCode: "SERVER_ERROR",
      };
    }

    return {
      success: false,
      message: "Erreur serveur",
      errorCode: "SERVER_ERROR",
    };
  }
}