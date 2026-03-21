"use server";

import { onlineApi } from "@/lib/shopify/onlineApi";
import { ShopifyClient } from "@/lib/shopify/client";
import { ApiResponse } from "@/lib/types/ApiResponse";

interface SyncShopifyInventoryResult {
  syncedAt: string | null;
}

export async function syncShopifyInventory(
  inventoryItemId: string,
  locationId: string,
  onHandQty: number
): Promise<ApiResponse<SyncShopifyInventoryResult>> {
  try {
    const client = new ShopifyClient();
    const productsApi = new onlineApi(client);

    const result = await productsApi.syncShopifyInventory(inventoryItemId, locationId, onHandQty);
    
    const payload = result?.inventorySetQuantities;
    const error = payload?.userErrors?.[0]?.message;

    if (error) {
      return {
        success: false,
        message: error || "Failed to sync Shopify inventory",
      };
    }

    return {
      success: true,
      data: {
        syncedAt: payload?.inventoryAdjustmentGroup?.createdAt ?? null,
      },
    };
  } catch (error) {
    console.error("Error syncing Shopify inventory:", error);
    return {
      success: false,
      message: "Failed to sync Shopify inventory",
    };
  }
}