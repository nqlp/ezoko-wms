import "server-only";
import { ShopifyClient } from "@/lib/shopify/client";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { FIND_VARIANTS_BY_BARCODE_QUERY } from "@/lib/shopify/queries/variantQuery";
import { VariantWithStock } from "@/lib/types/VariantWithStock";
import { MetaobjectUpdatePayload } from "../types/ShopifyPayload";
import { METAOBJECT_UPDATE_MUTATION } from "@/lib/shopify/mutations/updateMetaobjectQty";
import { InventorySetQuantitiesPayload } from "../types/InventorySetQuantities";
import { SYNC_SHOPIFY_INVENTORY } from "./mutations/updateShopifyInventory";
import { toProductVariant } from "./variant-parser";

export class ProductsApi {
  private client: ShopifyClient;

  constructor(client: ShopifyClient) {
    this.client = client;
  }

  async findVariantsByBarcode(barcode: string): Promise<ProductVariant[]> {
    const trimmedBarcode = barcode.trim();
    const result = await this.client.query<{
      productVariants: {
        nodes: VariantWithStock[];
      };
    }>(FIND_VARIANTS_BY_BARCODE_QUERY, {
      query: `barcode:${trimmedBarcode}`,
    });

    const variants = result.productVariants.nodes;

    if (variants.length === 0) {
      return [];
    }
    return variants.map(toProductVariant);
  }

  async updateMetaobjectQty(id: string, newQty: string): Promise<MetaobjectUpdatePayload> {
    const result = await this.client.mutate<MetaobjectUpdatePayload>(
      METAOBJECT_UPDATE_MUTATION, { id, fields: [{ key: "qty", value: newQty }] }
    );
    return result;
  }

  async syncShopifyInventory(inventoryItemId: string, locationId: string, onHandQty: number): Promise<InventorySetQuantitiesPayload> {
    const result = await this.client.mutate<InventorySetQuantitiesPayload>(
      SYNC_SHOPIFY_INVENTORY, { inventoryItemId, locationId, quantity: onHandQty }
    );
    return result;
  }
}