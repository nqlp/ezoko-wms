import { useCallback, useEffect, useState } from "react";
import { LogRow } from "@/lib/logs/service";
import { apiFetch } from "@/lib/client/api";
import {
    EMPTY_LOG_FILTERS,
    LogFiltersState,
    LogSortBy,
    LogSortDirection,
    toLogQueryParams
} from "@/lib/logs/types";
import { useEmbeddedBootstrap } from "@/lib/client/hooks";

export const useLogsList = () => {
    const bootstrap = useEmbeddedBootstrap();

    const [rows, setRows] = useState<LogRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    const [filters, setFilters] = useState<LogFiltersState>(EMPTY_LOG_FILTERS);
    const [sortBy, setSortBy] = useState<LogSortBy>("createdAt");
    const [sortDirection, setSortDirection] = useState<LogSortDirection>("desc");

    const loadRows = useCallback(async (
        f = filters,
        s = sortBy,
        d = sortDirection
    ) => {
        if (bootstrap.loading || bootstrap.error) return;

        setLoading(true);
        setError(null);

        try {
            const queryString = toLogQueryParams(f, s, d);
            const response = await apiFetch<{ logs: LogRow[] }>(`/api/logs?${queryString}`);
            setRows(response.logs);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [bootstrap.loading, bootstrap.error, filters, sortBy, sortDirection]);

    useEffect(() => {
        if (!initialized && !bootstrap.loading && !bootstrap.error) {
            loadRows(EMPTY_LOG_FILTERS, "createdAt", "desc");
            setInitialized(true);
        }
    }, [bootstrap.loading, bootstrap.error, initialized, loadRows]);

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        return value !== EMPTY_LOG_FILTERS[key as keyof LogFiltersState];
    });

    const resetFilters = () => {
        setFilters(EMPTY_LOG_FILTERS);
        setSortBy("createdAt");
        setSortDirection("desc");
        loadRows(EMPTY_LOG_FILTERS, "createdAt", "desc");
    };

    return {
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
    };
};