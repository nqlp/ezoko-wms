"use client";

import { type SetStateAction, useCallback, useMemo, useReducer } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { withEmbeddedParams } from '@/lib/client/embedded-url';
import { useEmbeddedBootstrap, useVendors } from '@/lib/client/hooks';
import type {
    FormLine,
    PurchaseOrderFormProps,
} from '@/components/embedded/po-form.types';
import { useSkuValidation } from '@/components/embedded/hooks/useSkuValidation';
import { useProductSearch } from '@/components/embedded/hooks/useProductSearch';
import { usePurchaseOrderSubmit } from '@/components/embedded/hooks/usePurchaseOrderSubmit';
import { formReducer, buildInitialState } from './po-form.reducer';
export type { FormState, FormAction } from './po-form.state';

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function usePurchaseOrderForm({
    mode,
    initialData,
    readOnly = false,
}: Omit<PurchaseOrderFormProps, "title">) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const purchaseOrdersHref = withEmbeddedParams("/purchase-orders", searchParams);
    const bootstrap = useEmbeddedBootstrap();

    const [state, dispatch] = useReducer(formReducer, initialData, buildInitialState);

    const { allVendorOptions, loading: loadingVendors } = useVendors(
        !bootstrap.loading && !bootstrap.error,
        state.vendor
    );

    /* Derived state */
    const immutableBySku = useMemo(
        () => new Set(state.lines.filter((line) => line.sku.trim()).map((line) => line.rowId)),
        [state.lines]
    );

    /* Sub-hooks */
    const { validateSkuForLine, isSkuValidationLoading } = useSkuValidation({
        lines: state.lines,
        validatingSkuRows: state.validatingSkuRows,
        dispatch,
    });

    const { searchProducts, searchVariants, selectProduct, selectVariant } = useProductSearch({
        dispatch,
    });

    const { submit } = usePurchaseOrderSubmit({
        state,
        dispatch,
        bootstrap,
        mode,
        initialData,
        readOnly,
        searchParams,
        router,
    });

    /* ---- Line helpers ---- */

    const updateLine = useCallback(
        (rowId: string, updater: (line: FormLine) => FormLine) => {
            dispatch({ type: "UPDATE_LINE", rowId, updater });
        },
        []
    );

    const addLine = useCallback(() => {
        dispatch({ type: "ADD_LINE" });
    }, []);

    const removeLine = useCallback((rowId: string) => {
        dispatch({ type: "REMOVE_LINE", rowId });
        dispatch({ type: "CLEAR_ROW_DATA", rowId });
    }, []);


    return {
        bootstrap,

        // Header
        header: {
            vendor: state.vendor,
            setVendor: (v: string) => dispatch({ type: "SET_VENDOR", value: v }),
            importDuties: state.importDuties,
            setImportDuties: (v: boolean) => dispatch({ type: "SET_IMPORT_DUTIES", value: v }),
            importType: state.importType,
            setImportType: (v: string) => dispatch({ type: "SET_IMPORT_TYPE", value: v }),
            expectedDate: state.expectedDate,
            setExpectedDate: (v: string) => dispatch({ type: "SET_EXPECTED_DATE", value: v }),
            shippingFees: state.shippingFees,
            setShippingFees: (v: string) => dispatch({ type: "SET_SHIPPING_FEES", value: v }),
            purchaseOrderCurrency: state.purchaseOrderCurrency,
            setPurchaseOrderCurrency: (v: string) => dispatch({ type: "SET_PURCHASE_ORDER_CURRENCY", value: v }),
            notes: state.notes,
            setNotes: (v: string) => dispatch({ type: "SET_NOTES", value: v }),
        },
        vendors: { allVendorOptions, loading: loadingVendors },

        // Lines
        lines: state.lines,
        immutableBySku,
        validatingSkuRows: state.validatingSkuRows,
        addLine,
        removeLine,
        updateLine,
        importLines: (lines: FormLine[]) => dispatch({ type: "IMPORT_LINES", lines }),

        // Search / autocomplete
        productSuggestions: state.productSuggestions,
        variantSuggestions: state.variantSuggestions,
        variantSearchResults: state.variantSearchResults,
        searchProducts,
        searchVariants,
        selectProduct,
        selectVariant,

        // SKU validation
        validateSkuForLine,
        isSkuValidationLoading,

        // Popovers
        activeProductPopoverRowId: state.activeProductPopoverRowId,
        setActiveProductPopoverRowId: (action: SetStateAction<string | null>) => {
            const rowId = typeof action === "function" ? action(state.activeProductPopoverRowId) : action;
            dispatch({ type: "SET_ACTIVE_PRODUCT_POPOVER", rowId });
        },
        activeVariantPopoverRowId: state.activeVariantPopoverRowId,
        setActiveVariantPopoverRowId: (action: SetStateAction<string | null>) => {
            const rowId = typeof action === "function" ? action(state.activeVariantPopoverRowId) : action;
            dispatch({ type: "SET_ACTIVE_VARIANT_POPOVER", rowId });
        },

        // Status
        headerError: state.headerError,
        submitError: state.submitError,
        successMessage: state.successMessage,
        submitting: state.submitting,
        submit,

        // Navigation
        purchaseOrdersHref,
        router,
    };
}