"use client";

import { useLogsList } from "@/components/embedded/useLogsList";
import { LogsFilters } from "@/components/embedded/LogsFilters";
import StockMovementsTable from "@/components/embedded/Logs";

export function LogsPage() {
    const {
        rows,
        filters,
        sortBy,
        sortDirection,
        loading,
        error,
        initialized,
        bootstrap,
        setFilters,
        setSortBy,
        setSortDirection,
        loadRows,
        resetFilters,
        hasActiveFilters,
    } = useLogsList();

    if (bootstrap.loading || !initialized) {
        return <div className="panel">Loading logs...</div>;
    }

    if (bootstrap.error) {
        return <div className="panel error-text">{bootstrap.error}</div>;
    }

    return (
        <s-page heading="Stock Movement Logs" inlineSize="large">
            <s-section>
                <s-section-header>
                    <s-heading>Stock Movement Logs</s-heading>
                    {error ? <s-banner tone="critical" error={error} /> : null}
                </s-section-header>

                <LogsFilters
                    filters={filters}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    hasActiveFilters={hasActiveFilters}
                    loading={loading}
                    onFiltersChange={setFilters}
                    onSortByChange={setSortBy}
                    onSortDirectionChange={setSortDirection}
                    onApply={() => void loadRows()}
                    onReset={resetFilters}
                />
            </s-section>

            <StockMovementsTable logs={rows} />
        </s-page>
    );
}