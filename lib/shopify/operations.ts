import "server-only";

import { runShopifyGraphqlOffline } from "@/lib/shopify/graphql";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { StockLocation } from "@/lib/types/StockLocation";
import { FIND_VARIANTS_BY_BARCODE_QUERY } from "@/lib/shopify/queries/variantQuery";
import { VariantWithStock } from "@/lib/types/VariantWithStock";
import { MetaobjectUpdatePayload } from "@/lib/types/ShopifyPayload";
import { METAOBJECT_UPDATE_MUTATION } from "@/lib/shopify/mutations/updateMetaobjectQty";
import { InventorySetQuantitiesPayload } from "@/lib/types/InventorySetQuantities";
import { SYNC_SHOPIFY_INVENTORY } from "@/lib/shopify/mutations/updateShopifyInventory";

// ============================================================================
// Variant lookup
// ============================================================================

import { resolveBinName } from "@/shared/utils/metaobject";

function mapVariantWithStock(variant: VariantWithStock): ProductVariant {
    const stockMetafield = variant.metafields?.nodes.find(
        (node) => node.key === "warehouse_stock"
    );
    const stockNodes = stockMetafield?.references?.nodes || [];

    const binQty: StockLocation[] = [];

    for (const edge of stockNodes) {
        const stockEntry = edge.fields;
        const binName = resolveBinName(stockEntry, edge.handle);
        const qtyField = stockEntry.find((field) => field.key === "qty");
        const parsedQty = Number.parseFloat(qtyField?.value ?? "0");
        const qty = Number.isFinite(parsedQty) ? parsedQty : 0;

        binQty.push({
            id: edge.id,
            binLocation: binName,
            qty,
        });
    }

    return {
        ...variant,
        binQty,
    };
}

/**
 * Find product variants by barcode via Shopify GraphQL.
 * Uses the offline access token (DB → env var).
 */
export async function findVariantsByBarcode(
    barcode: string
): Promise<ProductVariant[]> {
    const trimmedBarcode = barcode.trim();

    const result = await runShopifyGraphqlOffline<{
        productVariants: { nodes: VariantWithStock[] };
    }>(FIND_VARIANTS_BY_BARCODE_QUERY, {
        query: `barcode:${trimmedBarcode}`,
    });

    const variants = result.productVariants.nodes;

    if (variants.length === 0) return [];

    return variants.map(mapVariantWithStock);
}

// ============================================================================
// Metaobject quantity update
// ============================================================================

/**
 * Update a bin_qty metaobject's quantity field.
 *
 * @param accessTokenOverride — optional explicit token (skips DB/env resolution)
 */
export async function updateMetaobjectQty(
    id: string,
    newQty: string,
    accessTokenOverride?: string
): Promise<MetaobjectUpdatePayload> {
    return runShopifyGraphqlOffline<MetaobjectUpdatePayload>(
        METAOBJECT_UPDATE_MUTATION,
        { id, fields: [{ key: "qty", value: newQty }] },
        accessTokenOverride
    );
}

// ============================================================================
// Shopify inventory sync
// ============================================================================

/**
 * Sync the total on-hand quantity to Shopify's inventory system.
 */
export async function syncShopifyInventoryQty(
    inventoryItemId: string,
    locationId: string,
    onHandQty: number
): Promise<InventorySetQuantitiesPayload> {
    return runShopifyGraphqlOffline<InventorySetQuantitiesPayload>(
        SYNC_SHOPIFY_INVENTORY,
        { inventoryItemId, locationId, quantity: onHandQty }
    );
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
        const binName = resolveBinName(stockEntry, edge.handle);
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