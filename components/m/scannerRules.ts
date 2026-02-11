import { StockLocation } from "@/lib/types/StockLocation";

export const RECEIVING_BIN_LOCATION = "receiving";

const BIN_BARCODE_REGEX = /^[a-zA-Z]/;
const PRODUCT_BARCODE_REGEX = /^[0-9]/;

export function trimmedBarcode(barcode: string): string {
    return barcode.trim();
}

export function isBinBarcode(barcode: string): boolean {
    return BIN_BARCODE_REGEX.test(barcode);
}

export function isProductBarcode(barcode: string): boolean {
    return PRODUCT_BARCODE_REGEX.test(barcode);
}

export function findBinByBarcode(
    stockLocation: StockLocation[],
    barcode: string
): StockLocation | null {
    return stockLocation.find(
        (location) => location.binLocation.toLowerCase() === barcode.toLowerCase()
    ) ?? null;
}

export function findReceivingBin(stockLocation: StockLocation[]): StockLocation | null {
    return stockLocation.find(
        (location) => location.binLocation.trim().toLowerCase() === RECEIVING_BIN_LOCATION
    ) ?? null;
}

export function getProductLabel(
    productTitle?: string | null,
    variantTitle?: string | null,
    barcode?: string | null
): string {
    return productTitle || variantTitle || barcode || "";
}