"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, TextField } from "@mui/material";

interface ScanInputProps {
    onSubmit: (barcode: string) => void | Promise<void>;
}

export default function ScanInput({ onSubmit }: ScanInputProps) {
    const [isManualMode, setIsManualMode] = useState(false);
    const [manualValue, setManualValue] = useState("");
    const bufferRef = useRef("");
    const catcherRef = useRef<HTMLDivElement | null>(null);
    const manualInputRef = useRef<HTMLInputElement | null>(null);
    const queueRef = useRef<string[]>([]);
    const processingRef = useRef(false);

    const focusCatcher = useCallback(() => {
        requestAnimationFrame(() => {
            catcherRef.current?.focus();
        });
    }, []);

    const processQueue = useCallback(async () => {
        if (processingRef.current) {
            return;
        }

        processingRef.current = true;

        try {
            while (queueRef.current.length > 0) {
                const barcode = queueRef.current.shift();
                if (!barcode) {
                    continue;
                }

                await onSubmit(barcode);
            }
        } finally {
            processingRef.current = false;
            if (!isManualMode) {
                focusCatcher();
            }
        }
    }, [focusCatcher, isManualMode, onSubmit]);

    const enqueueScan = useCallback((barcode: string) => {
        queueRef.current.push(barcode);
        void processQueue();
    }, [processQueue]);

    useEffect(() => {
        if (isManualMode) {
            manualInputRef.current?.focus();
            return;
        }

        focusCatcher();
    }, [focusCatcher, isManualMode]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (isManualMode) {
            return;
        }

        if (e.key === "Enter" || e.key === "NumpadEnter") {
            e.preventDefault();
            const scanned = bufferRef.current.trim();
            bufferRef.current = "";

            if (scanned) {
                enqueueScan(scanned);
            }
            return;
        }

        if (e.key === "Backspace") {
            bufferRef.current = bufferRef.current.slice(0, -1);
            return;
        }

        if (e.key.length === 1) {
            bufferRef.current += e.key;
        }
    };

    const submitManualValue = async () => {
        const value = manualValue.trim();
        if (!value) {
            return;
        }

        await onSubmit(value);
        setManualValue("");
        setIsManualMode(false);
        focusCatcher();
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
                ref={catcherRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                    if (!isManualMode) {
                        setTimeout(() => catcherRef.current?.focus(), 0);
                    }
                }}
                aria-label="Barcode scanner catcher"
                sx={{
                    // Keep focusable for scanner key events, but hide from visual layout.
                    position: "absolute",
                    width: 1,
                    height: 1,
                    p: 0,
                    m: -1,
                    overflow: "hidden",
                    clip: "rect(0 0 0 0)",
                    whiteSpace: "nowrap",
                    border: 0,
                }}
            />

            {isManualMode && (
                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        inputRef={manualInputRef}
                        value={manualValue}
                        onChange={(e) => setManualValue(e.target.value)}
                        placeholder="SCAN"
                        fullWidth
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                submitManualValue();
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}