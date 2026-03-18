"use client";

import { useReducer } from "react";
import { executeStockMove, fetchVariantByBarcode } from "./scanner/scannerApi";
import { initialScannerState, scannerReducer } from "./scanner/scannerState";
import type { MovementActivity, ScannerMode } from "./scanner/scannerTypes";
import {
    findBinByBarcode,
    findReceivingBin,
    getProductLabel,
    isBinBarcode,
    isProductBarcode,
    trimmedBarcode,
} from "./scannerRules";

function resolveMovementActivity(mode: ScannerMode): MovementActivity {
    return mode === "putaway" ? "PUTAWAY" : "MOVEMENT";
}

export function useMobileScanner(mode: ScannerMode) {
    const [state, dispatch] = useReducer(scannerReducer, initialScannerState);

    const handleMoveQtyChange = (qty: number) => {
        if (!Number.isInteger(qty)) {
            return;
        }
        dispatch({ type: "SET_MOVE_QTY", payload: Math.max(1, qty) });
    };

    const resetScanFeedback = () => {
        dispatch({ type: "RESET_SCAN_FEEDBACK" });
    };

    const resetVariantSelection = () => {
        dispatch({ type: "RESET_VARIANT_SELECTION" });
    };

    const clearMoveWorkflow = () => {
        dispatch({ type: "CLEAR_MOVE_WORKFLOW" });
    };

    const handleBinScan = async (barcode: string) => {
        if (!state.variant || state.stockLocation.length === 0) {
            dispatch({ type: "SET_ERROR_MESSAGE", payload: `Barcode ${barcode} is NOT a PRODUCT barcode.` });
            return;
        }

        const destinationBin = findBinByBarcode(state.stockLocation, barcode);

        if (!destinationBin) {
            dispatch({
                type: "SET_ERROR_MESSAGE",
                payload: `Only source bin could be scanned at this point. ${barcode} is not a source bin.`,
            });
            return;
        }

        const receivingBin = findReceivingBin(state.stockLocation);

        const sourceId = state.selectedBins[0];
        const sourceBin = mode === "putaway"
            ? receivingBin
            : (sourceId
                ? state.stockLocation.find((location) => location.id === sourceId) ?? null
                : null);

        if (!sourceBin) {
            if (mode === "putaway") {
                const productLabel = getProductLabel(
                    state.variant.product?.title,
                    state.variant.title,
                    barcode
                );
                dispatch({ type: "SET_ERROR_MESSAGE", payload: `No stock on RECEIVING for PRODUCT ${productLabel}` });
                return;
            }

            dispatch({ type: "SET_SELECTED_BINS", payload: [destinationBin.id] });
            return;
        }

        if (mode === "putaway" && state.selectedBins[0] !== sourceBin.id) {
            dispatch({ type: "SET_SELECTED_BINS", payload: [sourceBin.id] });
        }

        if (destinationBin.id === sourceBin.id) {
            dispatch({
                type: "SET_ERROR_MESSAGE",
                payload: `Source bin ${sourceBin.id} cannot be the same as destination bin`,
            });
            return;
        }

        if (state.moveQty > sourceBin.qty) {
            dispatch({
                type: "SET_ERROR_MESSAGE",
                payload: `Qty to move ${state.moveQty} is greater than qty on source bin (${sourceBin.qty})`,
            });
            return;
        }

        dispatch({ type: "SET_LOADING", payload: true });
        const moveResult = await executeStockMove({
            sourceBinId: sourceBin.id,
            sourceBinName: sourceBin.binLocation,
            sourceBinQtyBefore: sourceBin.qty,
            destinationBinId: destinationBin.id,
            destinationBinName: destinationBin.binLocation,
            destinationBinQtyBefore: destinationBin.qty,
            moveQty: state.moveQty,
            barcode: state.variant.barcode,
            variantTitle: state.variant.title,
            activity: resolveMovementActivity(mode),
        });
        dispatch({ type: "SET_LOADING", payload: false });

        if (!moveResult.success) {
            dispatch({ type: "SET_ERROR_MESSAGE", payload: moveResult.message || "Failed to move stock" });
            return;
        }

        dispatch({
            type: "SET_SUCCESS_MESSAGE",
            payload: `Qty of ${state.moveQty} successfully moved from ${sourceBin.binLocation} to ${destinationBin.binLocation}`,
        });
        clearMoveWorkflow();
    };

    const handleProductScan = async (barcode: string) => {
        const trimmedBc = trimmedBarcode(barcode);

        if (state.variant && state.currentProductBarcode === trimmedBc) {
            dispatch({ type: "INCREMENT_MOVE_QTY" });
            return;
        }
        resetVariantSelection();
        dispatch({ type: "SET_MOVE_QTY", payload: 1 });
        dispatch({ type: "SET_CURRENT_PRODUCT_BARCODE", payload: trimmedBc });
        dispatch({ type: "SET_LOADING", payload: true });

        try {
            const response = await fetchVariantByBarcode(trimmedBc);

            if (response.success) {
                const binLocations = response.data.binQty || [];
                dispatch({ type: "SET_VARIANT", payload: response.data });
                dispatch({ type: "SET_STOCK_LOCATION", payload: binLocations });
                dispatch({ type: "SET_CURRENT_PRODUCT_BARCODE", payload: trimmedBc });

                if (mode === "putaway") {
                    const receivingBin = findReceivingBin(binLocations);

                    if (!receivingBin || receivingBin.qty <= 0) {
                        const productLabel = getProductLabel(
                            response.data.product?.title,
                            response.data.title,
                            trimmedBc
                        );
                        dispatch({ type: "SET_ERROR_MESSAGE", payload: `No stock on RECEIVING for PRODUCT ${productLabel}` });
                        return;
                    }
                    dispatch({ type: "SET_SELECTED_BINS", payload: [receivingBin.id] });
                }

                if (!response.data.binQty || response.data.binQty.length === 0) {
                    const productTitle = response.data.product?.title;
                    const variantTitle = response.data.title;
                    dispatch({
                        type: "SET_ERROR_MESSAGE",
                        payload: `No Bin location stock for "${productTitle}" "${variantTitle}"`,
                    });
                }
                return;
            }

            if (response.errorCode === "MULTIPLE_VARIANTS") {
                dispatch({ type: "SET_INLINE_ERROR_MESSAGE", payload: response.message });
                return;
            }

            if (response.errorCode === "NOT_FOUND") {
                dispatch({ type: "SET_ERROR_MESSAGE", payload: response.message });
                dispatch({ type: "SET_ERROR_AUTO_HIDE_DURATION", payload: undefined });
                return;
            }

            dispatch({ type: "SET_ERROR_MESSAGE", payload: response.message || "Error scanning barcode" });
        } catch {
            dispatch({ type: "SET_ERROR_MESSAGE", payload: "Error scanning barcode" });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    const handleScan = async (barcode: string) => {
        if (!barcode) return;

        resetScanFeedback();

        // If the barcode starts with a letter, it is a bin location barcode
        if (isBinBarcode(barcode)) {
            await handleBinScan(barcode);
            return;
        }
        // If the barcode starts with a number, it is a product barcode
        if (isProductBarcode(barcode)) {
            await handleProductScan(barcode);
        }
    };

    const closeError = () => dispatch({ type: "SET_ERROR_MESSAGE", payload: null });
    const closeSuccess = () => dispatch({ type: "SET_SUCCESS_MESSAGE", payload: null });
    const handleBinSelection = (bins: string[]) => {
        if (mode === "putaway") {
            return;
        }

        dispatch({ type: "SET_SELECTED_BINS", payload: bins });
    };
    return {
        closeError,
        closeSuccess,
        errorMessage: state.errorMessage,
        errorAutoHideDuration: state.errorAutoHideDuration,
        successAutoHideDuration: state.successAutoHideDuration,
        handleBinSelection,
        handleScan,
        inlineErrorMessage: state.inlineErrorMessage,
        loading: state.loading,
        moveQty: state.moveQty,
        selectedBins: state.selectedBins,
        setMoveQty: handleMoveQtyChange,
        stockLocation: state.stockLocation,
        successMessage: state.successMessage,
        variant: state.variant,
    };
}
