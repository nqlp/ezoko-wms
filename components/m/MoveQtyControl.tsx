"use client";

import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useQuantityInput } from "@/lib/client/hooks/useQuantityInput";

interface MoveQtyControlProps {
    moveQty: number;
    onMoveQtyChange: (newQty: number) => void;
}

export default function MoveQtyControl({ moveQty, onMoveQtyChange }: MoveQtyControlProps) {
    const { 
        inputValue, 
        handleChange, 
        handleBlur, 
        increment, 
        decrement, 
        canDecrement 
    } = useQuantityInput({
        value: moveQty,
        onChange: onMoveQtyChange,
        refocusKey: "move-qty-blur"
    });

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconButton onClick={decrement} disabled={!canDecrement}>
                <RemoveIcon />
            </IconButton>

            <TextField
                label="Move Qty"
                type="number"
                value={inputValue}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                fullWidth
                slotProps={{
                    htmlInput: { inputMode: "numeric", min: 1 },
                }}
            />

            <IconButton onClick={increment}>
                <AddIcon />
            </IconButton>
        </div>
    );
}