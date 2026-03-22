import { LogFiltersState, LogSortBy, LogSortDirection } from "@/lib/logs/types";
import { getLogControlValue } from "@/lib/logs/types";
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
    sortBy,
    sortDirection,
    hasActiveFilters,
    loading,
    onFiltersChange,
    onSortByChange,
    onSortDirectionChange,
    onApply,
    onReset,
}: LogsFiltersProps) {

    const updateFilter = (key: keyof LogFiltersState) => (e: Event) => {
        onFiltersChange({ ...filters, [key]: getLogControlValue(e) });
    };

    return (
        <s-query-container>
            <s-grid gap="base" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))">
                <s-grid-item>
                    <s-select label="Activity" value={filters.activity} onChange={updateFilter("activity")}>
                        <s-option value="">All Activities</s-option>
                    </s-select>
                </s-grid-item>

                <s-grid-item>
                    <s-select
                        label="Sort By"
                        value={sortBy}
                        onChange={(e: Event) => onSortByChange(getLogControlValue(e) as LogSortBy)}
                    >
                        <s-option value="createdAt">Date Created</s-option>
                    </s-select>
                </s-grid-item>

                <s-grid-item>
                    <s-select
                        label="Direction"
                        value={sortDirection}
                        onChange={(e: Event) => onSortDirectionChange(getLogControlValue(e) as LogSortDirection)}
                    >
                        <PoSortDirectionOptions />
                    </s-select>
                </s-grid-item>

            </s-grid>

            <s-stack direction="inline" gap="small" style={{ marginTop: "1rem" }}>
                <s-button variant="primary" onClick={onApply} disabled={loading}>
                    {loading ? "Loading..." : "Apply"}
                </s-button>
                <s-button variant="secondary" onClick={onReset} disabled={!hasActiveFilters && sortBy === "createdAt"}>
                    Reset
                </s-button>
            </s-stack>
        </s-query-container>
    );
}