import { DEFAULT_CURRENCY } from "@/lib/constants";
import { lineId, emptyLine, decimalText } from "./po-form.utils";
import type { FormLine, PurchaseOrderDto } from "./po-form.types";
import type { FormState, FormAction } from "./po-form.state";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function deleteKey<T>(record: Record<string, T>, key: string): Record<string, T> {
    const next = { ...record };
    delete next[key];
    return next;
}

/* ------------------------------------------------------------------ */
/*  Reducer                                                            */
/* ------------------------------------------------------------------ */

export function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        // Header
        case "SET_VENDOR":
            return { ...state, vendor: action.value };
        case "SET_IMPORT_DUTIES":
            return { ...state, importDuties: action.value };
        case "SET_IMPORT_TYPE":
            return { ...state, importType: action.value };
        case "SET_EXPECTED_DATE":
            return { ...state, expectedDate: action.value };
        case "SET_SHIPPING_FEES":
            return { ...state, shippingFees: action.value };
        case "SET_PURCHASE_ORDER_CURRENCY":
            return { ...state, purchaseOrderCurrency: action.value };
        case "SET_NOTES":
            return { ...state, notes: action.value };

        // Lines
        case "UPDATE_LINE":
            return {
                ...state,
                lines: state.lines.map((line) =>
                    line.rowId === action.rowId ? action.updater(line) : line
                ),
            };
        case "ADD_LINE":
            return { ...state, lines: [...state.lines, emptyLine()] };
        case "REMOVE_LINE": {
            if (state.lines.length <= 1) {
                return state;
            }
            return {
                ...state,
                lines: state.lines.filter((line) => line.rowId !== action.rowId),
            };
        }
        case "IMPORT_LINES": {
            const hasSingleLine = state.lines.length === 1;
            const firstLine = state.lines[0];

            const isPlaceholder =
                hasSingleLine &&
                firstLine != null &&
                !firstLine.sku.trim() &&
                !firstLine.productTitle.trim() &&
                !firstLine.variantTitle.trim() &&
                (firstLine.orderQty.trim() === "" || firstLine.orderQty.trim() === "1") &&
                !firstLine.unitCost.trim();

            const nextLines = isPlaceholder
                ? action.lines
                : [...state.lines, ...action.lines];

            return { ...state, lines: nextLines };
        }

        // Search / autocomplete
        case "SET_PRODUCT_SUGGESTIONS":
            return { ...state, productSuggestions: { ...state.productSuggestions, [action.rowId]: action.products } };
        case "SET_VARIANT_SUGGESTIONS":
            return { ...state, variantSuggestions: { ...state.variantSuggestions, [action.rowId]: action.variants } };
        case "SET_VARIANT_SEARCH_RESULTS":
            return { ...state, variantSearchResults: { ...state.variantSearchResults, [action.rowId]: action.variants } };

        // Popovers
        case "SET_ACTIVE_PRODUCT_POPOVER":
            return { ...state, activeProductPopoverRowId: action.rowId };
        case "SET_ACTIVE_VARIANT_POPOVER":
            return { ...state, activeVariantPopoverRowId: action.rowId };
        case "CLEAR_POPOVER_IF_MATCH": {
            const updates: Partial<FormState> = {};
            if (action.target === "product" && state.activeProductPopoverRowId === action.rowId) {
                updates.activeProductPopoverRowId = null;
            }
            if (action.target === "variant" && state.activeVariantPopoverRowId === action.rowId) {
                updates.activeVariantPopoverRowId = null;
            }
            return { ...state, ...updates };
        }

        // SKU validation
        case "SKU_VALIDATION_START": {
            const next = new Set(state.validatingSkuRows);
            next.add(action.rowId);
            return { ...state, validatingSkuRows: next };
        }
        case "SKU_VALIDATION_END": {
            const next = new Set(state.validatingSkuRows);
            next.delete(action.rowId);
            return { ...state, validatingSkuRows: next };
        }

        // Errors / status
        case "SET_HEADER_ERROR":
            return { ...state, headerError: action.error };
        case "SET_SUBMIT_ERROR":
            return { ...state, submitError: action.error };
        case "SET_SUCCESS_MESSAGE":
            return { ...state, successMessage: action.message };
        case "SET_SUBMITTING":
            return { ...state, submitting: action.value };

        // Compound: clean up row data on remove
        case "CLEAR_ROW_DATA":
            return {
                ...state,
                productSuggestions: deleteKey(state.productSuggestions, action.rowId),
                variantSuggestions: deleteKey(state.variantSuggestions, action.rowId),
                variantSearchResults: deleteKey(state.variantSearchResults, action.rowId),
                activeProductPopoverRowId:
                    state.activeProductPopoverRowId === action.rowId ? null : state.activeProductPopoverRowId,
                activeVariantPopoverRowId:
                    state.activeVariantPopoverRowId === action.rowId ? null : state.activeVariantPopoverRowId,
            };

        default:
            return state;
    }
}

/* ------------------------------------------------------------------ */
/*  Initial state builder                                              */
/* ------------------------------------------------------------------ */

export function buildInitialState(initialData?: PurchaseOrderDto): FormState {
    return {
        vendor: initialData?.vendor ?? "",
        importDuties: initialData?.importDuties ?? false,
        importType: initialData?.importType ?? "NO_IMPORT",
        expectedDate: initialData?.expectedDate?.slice(0, 10) ?? "",
        shippingFees: decimalText(initialData?.shippingFees ?? null),
        purchaseOrderCurrency: initialData?.purchaseOrderCurrency ?? DEFAULT_CURRENCY,
        notes: initialData?.notes ?? "",

        lines: initialData?.items?.length
            ? initialData.items.map((item) => ({
                rowId: lineId(),
                existingPoItem: item.poItem,
                sku: item.sku ?? "",
                productId: null,
                productTitle: item.productTitle,
                variantId: null,
                variantTitle: item.variantTitle,
                orderQty: String(item.orderQty),
                unitCost: decimalText(item.unitCost),
                skuError: null,
            }))
            : [emptyLine()],

        productSuggestions: {},
        variantSuggestions: {},
        variantSearchResults: {},
        activeProductPopoverRowId: null,
        activeVariantPopoverRowId: null,
        validatingSkuRows: new Set(),
        headerError: null,
        submitError: null,
        successMessage: null,
        submitting: false,
    };
}