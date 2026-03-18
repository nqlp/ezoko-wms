import { getVariantByBarcode } from "@/app/actions/getVariantByBarcode";
import { moveStockBetweenBins } from "@/app/actions/moveStockBetweenBins";
import { ApiResponse } from "@/lib/types/ApiResponse";
import { ProductVariant } from "@/lib/types/ProductVariant";
import type { MovementActivity } from "./scannerTypes";

type MoveStockRequest = {
    sourceBinId: string;
    sourceBinName: string;
    sourceBinQtyBefore: number;
    destinationBinId: string;
    destinationBinName: string;
    destinationBinQtyBefore: number;
    moveQty: number;
    barcode?: string;
    variantTitle?: string;
    activity?: MovementActivity;
};

export async function fetchVariantByBarcode(barcode: string): Promise<ApiResponse<ProductVariant>> {
    return getVariantByBarcode(barcode);
}

export async function executeStockMove(input: MoveStockRequest): Promise<ApiResponse<void>> {
    return moveStockBetweenBins(input);
}
