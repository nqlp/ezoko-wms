"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, TextField } from "@mui/material";
import { WMS_SCAN_REFOCUS_EVENT } from "./scanner/focusBus";

interface ScanInputProps {
    onSubmit: (barcode: string) => void | Promise<void>;
}

function isEditableElement(element: Element | null): boolean {
    if (!element) {
        return false;
    }

    if (element instanceof HTMLInputElement) {
        return true;
    }

    if (element instanceof HTMLTextAreaElement) {
        return true;
    }

    if (element instanceof HTMLSelectElement) {
        return true;
    }

    return element instanceof HTMLElement && element.isContentEditable;
}

export default function ScanInput({ onSubmit }: ScanInputProps) {
    const [manualValue, setManualValue] = useState("");
    const catcherRef = useRef<HTMLDivElement | null>(null);
    const scanBufferRef = useRef("");
    const manualFocusedRef = useRef(false);
    const queueRef = useRef<string[]>([]);
    const processingRef = useRef(false);

    const focusCatcher = useCallback((force = false) => {
        const catcher = catcherRef.current;

        if (!catcher) {
            return;
        }

        if (!force && manualFocusedRef.current) {
            return;
        }

        const activeElement = document.activeElement;
        if (!force && activeElement && activeElement !== catcher && activeElement !== document.body) {
            return;
        }

        catcher.focus();
    }, []);

    const processQueue = useCallback(async () => {
        if (processingRef.current) {
            return;
        }

        processingRef.current = true;

        try {
            while (queueRef.current.length > 0) {
                // shift is used instead of pop to ensure FIFO order
                const nextBarcode = queueRef.current.shift();

                if (!nextBarcode) {
                    continue;
                }

                await onSubmit(nextBarcode);
            }
        } finally {
            processingRef.current = false;
            focusCatcher(true);
        }
    }, [focusCatcher, onSubmit]);

    // using a queue for FIFO
    const enqueueSubmit = useCallback(
        (barcode: string) => {
            const value = barcode.trim();
            if (!value) {
                return;
            }

            queueRef.current.push(value);
            void processQueue();
        },
        [processQueue]
    );

    useEffect(() => {
        const refocus: EventListener = (event) => {
            if (event.type === "visibilitychange" && document.visibilityState !== "visible") {
                return;
            }

            focusCatcher(true);
        }

        window.addEventListener(WMS_SCAN_REFOCUS_EVENT, refocus);
        document.addEventListener("focus", refocus);
        document.addEventListener("visibilitychange", refocus);
        focusCatcher(true);

        return () => {
            window.removeEventListener(WMS_SCAN_REFOCUS_EVENT, refocus);
            document.removeEventListener("focus", refocus);
            document.removeEventListener("visibilitychange", refocus);
        }
    }, [focusCatcher]);

    const handleCatcherKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === "NumpadEnter") {
            e.preventDefault();
            const scannedValue = scanBufferRef.current.trim();
            scanBufferRef.current = "";
            enqueueSubmit(scannedValue);
            return;
        }

        if (e.key === "Backspace") {
            scanBufferRef.current = scanBufferRef.current.slice(0, -1);
            return;
        }

        if (e.key.length === 1) {
            scanBufferRef.current += e.key;
        }
    };

    const handleCatcherBlur = () => {
        window.setTimeout(() => {
            if (!manualFocusedRef.current) {
                focusCatcher(false);
            }
        }, 0);
    };

    const submitManualValue = () => {
        const value = manualValue.trim();
        if (!value) {
            return;
        }

        setManualValue("");
        manualFocusedRef.current = false;
        enqueueSubmit(value);
        focusCatcher(true);
    };

    return (
        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
                ref={catcherRef}
                tabIndex={0}
                onKeyDown={handleCatcherKeyDown}
                onBlur={handleCatcherBlur}
                aria-label="scan-catcher"
                sx={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    overflow: "hidden",
                    // box does not receive clicks
                    pointerEvents: "none",
                    outline: "none",
                }}
            />

            <Box
                sx={{
                    display: "flex",
                    border: "1px solid var(--ezoko-ink)",
                }}
            >
                <TextField
                    variant="outlined"
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    placeholder="MANUAL BARCODE"
                    fullWidth
                    onFocus={() => {
                        manualFocusedRef.current = true;
                    }}
                    onBlur={() => {
                        manualFocusedRef.current = false;
                        window.setTimeout(() => {
                            const activeElement = document.activeElement;
                            if (!isEditableElement(activeElement)) {
                                focusCatcher(false);
                            }
                        }, 0);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            submitManualValue();
                        }
                    }}
                />
            </Box>
        </Box>
    );
}