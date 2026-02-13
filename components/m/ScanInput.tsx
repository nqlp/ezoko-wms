"use client";

import { useEffect, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, TextField, Typography } from "@mui/material";

interface ScanInputProps {
    onSubmit: (barcode: string) => void | Promise<void>;
}

export default function ScanInput({ onSubmit }: ScanInputProps) {
    const [isManualMode, setIsManualMode] = useState(false);
    const [manualValue, setManualValue] = useState("");
    const bufferRef = useRef("");
    const catcherRef = useRef<HTMLDivElement | null>(null);
    const manualInputRef = useRef<HTMLInputElement | null>(null);

    const focusCatcher = () => {
        catcherRef.current?.focus();
    };

    useEffect(() => {
        focusCatcher();
    }, []);

    useEffect(() => {
        if (isManualMode) {
            manualInputRef.current?.focus();
        }
    }, [isManualMode]);

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (isManualMode) {
            return;
        }

        if (e.key === "Enter" || e.key === "NumpadEnter") {
            const scanned = bufferRef.current.trim();
            bufferRef.current = "";

            if (scanned) {
                await onSubmit(scanned);
            }

            focusCatcher();
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

    const closeManualMode = () => {
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
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderRadius: 1,
                    border: "1px solid var(--ezoko-ink)",
                    backgroundColor: "var(--ezoko-paper)",
                    color: "var(--ezoko-ink)",
                    px: 1.5,
                    py: 0.75,
                    minHeight: 44,
                    outline: "none",
                }}
            >
                <SearchIcon sx={{ fontSize: 20, width: 20, height: 20, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                    SCAN
                </Typography>
            </Box>

            {!isManualMode && (
                <Button
                    variant="outlined"
                    onClick={() => setIsManualMode(true)}
                    sx={{ alignSelf: "flex-start" }}
                >
                    MANUAL MODE
                </Button>
            )}

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
                                void submitManualValue();
                            }
                        }}
                    />
                    <Button variant="contained" onClick={() => void submitManualValue()}>
                        OK
                    </Button>
                    <Button variant="text" onClick={closeManualMode}>
                        CANCEL
                    </Button>
                </Box>
            )}
        </Box>
    );
}