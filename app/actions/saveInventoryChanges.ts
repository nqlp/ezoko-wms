"use server";

import { ApiResponse } from "@/lib/types/ApiResponse";
import { StockLocation } from "@/lib/types/StockLocation";
import { syncShopifyInventory } from "./syncShopifyInventory";
import { UpdateBinQtyByID } from "./updateBinQty";
import { logCorrectionMovement } from "@/lib/stockMovement";

interface SaveInventoryChangesResult {
  syncedShopify: boolean;
  updatedBinCount: number;
  onHandQty: number;
}

export async function saveInventoryChanges(
  currentBins: StockLocation[] = [],
  initialBins: StockLocation[] = [],
  inventoryItemId: string | null,
  locationId: string | null,
  shopifyOnHand: number,
  variantId?: string | null,
  barcode?: string | null
): Promise<ApiResponse<SaveInventoryChangesResult>> {

  try {
    const initialQtyByBinId = new Map(initialBins.map((bin) => [bin.id, bin.qty]));
    const changedBins = currentBins.filter((bin) => initialQtyByBinId.get(bin.id) !== bin.qty);
    const sumOfBins = currentBins.reduce((sum, bin) => sum + bin.qty, 0);

    let syncedShopify = false;

    if (sumOfBins !== shopifyOnHand) {
      if (!inventoryItemId || !locationId) {
        return {
          success: false,
          message: "Missing inventory item or location ID for Shopify update.",
        };
      }

      const syncResult = await syncShopifyInventory(inventoryItemId, locationId, sumOfBins);

      if (!syncResult.success) {
        return {
          success: false,
          message: `Failed to sync Shopify inventory: ${syncResult.message}`,
        };
      }

      syncedShopify = true;
    }

    if (changedBins.length > 0) {
      const binUpdateResults = await Promise.all(
        changedBins.map(async (bin) => ({
          bin,
          result: await UpdateBinQtyByID(bin.id, bin.qty),
        }))
      );

      const failedBinUpdates = binUpdateResults.filter((entry) => !entry.result.success);

      if (failedBinUpdates.length > 0) {
        const failedBinLabels = failedBinUpdates.map((entry) => entry.bin.binLocation || entry.bin.id);

        const failureContext = syncedShopify ? "Shopify inventory synced, but bin updates failed" : "Bin updates failed";

        const firstErrorMessage = failedBinUpdates[0].result.success ? "Unknown error" : failedBinUpdates[0].result.message;

        return {
          success: false,
          message: `${failureContext} for: ${failedBinLabels.join(", ")}. First error: ${firstErrorMessage}`,
        };
      }

      await Promise.all(
        binUpdateResults.map(async ({ bin, result }) => {
          if (!result.success) return;
          await logCorrectionMovement({
            barcode,
            destinationLocation: bin.binLocation,
            destinationQty: bin.qty,
          });
        })
      );
    }

    return {
      success: true,
      data: {
        syncedShopify,
        updatedBinCount: changedBins.length,
        onHandQty: sumOfBins,
      },
    };
  } catch (error) {
    console.error("Error saving inventory changes:", error);
    return {
      success: false,
      message: "Failed to save inventory changes.",
    };
  }
}
