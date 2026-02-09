"use client";

import { useState } from "react";
import { getVariantByBarcode } from "@/app/actions/getVariantByBarcode";
import { moveStockBetweenBins } from "@/app/actions/moveStockBetweenBins";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { StockLocation } from "@/lib/types/StockLocation";

const DEFAULT_ERROR_HIDE_MS = 3000; // 3 seconds
const DEFAULT_SUCCESS_HIDE_MS = 5000; // 5 seconds

export function useMobileScanner() {
    const [error, setError] = useState<string | null>(null);
    const [errorAutoHideDuration, setErrorAutoHideDuration] = useState<number | undefined>(DEFAULT_ERROR_HIDE_MS);
    const [successAutoHideDuration, setSuccessAutoHideDuration] = useState<number | undefined>(DEFAULT_SUCCESS_HIDE_MS);
    const [inlineMessage, setInlineMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [variant, setVariant] = useState<ProductVariant | null>(null);
    const [stockLocation, setStockLocation] = useState<StockLocation[]>([]);
    const [selectedBins, setSelectedBins] = useState<string[]>([]);
    const [moveQty, setMoveQty] = useState<number>(1);

    const handleMoveQtyChange = (qty: number) => {
        if (!Number.isInteger(qty)) {
            return;
        }
        setMoveQty(Math.max(1, qty));
    };

    const resetScanFeedback = () => {
        setError(null);
        setErrorAutoHideDuration(DEFAULT_ERROR_HIDE_MS);
        setSuccessAutoHideDuration(DEFAULT_SUCCESS_HIDE_MS);
        setInlineMessage(null);
        setSuccessMessage(null);
    };

    const resetVariantSelection = () => {
        setVariant(null);
        setStockLocation([]);
        setSelectedBins([]);
    };

    const clearMoveWorkflow = () => {
        resetVariantSelection();
        setMoveQty(1);
    };

    const handleBinScan = async (barcode: string) => {
        if (!variant || stockLocation.length === 0) {
            setError(`Barcode ${barcode} is NOT a PRODUCT barcode.`);
            return;
        }

        const destinationBin = stockLocation.find(
            (location) => location.binLocation.toLowerCase() === barcode.toLowerCase()
        );

        if (!destinationBin) {
            setError(`Bin location ${barcode} not found`);
            return;
        }

        const sourceId = selectedBins[0];
        const sourceBin = sourceId
            ? stockLocation.find((location) => location.id === sourceId) ?? null
            : null;

        if (!sourceBin) {
            setSelectedBins([destinationBin.id]);
            return;
        }

        if (destinationBin.id === sourceBin.id) {
            setError(`Source bin ${barcode} cannot be the same as destination bin`);
            return;
        }

        if (moveQty > sourceBin.qty) {
            setError(
                `Qty to move ${moveQty} is greater than qty on source bin (${sourceBin.qty})`
            );
            return;
        }

        setLoading(true);
        const moveResult = await moveStockBetweenBins({
            sourceBinId: sourceBin.id,
            sourceBinName: sourceBin.binLocation,
            sourceBinQtyBefore: sourceBin.qty,
            destinationBinId: destinationBin.id,
            destinationBinName: destinationBin.binLocation,
            destinationBinQtyBefore: destinationBin.qty,
            moveQty,
            barcode: variant.barcode,
            variantTitle: variant.title,
        });
        setLoading(false);

        if (!moveResult.success) {
            setError(moveResult.message || "Failed to move stock");
            return;
        }

        setSuccessMessage(
            `Qty of ${moveQty} successfully moved from ${sourceBin.binLocation} to ${destinationBin.binLocation}`
        );
        clearMoveWorkflow();
    };

    const handleProductScan = async (barcode: string) => {
        resetVariantSelection();
        setLoading(true);

        try {
            const response = await getVariantByBarcode(barcode);

            if (response.success) {
                setVariant(response.data);
                setStockLocation(response.data.binQty ?? []);

                if (!response.data.binQty || response.data.binQty.length === 0) {
                    const productTitle = response.data.product?.title;
                    setError(`No Bin location stock for ${productTitle}`);
                }
                return;
            }

            if (response.errorCode === "MULTIPLE_VARIANTS") {
                setInlineMessage(response.message);
                return;
            }

            if (response.errorCode === "NOT_FOUND") {
                setError(response.message);
                setErrorAutoHideDuration(undefined);
                return;
            }

            setError(response.message || "Error scanning barcode");
        } catch {
            setError("Error scanning barcode");
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async (barcode: string) => {
        if (!barcode) return;

        resetScanFeedback();

        // If the barcode starts with a letter, it is a bin location barcode
        if (/^[a-zA-Z]/.test(barcode)) {
            await handleBinScan(barcode);
            return;
        }
        // If the barcode starts with a number, it is a product barcode
        if (/^[0-9]/.test(barcode)) {
            await handleProductScan(barcode);
        }
    };

    const closeError = () => setError(null);
    const closeSuccess = () => setSuccessMessage(null);
    const handleBinSelection = (bins: string[]) => setSelectedBins(bins);

    return {
        closeError,
        closeSuccess,
        error,
        errorAutoHideDuration,
        successAutoHideDuration,
        handleBinSelection,
        handleScan,
        inlineMessage,
        loading,
        moveQty,
        selectedBins,
        setMoveQty: handleMoveQtyChange,
        stockLocation,
        successMessage,
        variant,
    };
}
