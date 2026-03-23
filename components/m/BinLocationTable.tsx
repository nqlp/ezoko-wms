"use client";

import { useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import { StockLocation } from "@/lib/types/StockLocation";

interface BinLocationTableProps {
    stockLocation: StockLocation[];
    selectedBins: string[];
    onBinSelectionChange: (bins: string[]) => void;
    selectionDisabled?: boolean;
}

export default function BinLocationTable({
    stockLocation,
    selectedBins,
    onBinSelectionChange,
    selectionDisabled,
}: BinLocationTableProps) {

    // Auto check if only one bin location
    useEffect(() => {
        if (stockLocation.length === 1) {
            onBinSelectionChange([stockLocation[0].id]);
        }
    }, [stockLocation, onBinSelectionChange]);


    const handleToggle = (id: string) => {
        if (selectionDisabled) {
            return;
        }
        const newChecked = selectedBins.includes(id)
            ? [] // Unselect if already selected
            : [id]; // Select the bin location we clicked
        onBinSelectionChange(newChecked);
    };

    return (
        <div style={{ marginTop: "16px" }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox"></TableCell>
                            <TableCell>Bin Location</TableCell>
                            <TableCell align="center">Qty</TableCell>
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
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={() => handleToggle(location.id)}
                                            sx={{ color: "var(--ezoko-pine)" }}
                                            disabled={selectionDisabled}
                                        />
                                    </TableCell>

                                    <TableCell sx={{ textTransform: "uppercase" }}>
                                        {location.binLocation}
                                    </TableCell>

                                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                        {location.qty}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}
