"use client";

import { useEffect, useState, useRef } from "react";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

interface ScanInputProps {
    onSubmit: (barcode: string) => void;
}

export default function ScanInput({ onSubmit }: ScanInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [barcodeValue, setBarcodeValue] = useState("");

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            onSubmit(barcodeValue.trim());
            setBarcodeValue("");
        }
    }

    return (
        <TextField
            variant="outlined"
            value={barcodeValue}
            onChange={(e) => setBarcodeValue(e.target.value)}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            fullWidth
            placeholder="SCAN"
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
}