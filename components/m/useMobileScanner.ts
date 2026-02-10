"use client";

import { useState } from "react";
import { getVariantByBarcode } from "@/app/actions/getVariantByBarcode";
import { moveStockBetweenBins } from "@/app/actions/moveStockBetweenBins";
import { ProductVariant } from "@/lib/types/ProductVariant";
import { StockLocation } from "@/lib/types/StockLocation";

const DEFAULT_ERROR_HIDE_MS = 3000; // 3 seconds
const DEFAULT_SUCCESS_HIDE_MS = 5000; // 5 seconds
const RECEIVING_BIN_LOCATION = "receiving";
type ScannerMode = "move" | "putaway";

export function useMobileScanner(mode: ScannerMode) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorAutoHideDuration, setErrorAutoHideDuration] = useState<number | undefined>(DEFAULT_ERROR_HIDE_MS);
    const [successAutoHideDuration, setSuccessAutoHideDuration] = useState<number | undefined>(DEFAULT_SUCCESS_HIDE_MS);
    const [inlineErrorMessage, setInlineErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [variant, setVariant] = useState<ProductVariant | null>(null);
    const [stockLocation, setStockLocation] = useState<StockLocation[]>([]);
    const [selectedBins, setSelectedBins] = useState<string[]>([]);
    const [moveQty, setMoveQty] = useState<number>(1);
    const [currentProductBarcode, setCurrentProductBarcode] = useState<string | null>(null);

    const handleMoveQtyChange = (qty: number) => {
        if (!Number.isInteger(qty)) {
            return;
        }
        setMoveQty(Math.max(1, qty));
    };

    const resetScanFeedback = () => {
        setErrorMessage(null);
        setErrorAutoHideDuration(DEFAULT_ERROR_HIDE_MS);
        setSuccessAutoHideDuration(DEFAULT_SUCCESS_HIDE_MS);
        setInlineErrorMessage(null);
        setSuccessMessage(null);
    };

    const resetVariantSelection = () => {
        setVariant(null);
        setStockLocation([]);
        setSelectedBins([]);
        setCurrentProductBarcode(null);
    };

    const clearMoveWorkflow = () => {
        resetVariantSelection();
        setMoveQty(1);
    };

    const handleBinScan = async (barcode: string) => {
        if (!variant || stockLocation.length === 0) {
            setErrorMessage(`Barcode ${barcode} is NOT a PRODUCT barcode.`);
            return;
        }

        const destinationBin = stockLocation.find(
            (location) => location.binLocation.toLowerCase() === barcode.toLowerCase()
        );

        if (!destinationBin) {
            setErrorMessage(`Only source bin could be scanned at this point. ${barcode} is not a source bin.`);
            return;
        }

        const receivingBin = stockLocation.find(
            (location) => location.binLocation.trim().toLowerCase() === RECEIVING_BIN_LOCATION
        ) ?? null;

        const sourceId = selectedBins[0];
        const sourceBin = mode === "putaway"
            ? receivingBin
            : (sourceId
                ? stockLocation.find((location) => location.id === sourceId) ?? null
                : null);

        if (!sourceBin) {
            if (mode === "putaway") {
                const productLabel = variant.product?.title || variant.title || barcode;
                setErrorMessage(`No stock on RECEIVING for PRODUCT ${productLabel}`);
                return;
            }

            setSelectedBins([destinationBin.id]);
            return;
        }

        if (mode === "putaway" && selectedBins[0] !== sourceBin.id) {
            setSelectedBins([sourceBin.id]);
        }

        if (destinationBin.id === sourceBin.id) {
            setErrorMessage(`Source bin ${sourceBin.id} cannot be the same as destination bin`);
            return;
        }

        if (moveQty > sourceBin.qty) {
            setErrorMessage(
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
            activity: mode === "putaway" ? "PUTAWAY" : "MOVEMENT",
        });
        setLoading(false);

        if (!moveResult.success) {
            setErrorMessage(moveResult.message || "Failed to move stock");
            return;
        }

        setSuccessMessage(
            `Qty of ${moveQty} successfully moved from ${sourceBin.binLocation} to ${destinationBin.binLocation}`
        );
        clearMoveWorkflow();
    };

    const handleProductScan = async (barcode: string) => {
        const trimmedBarcode = barcode.trim();

        if (variant && currentProductBarcode === trimmedBarcode) {
            setMoveQty(qty => qty + 1);
            return;
        }
        resetVariantSelection();
        setMoveQty(1);
        setCurrentProductBarcode(trimmedBarcode);
        setLoading(true);

        try {
            const response = await getVariantByBarcode(barcode);

            if (response.success) {
                const binLocations = response.data.binQty || [];
                setVariant(response.data);
                setStockLocation(binLocations);
                setCurrentProductBarcode(trimmedBarcode);

                if (mode === "putaway") {
                    const receivingBin = binLocations.find(
                        (bin) => bin.binLocation.trim().toLowerCase() === RECEIVING_BIN_LOCATION
                    );

                    if (!receivingBin || receivingBin.qty <= 0) {
                        const productLabel = response.data.product?.title || response.data.title || barcode;
                        setErrorMessage(`No stock on RECEIVING for PRODUCT ${productLabel}`);
                        return;
                    }
                    setSelectedBins([receivingBin.id]);
                }

                if (!response.data.binQty || response.data.binQty.length === 0) {
                    const productTitle = response.data.product?.title;
                    const variantTitle = response.data.title;
                    setErrorMessage(`No Bin location stock for "${productTitle}" "${variantTitle}"`);
                }
                return;
            }

            if (response.errorCode === "MULTIPLE_VARIANTS") {
                setInlineErrorMessage(response.message);
                return;
            }

            if (response.errorCode === "NOT_FOUND") {
                setErrorMessage(response.message);
                setErrorAutoHideDuration(undefined);
                return;
            }

            setErrorMessage(response.message || "Error scanning barcode");
        } catch {
            setErrorMessage("Error scanning barcode");
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

    const closeError = () => setErrorMessage(null);
    const closeSuccess = () => setSuccessMessage(null);
    const handleBinSelection = (bins: string[]) => {
        if (mode === "putaway") {
            return;
        }

        setSelectedBins(bins);
    };
    return {
        closeError,
        closeSuccess,
        errorMessage,
        errorAutoHideDuration,
        successAutoHideDuration,
        handleBinSelection,
        handleScan,
        inlineErrorMessage,
        loading,
        moveQty,
        selectedBins,
        setMoveQty: handleMoveQtyChange,
        stockLocation,
        successMessage,
        variant,
    };
}
