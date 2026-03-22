export interface SkuValidationMatch {
    variantId: string;
    sku: string;
    productId: string;
    productTitle: string;
    variantTitle: string;
}

/**
 * Interprets the result of a SKU lookup.
 * Returns the single match or an error message.
 * Centralizes the 0/1/>1 match logic used by both form validation and CSV import.
 */
export function interpretSkuMatches(
    matches: SkuValidationMatch[]
): { success: true; match: SkuValidationMatch } | { success: false; error: string } {
    if (matches.length === 0) {
        return { success: false, error: "SKU not found in Shopify variants" };
    }
    if (matches.length > 1) {
        return { success: false, error: "SKU matched multiple variants" };
    }
    const match = matches[0];
    if (!match) {
        return { success: false, error: "SKU validation returned no match" };
    }
    return { success: true, match };
}
