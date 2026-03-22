"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/client/api";
import { useEmbeddedBootstrap } from "@/lib/client/hooks";
import { PurchaseOrderTableRow } from "./PurchaseOrderTable";
import { EMPTY_FILTERS, FiltersState, SortBy, SortDirection, toQueryParams } from "./purchase-order-list-types";
import { canCheckIn } from '@/lib/po/params';
import type { PoHeaderStatus } from "@/lib/constants";

interface UserPrefsResponse {
    filters: {
        status?: string | null;
        vendor?: string | null;
        poNumber?: string | null;
        expectedDateStart?: string | null;
        expectedDateEnd?: string | null;
        createdAtStart?: string | null;
        createdAtEnd?: string | null;
        importType?: string | null;
        importDuties?: boolean | null;
        hasNotes?: boolean | null;
        sku?: string | null;
    } | null;
    sorting: {
        sortBy?: string | null;
        sortDirection?: string | null;
    } | null;
}

function mapPrefsToFilters(prefs: UserPrefsResponse["filters"]): FiltersState {
    if (!prefs) {
        return {
            ...EMPTY_FILTERS
        };
    }
    return {
        status: prefs.status ?? "",
        vendor: prefs.vendor ?? "",
        expectedDateStart: prefs.expectedDateStart ?? "",
        expectedDateEnd: prefs.expectedDateEnd ?? "",
        createdAtStart: prefs.createdAtStart ?? "",
        createdAtEnd: prefs.createdAtEnd ?? "",
        importDuties: prefs.importDuties === true ? "true" : prefs.importDuties === false ? "false" : "",
        importType: prefs.importType ?? "",
        hasNotes: prefs.hasNotes === true ? "true" : prefs.hasNotes === false ? "false" : "",
        poNumber: prefs.poNumber ?? "",
        sku: prefs.sku ?? ""
    };
}


export default function usePurchaseOrderList() {
    const bootstrap = useEmbeddedBootstrap();
    const searchParams = useSearchParams();
    const [vendors, setVendors] = useState<string[]>([]);
    const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS);
    const [sortBy, setSortBy] = useState<SortBy>("createdAt");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [rows, setRows] = useState<PurchaseOrderTableRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inlineErrors, setInlineErrors] = useState<Record<string, string>>({});
    const [initialized, setInitialized] = useState(false);
    const [createSuccessMessage, setCreateSuccessMessage] = useState<string | null>(null);

    const loadRows = useCallback(async (
        nextFilters = filters,
        nextSortBy = sortBy,
        nextSortDirection = sortDirection
    ) => {
        if (bootstrap.loading || bootstrap.error) return;

        try {
            setLoading(true);
            setError(null);
            const query = toQueryParams(nextFilters, nextSortBy, nextSortDirection);
            const response = await apiFetch<{ purchaseOrders: PurchaseOrderTableRow[] }>(
                `/api/purchase-orders?${query}`
            );
            setRows(response.purchaseOrders);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load purchase orders");
        } finally {
            setLoading(false);
        }
    }, [bootstrap.loading, bootstrap.error, filters, sortBy, sortDirection]);

    useEffect(() => {
        if (bootstrap.loading || bootstrap.error || initialized) return;

        let mounted = true;

        (async () => {
            try {
                const [prefsResponse, vendorsResponse] = await Promise.all([
                    apiFetch<UserPrefsResponse>("/api/user-prefs"),
                    apiFetch<{ vendors: string[] }>("/api/shopify/vendors")
                ]);

                if (!mounted) return;

                setVendors(vendorsResponse.vendors);

                let initialFilters = mapPrefsToFilters(prefsResponse.filters);
                let initialSortBy = (prefsResponse.sorting?.sortBy as SortBy) || "createdAt";
                let initialSortDir = (prefsResponse.sorting?.sortDirection as SortDirection) || "desc";

                const createdPoFromUrl = searchParams.get("createdPoNumber")?.trim();
                if (createdPoFromUrl && /^\d+$/.test(createdPoFromUrl)) {
                    initialFilters = { ...EMPTY_FILTERS, poNumber: createdPoFromUrl };
                    initialSortBy = "createdAt";
                    initialSortDir = "desc";
                    setCreateSuccessMessage(`Purchase order ${createdPoFromUrl} created successfully`);
                } else {
                    setCreateSuccessMessage(null);
                }

                setFilters(initialFilters);
                setSortBy(initialSortBy);
                setSortDirection(initialSortDir);

                await loadRows(initialFilters, initialSortBy, initialSortDir);

            } catch (err) {
                if (mounted) setError(err instanceof Error ? err.message : "Initialization failed");
            } finally {
                if (mounted) setInitialized(true);
            }
        })();

        return () => { mounted = false; };
    }, [bootstrap.error, bootstrap.loading, initialized, searchParams, loadRows]);

    const hasActiveFilters = useMemo(() => {
        return (Object.keys(filters) as Array<keyof FiltersState>).some(
            (key) => filters[key] !== EMPTY_FILTERS[key]
        );
    }, [filters]);

    async function savePreferences(f = filters, s = sortBy, d = sortDirection) {
        if (!bootstrap.csrfToken) return;

        await apiFetch("/api/user-prefs", {
            method: "PUT",
            csrfToken: bootstrap.csrfToken,
            body: JSON.stringify({
                filters: {
                    ...f,
                    importDuties: f.importDuties === "" ? null : f.importDuties === "true",
                    hasNotes: f.hasNotes === "" ? null : f.hasNotes === "true",
                },
                sorting: { sortBy: s, sortDirection: d }
            })
        });
    }

    async function runCheckIn(poNumber: string, status: string) {
        if (!bootstrap.csrfToken) return;

        if (!canCheckIn(status as PoHeaderStatus)) {
            setInlineErrors(prev => ({
                ...prev,
                [poNumber]: "Check-in only allowed for OPEN POs"
            }));
            return;
        }

        try {
            await apiFetch(`/api/purchase-orders/${poNumber}/check-in`, {
                method: "POST",
                csrfToken: bootstrap.csrfToken
            });
            setInlineErrors(prev => ({
                ...prev,
                [poNumber]: ""
            }));
            await loadRows();
        } catch (error) {
            setInlineErrors(prev => ({
                ...prev,
                [poNumber]: error instanceof Error ? error.message : "Check-in failed"
            }));
        }
    }

    function resetFilters() {
        setFilters(EMPTY_FILTERS);
        setSortBy("createdAt");
        setSortDirection("desc");
        loadRows(EMPTY_FILTERS, "createdAt", "desc");
        savePreferences(EMPTY_FILTERS, "createdAt", "desc");
    }

    return {
        bootstrapLoading: bootstrap.loading,
        bootstrapError: bootstrap.error,
        rows,
        vendors,
        filters,
        sortBy,
        sortDirection,
        loading,
        error,
        initialized,
        inlineErrors,
        createSuccessMessage,
        hasActiveFilters,
        setFilters,
        setSortBy,
        setSortDirection,
        loadRows,
        savePreferences,
        runCheckIn,
        resetFilters,
    };
}