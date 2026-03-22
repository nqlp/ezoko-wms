"use server";

import { findVariantsByBarcode } from "@/lib/shopify/offlineApi";
import { ApiResponse } from "@/lib/types/ApiResponse";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { requireMobileSession } from "@/lib/auth/session";
import { validateBarcodeLookup } from "@/lib/barcode/validation";
import { handleServerActionError } from "@/lib/server-action-utils";

export async function getVariantByBarcode(
  barcode: string
): Promise<ApiResponse<ProductVariant>> {
  try {
    const trimmedBarcode = barcode.trim();

    await requireMobileSession();

    const productVariants = await findVariantsByBarcode(trimmedBarcode);

    return validateBarcodeLookup(productVariants, trimmedBarcode);

  } catch (error) {
    return handleServerActionError(error, "Error fetching product by barcode", "SERVER_ERROR");
  }
}