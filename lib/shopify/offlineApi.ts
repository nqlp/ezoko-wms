import "server-only";

import { runShopifyGraphqlOffline } from "@/lib/shopify/graphql";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { StockLocation } from "@/lib/types/StockLocation";
import { VariantWithStock } from "@/lib/types/VariantWithStock";
import { MetaobjectUpdatePayload } from "@/lib/types/ShopifyPayload";
import { InventorySetQuantitiesPayload } from "@/lib/types/InventorySetQuantities";
import { resolveBinName } from "@/shared/utils/metaobject";

import {
    findVariantsByBarcodeService,
    updateMetaobjectQtyService,
    syncShopifyInventoryService
} from "@/features/inventory/services/inventoryService";

// ============================================================================
// API Wrappers
// ============================================================================

export async function findVariantsByBarcode(
    barcode: string
): Promise<ProductVariant[]> {
    return findVariantsByBarcodeService(barcode, runShopifyGraphqlOffline);
}

export async function updateMetaobjectQty(
    id: string,
    newQty: string,
    accessTokenOverride?: string
): Promise<MetaobjectUpdatePayload> {
    return updateMetaobjectQtyService(id, newQty, runShopifyGraphqlOffline, accessTokenOverride);
}

export async function syncShopifyInventoryQty(
    inventoryItemId: string,
    locationId: string,
    onHandQty: number
): Promise<InventorySetQuantitiesPayload> {
    return syncShopifyInventoryService(inventoryItemId, locationId, onHandQty, runShopifyGraphqlOffline);
}

// ============================================================================
// Pure Transformers
// ============================================================================

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

export function toProductVariant(variant: VariantWithStock): ProductVariant {
    return {
        ...variant,
        binQty: parseBinStock(variant),
    };
}

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