"use client";

import { useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import TableContainer from "@mui/material/TableContainer";
import { StockLocation } from "@/lib/types/StockLocation";
import IconButton from "@mui/material/IconButton";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

interface BinLocationTableProps {
    stockLocation: StockLocation[];
    selectedBins: string[];
    onBinSelectionChange: (bins: string[]) => void;
    moveQty: number;
    onMoveQtyChange: (qty: number) => void;
}

export default function BinLocationTable({
    stockLocation,
    selectedBins,
    onBinSelectionChange,
    moveQty,
    onMoveQtyChange,
}: BinLocationTableProps) {

    // Auto check if only one bin location
    useEffect(() => {
        if (stockLocation.length === 1) {
            onBinSelectionChange([stockLocation[0].id]);
        }
    }, [stockLocation, onBinSelectionChange]);

    const [moveQtyInput, setMoveQtyInput] = useState<string>(String(moveQty));

    useEffect(() => {
        setMoveQtyInput(String(moveQty));
    }, [moveQty]);

    const handleToggle = (id: string) => {
        const newChecked = selectedBins.includes(id)
            ? [] // Unselect if already selected
            : [id]; // Select the bin location we clicked
        onBinSelectionChange(newChecked);
    };

    const handleMoveQtyInputChange = (value: string) => {
        setMoveQtyInput(value);

        if (value === "") {
            return;
        }

        if (!/^\d+$/.test(value)) {
            return;
        }

        const parsed = Number.parseInt(value, 10);
        if (parsed >= 1) {
            onMoveQtyChange(parsed);
        }
    };

    // When the input loses focus, ensure the value is valid and reset if not
    const handleMoveQtyBlur = () => {
        if (!/^\d+$/.test(moveQtyInput)) {
            setMoveQtyInput(String(moveQty));
            return;
        }

        const parsed = Number.parseInt(moveQtyInput, 10);
        if (parsed < 1) {
            setMoveQtyInput(String(moveQty));
            return;
        }

        onMoveQtyChange(parsed);
    };

    return (
        <div style={{ marginTop: "16px" }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox"></TableCell>
                            <TableCell>Bin Location</TableCell>
                            <TableCell align="right">Qty</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stockLocation.map((location) => {
                            const isChecked = selectedBins.includes(location.id);
                            return (
                                <TableRow
                                    key={location.id}
                                    onClick={() => handleToggle(location.id)}
                                    sx={{
                                        bgcolor: isChecked ? "var(--ezoko-mint)" : "var(--ezoko-paper)",
                                        cursor: "pointer",
                                        "&:hover": {
                                            bgcolor: isChecked ? "var(--ezoko-mint)" : "var(--ezoko-paper)",
                                        }
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={() => handleToggle(location.id)}
                                            sx={{ color: "var(--ezoko-pine)" }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textTransform: "uppercase" }}>
                                        {location.binLocation}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                        {location.qty}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />
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
                        }
                    }}
                />
                <IconButton
                    onClick={() => onMoveQtyChange(moveQty + 1)}
                >
                    <AddIcon />
                </IconButton>
            </div>
        </div>
    )
}
