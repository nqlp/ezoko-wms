import { MetaobjectUpdatePayload } from "@/lib/types/ShopifyPayload";
import { InventorySetQuantitiesPayload } from "@/lib/types/InventorySetQuantities";
import { FIND_VARIANTS_BY_BARCODE_QUERY } from "@/lib/shopify/queries/variantQuery";
import { VariantWithStock } from "@/lib/types/VariantWithStock";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { toProductVariant } from "@/lib/shopify/offlineApi";
import { METAOBJECT_UPDATE_MUTATION, INVENTORY_SET_QUANTITIES_MUTATION as SYNC_SHOPIFY_INVENTORY } from "@shared/graphql/mutations";

export type MutateFunction = <T>(query: string, variables: any, tokenOverride?: string) => Promise<T>;
export type QueryFunction = <T>(query: string, variables: any) => Promise<T>;

export async function findVariantsByBarcodeService(
    barcode: string,
    queryClient: QueryFunction
): Promise<ProductVariant[]> {
    const trimmedBarcode = barcode.trim();
    const result = await queryClient<{
        productVariants: { nodes: VariantWithStock[] };
    }>(FIND_VARIANTS_BY_BARCODE_QUERY, {
        query: `barcode:${trimmedBarcode}`,
    });

    const variants = result.productVariants.nodes;
    if (variants.length === 0) return [];

    return variants.map(toProductVariant);
}

export async function updateMetaobjectQtyService(
    id: string,
    newQty: string,
    mutateClient: MutateFunction,
    tokenOverride?: string
): Promise<MetaobjectUpdatePayload> {
    return mutateClient<MetaobjectUpdatePayload>(
        METAOBJECT_UPDATE_MUTATION,
        { id, fields: [{ key: "qty", value: newQty }] },
        tokenOverride
    );
}

export async function syncShopifyInventoryService(
    inventoryItemId: string,
    locationId: string,
    onHandQty: number,
    mutateClient: MutateFunction
): Promise<InventorySetQuantitiesPayload> {
    return mutateClient<InventorySetQuantitiesPayload>(
        SYNC_SHOPIFY_INVENTORY,
        { inventoryItemId, locationId, quantity: onHandQty }
    );
}