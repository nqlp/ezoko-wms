import type { StockLocation } from "@/lib/types/StockLocation";
import type { ScannerMode } from "./scannerTypes";
import { findReceivingBin, getProductLabel } from "../scannerRules";

interface ResolveSourceInput {
    mode: ScannerMode;
    stockLocation: StockLocation[];
    selectedBins: string[];
    destinationBinId: string;
    productTitle?: string;
    variantTitle?: string;
    barcode: string;
}

/**
 * Resolves which bin is the source for the move
 * Putaway = always RECEIVING bin
 * Move = manually selected bin
 */
export function resolveSourceBin(
    input: ResolveSourceInput
): { sourceBin: StockLocation } | { error: string } | { selectBinId: string } {
    const { mode, stockLocation, selectedBins } = input;

    if (mode === "putaway") {
        const receivingBin = findReceivingBin(stockLocation);
        if (!receivingBin || receivingBin.qty <= 0) {
            const label = getProductLabel(input.productTitle, input.variantTitle, input.barcode);
            return {
                error: `No stock on RECEIVING for PRODUCT ${label}`
            };
        }
        return {
            sourceBin: receivingBin
        };
    }

    // Move mode — source is the selected bin
    const sourceId = selectedBins[0];
    if (!sourceId) {
        return { selectBinId: input.destinationBinId };
    }

    const sourceBin = stockLocation.find((loc) => loc.id === sourceId) ?? null;
    if (!sourceBin) {
        return {
            error: "Selected source bin not found"
        };
    }

    return {
        sourceBin
    };
}

interface ValidateMoveInput {
    sourceBin: StockLocation;
    destinationBin: StockLocation;
    moveQty: number;
}

/**
 * Validates that a stock move is allowed
 * Pure function — no side effects, no dispatch
 */
export function validateMove(input: ValidateMoveInput): string | null {
    const { sourceBin, destinationBin, moveQty } = input;

    if (destinationBin.id === sourceBin.id) {
        return `Source bin ${sourceBin.binLocation} cannot be the same as destination bin`;
    }

    if (moveQty > sourceBin.qty) {
        return `Qty to move ${moveQty} is greater than qty on source bin (${sourceBin.qty})`;
    }

    return null; // valid
}