import { StockLocation } from "@/lib/types/StockLocation";

export const incrementQty = (
    stockLocation: StockLocation[],
    index: number
): StockLocation[] => {
    return stockLocation.map((loc, i) =>
        i === index ? { ...loc, qty: loc.qty + 1 } : loc
    );
};

export const decrementQty = (
    stockLocation: StockLocation[],
    index: number
): StockLocation[] => {
    return stockLocation.map((loc, i) =>
        i === index ? { ...loc, qty: Math.max(0, loc.qty - 1) } : loc
    );
};
