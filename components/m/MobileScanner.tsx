"use client";

import { useEffect } from "react";
import ScanInput from "./ScanInput";
import SnackBar from "./SnackBar";
import BinLocationTable from "./BinLocationTable";
import VariantCard from "@/app/scan/_components/VariantCard";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useMobileScanner } from "./useMobileScanner";
import MoveQtyControl from "./MoveQtyControl";
import type { ScannerMode } from "./scanner/scannerTypes";
import { requestScanRefocus } from "./scanner/focusBus";

interface MobileScannerProps {
    mode: ScannerMode;
}

export default function MobileScanner({ mode }: MobileScannerProps) {
    const {
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
        setMoveQty,
        stockLocation,
        successMessage,
        variant,
    } = useMobileScanner(mode);

    useEffect(() => {
        requestScanRefocus("mobile-scanner-mount");
    }, []);

    return (
        <div>
            <ScanInput onSubmit={handleScan} />
            {inlineErrorMessage && (
                <Typography
                    color="error"
                    sx={{ textAlign: "left", mt: 1, mb: 1 }}
                >
                    {inlineErrorMessage}
                </Typography>
            )}

            {errorMessage && (
                <SnackBar
                    message={errorMessage}
                    onClose={closeError}
                    onAfterClose={() => requestScanRefocus("snackbar-close")}
                    autoHideDuration={errorAutoHideDuration}
                    severity="error"
                />
            )}

            {successMessage && (
                <SnackBar
                    message={successMessage}
                    onClose={closeSuccess}
                    onAfterClose={() => requestScanRefocus("snackbar-close")}
                    autoHideDuration={successAutoHideDuration}
                    severity="success"
                />
            )}
            {loading && <p>Loading...</p>}

            {variant && <VariantCard foundProduct={variant} />}

            {stockLocation && stockLocation.length > 0 && (
                <BinLocationTable
                    stockLocation={stockLocation}
                    selectedBins={selectedBins}
                    onBinSelectionChange={handleBinSelection}
                    moveQty={moveQty}
                    selectionDisabled={mode === "putaway"}
                />
            )}

            {selectedBins.length > 0 && (
                <>
                    <Divider sx={{ my: 2 }} />
                    <MoveQtyControl moveQty={moveQty} onMoveQtyChange={setMoveQty} />
                </>
            )}
        </div>
    );
}