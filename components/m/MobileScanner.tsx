"use client";

import ScanInput from "./ScanInput";
import SnackBar from "./SnackBar";
import BinLocationTable from "./BinLocationTable";
import VariantCard from "@/app/scan/_components/VariantCard";
import Typography from "@mui/material/Typography";
import { useMobileScanner } from "./useMobileScanner";

export default function MobileScanner() {
    const {
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
        setMoveQty,
        stockLocation,
        successMessage,
        variant,
    } = useMobileScanner();

    return (
        <div>
            <ScanInput onSubmit={handleScan} />
            {inlineMessage && (
                <Typography
                    color="error"
                    sx={{ textAlign: "left", mt: 1, mb: 1 }}
                >
                    {inlineMessage}
                </Typography>
            )}

            {/* Snackbar Error (bottom) */}
            {error && (
                <SnackBar
                    message={error}
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
                    onMoveQtyChange={setMoveQty}
                />
            )}
        </div>
    )
}
