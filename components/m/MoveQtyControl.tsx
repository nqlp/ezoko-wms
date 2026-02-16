"use client";

import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { requestScanRefocus } from "./scanner/focusBus";

interface MoveQtyControlProps {
    moveQty: number;
    onMoveQtyChange: (newQty: number) => void;
}

export default function MoveQtyControl({ moveQty, onMoveQtyChange }: MoveQtyControlProps) {
    const [moveQtyInput, setMoveQtyInput] = useState(moveQty.toString());

    useEffect(() => {
        setMoveQtyInput(String(moveQty));
    }, [moveQty]);

    const handleMoveQtyInputChange = (value: string) => {
        setMoveQtyInput(value);

        if (value === "") {
            return;
        }

        // Only allow numeric input
        if (!/^\d+$/.test(value)) {
            return;
        }

        const parsed = Number.parseInt(value, 10);
        if (parsed >= 1) {
            onMoveQtyChange(parsed);
        }
    };

    const handleMoveQtyBlur = () => {
        if (!/^\d+$/.test(moveQtyInput)) {
            setMoveQtyInput(String(moveQty));
            requestScanRefocus("move-qty-blur");
            return;
        }

        const parsed = Number.parseInt(moveQtyInput, 10);
        if (parsed < 1) {
            setMoveQtyInput(String(moveQty));
            requestScanRefocus("move-qty-blur");
            return;
        }

        onMoveQtyChange(parsed);
        requestScanRefocus("move-qty-blur");
    };

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
                onClick={() => onMoveQtyChange(moveQty - 1)}
                disabled={moveQty <= 1}
            >
                <RemoveIcon />
            </IconButton>
            <TextField
                label="Move Qty"
                type="number"
                value={moveQtyInput}
                onChange={(e) => handleMoveQtyInputChange(e.target.value)}
                onBlur={handleMoveQtyBlur}
                fullWidth
                slotProps={{
                    htmlInput: {
                        inputMode: "numeric",
                        min: 1,
                    },
                }}
            />
            <IconButton
                onClick={() => onMoveQtyChange(moveQty + 1)}
            >
                <AddIcon />
            </IconButton>
        </div>
    );
}