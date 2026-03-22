"use client";

import { Box, TextField } from "@mui/material";
import { useScanner } from "@/lib/client/hooks/useScanner";

const isEditable = (el: Element | null) =>
    el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement)?.isContentEditable;

export default function ScanInput({ onSubmit }: { onSubmit: (b: string) => void }) {
    const {
        manualValue,
        setManualValue,
        catcherRef,
        handleCatcherKeyDown,
        submitManualValue,
        setManualFocused,
        focusCatcher
    } = useScanner({ onSubmit });

    return (
        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* invisible catcher */}
            <Box
                ref={catcherRef}
                tabIndex={0}
                onKeyDown={handleCatcherKeyDown}
                onBlur={() => window.setTimeout(() => focusCatcher(false), 0)}
                sx={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none"
                }}
            />

            <TextField
                variant="outlined"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder="MANUAL BARCODE"
                fullWidth
                onFocus={() => setManualFocused(true)}
                onBlur={() => {
                    setManualFocused(false);
                    window.setTimeout(() => {
                        if (!isEditable(document.activeElement)) {
                            focusCatcher(false);
                        }
                    }, 0);
                }}
                onKeyDown={(e) => e.key === "Enter" && submitManualValue()}
            />
        </Box>
    );
}