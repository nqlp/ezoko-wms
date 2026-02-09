import "server-only";
import { ShopifyClient } from "@/lib/shopify/client";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { StockLocation } from "@/lib/types/StockLocation";
import { FIND_VARIANTS_BY_BARCODE_QUERY } from "@/lib/shopify/queries/variantQuery";
import { VariantWithStock } from "@/lib/types/VariantWithStock";
import { MetaobjectField } from "@/lib/types/MetaobjectField";
import { MetaobjectUpdatePayload } from "../types/ShopifyPayload";
import { UPDATE_METAOBJECT_QTY } from "@/lib/shopify/mutations/updateMetaobjectQty";
import { InventorySetQuantitiesPayload } from "../types/InventorySetQuantities";
import { SYNC_SHOPIFY_INVENTORY } from "./mutations/updateShopifyInventory";

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

    if (variants.length === 0) return [];

    const variantsWithStock = variants.map((variant) => {
      const stockMetafield = variant.metafields?.nodes.find(
        (node) => node.key === "warehouse_stock"
      );
      const stockNodes = stockMetafield?.references?.nodes || [];

      const binQty: StockLocation[] = [];

      const getBinName = (fields: MetaobjectField[], fallbackHandle: string) => {
        const binField = fields.find((field) => field.key === "bin_location");
        const referenceFields = binField?.reference?.fields ?? [];
        const referenceValue =
          referenceFields.find((field) => field.key === "bin_location")?.value ??
          referenceFields.find((field) => field.key === "bin")?.value;

        if (referenceValue?.trim()) {
          return referenceValue.trim();
        }

        else if (binField?.reference?.handle) {
          return binField.reference.handle;
        }

        return fallbackHandle || "Unknown";
      };

      for (const edge of stockNodes) {
        const stockEntry = edge.fields;
        const binName = getBinName(stockEntry, edge.handle);
        const qtyField = stockEntry.find((field) => field.key === "qty");
        const parsedQty = Number.parseFloat(qtyField?.value ?? "0");
        const qty = Number.isFinite(parsedQty) ? parsedQty : 0;

        binQty.push({
          id: edge.id,
          binLocation: binName,
          qty: qty,
        });
      }

      return {
        ...variant,
        binQty: binQty,
      };
    });

    return variantsWithStock;
  }

  async updateMetaobjectQty(id: string, newQty: string): Promise<MetaobjectUpdatePayload> {
    const result = await this.client.mutate<MetaobjectUpdatePayload>(
      UPDATE_METAOBJECT_QTY, { id, newQty }
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