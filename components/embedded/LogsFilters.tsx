"use client";

import { ACTIVITY_TYPES } from "@/lib/constants";
import { LogFiltersState, LogSortBy, LogSortDirection, getLogControlValue } from "@/lib/logs/types";
import { PoSortDirectionOptions } from "./PurchaseOrderUIOptions";

interface LogsFiltersProps {
    filters: LogFiltersState;
    sortBy: LogSortBy;
    sortDirection: LogSortDirection;
    hasActiveFilters: boolean;
    loading: boolean;
    onFiltersChange: (f: LogFiltersState) => void;
    onSortByChange: (s: LogSortBy) => void;
    onSortDirectionChange: (d: LogSortDirection) => void;
    onApply: () => void;
    onReset: () => void;
}

export function LogsFilters({
    filters,
    sortDirection,
    hasActiveFilters,
    loading,
    onFiltersChange,
    onSortDirectionChange,
    onApply,
    onReset,
}: LogsFiltersProps) {

    const updateFilter = (key: keyof LogFiltersState) => (e: Event) => {
        onFiltersChange({ ...filters, [key]: getLogControlValue(e) });
    };

    return (
        <s-query-container>
            <s-grid gap="base" gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))">
                <s-grid-item>
                    <s-select label="Activity" value={filters.activity} onChange={updateFilter("activity")}>
                        <s-option value="">All Activities</s-option>
                        {ACTIVITY_TYPES.map((type) => (
                            <s-option key={type} value={type}>{type}</s-option>
                        ))}
                    </s-select>
                </s-grid-item>

                <s-grid-item>
                    <s-search-field
                        label="User"
                        value={filters.user}
                        placeholder="Search user..."
                        onChange={(e: Event) => onFiltersChange({ ...filters, user: (e.target as HTMLInputElement).value })}
                    />
                </s-grid-item>

                <s-grid-item>
                    <s-search-field
                        label="Barcode"
                        value={filters.barcode}
                        placeholder="Type your barcode."
                        onChange={(e: Event) => onFiltersChange({ ...filters, barcode: (e.target as HTMLInputElement).value })}
                    />
                </s-grid-item>

                <s-grid-item>
                    <s-date-field label="Start Date" type="single" value={filters.dateStart} onChange={updateFilter("dateStart")} />
                </s-grid-item>

                <s-grid-item>
                    <s-date-field label="End Date" type="single" value={filters.dateEnd} onChange={updateFilter("dateEnd")} />
                </s-grid-item>

                <s-grid-item>
                    <s-text-field
                        label="Reference Doc"
                        value={filters.referenceDoc}
                        onChange={(e: Event) => onFiltersChange({ ...filters, referenceDoc: (e.target as HTMLInputElement).value })}
                    />
                </s-grid-item>

                <s-grid-item>
                    <s-search-field
                        label="Variant"
                        value={filters.variantTitle}
                        placeholder="Search by variant title..."
                        onChange={(e: Event) => onFiltersChange({ ...filters, variantTitle: (e.target as HTMLInputElement).value })}
                    />
                </s-grid-item>

                <s-grid-item>
                    <s-search-field
                        label="Source Location"
                        value={filters.srcLocation}
                        placeholder="Search by location..."
                        onChange={(e: Event) => onFiltersChange({ ...filters, srcLocation: (e.target as HTMLInputElement).value })}
                    />
                </s-grid-item>

                <s-grid-item>
                    <s-search-field
                        label="Destination Location"
                        value={filters.destinationLocation}
                        placeholder="Search by location..."
                        onChange={(e: Event) => onFiltersChange({ ...filters, destinationLocation: (e.target as HTMLInputElement).value })}
                    />
                </s-grid-item>

                <s-grid-item>
                    <s-select label="Direction" value={sortDirection} onChange={(e: Event) => onSortDirectionChange(getLogControlValue(e) as LogSortDirection)}>
                        <PoSortDirectionOptions />
                    </s-select>
                </s-grid-item>

            </s-grid>

            <div style={{ marginTop: "1rem" }}>
                <s-stack direction="inline" gap="small">
                    <s-button variant="primary" onClick={onApply} disabled={loading}>
                        {loading ? "Applying..." : "Apply"}
                    </s-button>
                    <s-button variant="secondary" onClick={onReset} disabled={!hasActiveFilters}>
                        Reset
                    </s-button>
                </s-stack>
            </div>
        </s-query-container>
    );
}