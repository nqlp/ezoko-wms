"use client";

import './PurchaseOrderTable.css';
import { PoTableHeaders } from '@/components/embedded/PurchaseOrderUIOptions';
import { formatDateTime } from '@/lib/utils/date';
import { PoStatusChip } from './PoStatusChip';

export interface PurchaseOrderTableRow {
    poNumber: string;
    itemCount: number;
    pieces: number;
    status: string;
    createdAt: string;
    lastModification: string | null;
    expectedDate: string | null;
    importDuties: boolean;
    importType: string;
    notes: string | null;
    vendor: string;
}

interface PurchaseOrderTableProps {
    rows: PurchaseOrderTableRow[];
    inlineErrors: Record<string, string>;
    onCheckIn: (row: PurchaseOrderTableRow) => void | Promise<void>;
    onModify: (row: PurchaseOrderTableRow) => void;
}

export function PurchaseOrderTable({ rows, inlineErrors, onCheckIn, onModify }: PurchaseOrderTableProps) {
    return (
        <s-section>
            <s-table>
                <s-table-header-row>
                    <PoTableHeaders />
                </s-table-header-row>
                <s-table-body>
                    {rows.map((row) => (
                        <s-table-row key={row.poNumber}>
                            <s-table-cell>{row.poNumber}</s-table-cell>
                            <s-table-cell>{row.vendor}</s-table-cell>
                            <s-table-cell>{row.itemCount}</s-table-cell>
                            <s-table-cell>{row.pieces}</s-table-cell>
                            <s-table-cell>
                                <PoStatusChip status={row.status} />
                            </s-table-cell>
                            <s-table-cell>{formatDateTime(row.createdAt)}</s-table-cell>
                            <s-table-cell>{row.lastModification ? formatDateTime(row.lastModification) : ""}</s-table-cell>
                            <s-table-cell>{row.expectedDate ? formatDateTime(row.expectedDate) : ""}</s-table-cell>
                            <s-table-cell>{row.importDuties ? "Yes" : "No"}</s-table-cell>
                            <s-table-cell>{row.importType}</s-table-cell>
                            <s-table-cell>{row.notes ? "X" : ""}</s-table-cell>
                            <s-table-cell>
                                <s-stack direction="inline" gap="small">
                                    <s-button
                                        variant="primary"
                                        onClick={() => {
                                            onModify(row);
                                        }}
                                    >
                                        Modify
                                    </s-button>
                                    <s-button
                                        variant="secondary"
                                        onClick={() => {
                                            onCheckIn(row);
                                        }}
                                    >
                                        Check-in
                                    </s-button>
                                </s-stack>
                                {inlineErrors[row.poNumber] ? (
                                    <div className="error-text">{inlineErrors[row.poNumber]}</div>
                                ) : null}
                            </s-table-cell>
                        </s-table-row>
                    ))}
                </s-table-body>
            </s-table>
        </s-section>
    );
}