import type {
    FormLine,
    ProductOption,
    VariantOption,
} from "./po-form.types";

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

export interface FormState {
    // Header fields
    vendor: string;
    importDuties: boolean;
    importType: string;
    expectedDate: string;
    shippingFees: string;
    purchaseOrderCurrency: string;
    notes: string;

    // Line items
    lines: FormLine[];

    // Autocomplete / search
    productSuggestions: Record<string, ProductOption[]>;
    variantSuggestions: Record<string, VariantOption[]>;
    variantSearchResults: Record<string, VariantOption[]>;

    // Popover visibility
    activeProductPopoverRowId: string | null;
    activeVariantPopoverRowId: string | null;

    // Validation & submission
    validatingSkuRows: Set<string>;
    headerError: string | null;
    submitError: string | null;
    successMessage: string | null;
    submitting: boolean;
}

/* ------------------------------------------------------------------ */
/*  Actions                                                            */
/* ------------------------------------------------------------------ */

export type FormAction =
    // Header
    | { type: "SET_VENDOR"; value: string }
    | { type: "SET_IMPORT_DUTIES"; value: boolean }
    | { type: "SET_IMPORT_TYPE"; value: string }
    | { type: "SET_EXPECTED_DATE"; value: string }
    | { type: "SET_SHIPPING_FEES"; value: string }
    | { type: "SET_PURCHASE_ORDER_CURRENCY"; value: string }
    | { type: "SET_NOTES"; value: string }
    // Lines
    | { type: "UPDATE_LINE"; rowId: string; updater: (line: FormLine) => FormLine }
    | { type: "ADD_LINE" }
    | { type: "REMOVE_LINE"; rowId: string }
    // Search / autocomplete
    | { type: "SET_PRODUCT_SUGGESTIONS"; rowId: string; products: ProductOption[] }
    | { type: "SET_VARIANT_SUGGESTIONS"; rowId: string; variants: VariantOption[] }
    | { type: "SET_VARIANT_SEARCH_RESULTS"; rowId: string; variants: VariantOption[] }
    // Popovers
    | { type: "SET_ACTIVE_PRODUCT_POPOVER"; rowId: string | null }
    | { type: "CLEAR_POPOVER_IF_MATCH"; rowId: string; target: "product" | "variant" | "coo" }
    | { type: "SET_ACTIVE_VARIANT_POPOVER"; rowId: string | null }
    // SKU validation
    | { type: "SKU_VALIDATION_START"; rowId: string }
    | { type: "SKU_VALIDATION_END"; rowId: string }
    // Errors / status
    | { type: "SET_HEADER_ERROR"; error: string | null }
    | { type: "SET_SUBMIT_ERROR"; error: string | null }
    | { type: "SET_SUCCESS_MESSAGE"; message: string | null }
    | { type: "SET_SUBMITTING"; value: boolean }
    // Compound: clear row-specific state on remove
    | { type: "CLEAR_ROW_DATA"; rowId: string }
    // Import items from file
    | { type: "IMPORT_LINES"; lines: FormLine[] };