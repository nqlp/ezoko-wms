import type { ProductVariant} from "@/lib/types/ProductVariant";
import type { ApiResponse } from "@/lib/types/ApiResponse";

export function validateBarcodeLookup(
    variants: ProductVariant[],
    barcode: string
): ApiResponse<ProductVariant> {
    if (variants.length > 1) {
        return {
            success: false,
            message: `Error: Multiple variants found with the same barcode (${barcode}). Please make the changes in Shopify.`,
            errorCode: "MULTIPLE_VARIANTS",
        };
    }

    if (variants.length === 0) {
        return {
            success: false,
            message: `Barcode ${barcode} does NOT exist`,
            errorCode: "NOT_FOUND",
        };
    }

    return {
        success: true,
        data: variants[0]
    };
}