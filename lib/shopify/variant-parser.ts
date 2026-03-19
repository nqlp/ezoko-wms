import type { StockLocation } from "@/lib/types/StockLocation";
import type { MetaobjectFieldWithReference } from "@/lib/types/MetaobjectField";
import type { VariantWithStock } from "@/lib/types/VariantWithStock";
import type { ProductVariant } from "@/lib/types/ProductVariant";

// ─── Bin stock parsing ──────────────────────────────────────────────

/**
 * Resolve the human-readable bin name from a bin_qty metaobject's fields.
 * Tries: referenced bin_location value → reference handle → fallback handle.
 */
function getBinName(
    fields: MetaobjectFieldWithReference[],
    fallbackHandle: string
): string {
    const binField = fields.find((field) => field.key === "bin_location");
    const referenceFields = binField?.reference?.fields ?? [];
    const referenceValue =
        referenceFields.find((field) => field.key === "bin_location")?.value ??
        referenceFields.find((field) => field.key === "bin")?.value;

    if (referenceValue?.trim()) {
        return referenceValue.trim();
    }

    if (binField?.reference?.handle) {
        return binField.reference.handle;
    }

    return fallbackHandle || "Unknown";
}

/**
 * Extract StockLocation[] from a variant's warehouse_stock metafield.
 * Pure transform — no API calls, no side effects.
 */
export function parseBinStock(variant: VariantWithStock): StockLocation[] {
    const stockMetafield = variant.metafields?.nodes.find(
        (node) => node.key === "warehouse_stock"
    );
    const stockNodes = stockMetafield?.references?.nodes || [];

    const binQty: StockLocation[] = [];

    for (const edge of stockNodes) {
        const stockEntry = edge.fields;
        const binName = getBinName(stockEntry, edge.handle);
        const qtyField = stockEntry.find((field) => field.key === "qty");
        const parsedQty = Number.parseFloat(qtyField?.value ?? "0");
        const qty = Number.isFinite(parsedQty) ? parsedQty : 0;

        binQty.push({
            id: edge.id,
            binLocation: binName,
            qty,
        });
    }

    return binQty;
}

/**
 * Transform a raw Shopify variant (with metafields) into a ProductVariant
 * with parsed binQty attached
 */
export function toProductVariant(variant: VariantWithStock): ProductVariant {
    return {
        ...variant,
        binQty: parseBinStock(variant),
    };
}

// ─── Image resolution ───────────────────────────────────────────────

/**
 * Extract the best image URL for a variant
 * Priority: variant media → product featured image → null
 */
export function extractVariantImage(variant: ProductVariant): string | null {
    const variantImage = variant.media?.nodes?.[0]?.image?.url;
    if (variantImage) {
        return variantImage;
    }
    const productImage = variant.product?.featuredMedia?.image?.url;
    if (productImage) {
        return productImage;
    }
    return null;
}