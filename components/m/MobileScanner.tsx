"use client";

import ScanInput from "./ScanInput";
import SnackBar from "./SnackBar";
import BinLocationTable from "./BinLocationTable";
import VariantCard from "@/app/scan/_components/VariantCard";
import Typography from "@mui/material/Typography";
import { useMobileScanner } from "./useMobileScanner";
import MoveQtyControl from "./MoveQtyControl";

export default function MobileScanner() {
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
    } = useMobileScanner();

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

            {/* Snackbar Error (bottom) */}
            {errorMessage && (
                <SnackBar
                    message={errorMessage}
                    onClose={closeError}
                    autoHideDuration={errorAutoHideDuration}
                    severity="error"
                />
            )}

            {/* Snackbar Success */}
            {successMessage && (
                <SnackBar
                    message={successMessage}
                    onClose={closeSuccess}
                    autoHideDuration={successAutoHideDuration}
                    severity="success"
                />
            )}
            {loading && <p>Loading...</p>}

            {/* Display variant details if found */}
            {variant && <VariantCard foundProduct={variant} />}

            {stockLocation && stockLocation.length > 0 && (
                <BinLocationTable
                    stockLocation={stockLocation}
                    selectedBins={selectedBins}
                    onBinSelectionChange={handleBinSelection}
                    moveQty={moveQty}
                />
            )}

            {/* Show move qty control if a bin location is selected */}
            {selectedBins.length > 0 && (
                <MoveQtyControl moveQty={moveQty} onMoveQtyChange={setMoveQty} />
            )}
        </div>
    )
}