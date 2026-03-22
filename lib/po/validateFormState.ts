import { createPurchaseOrderSchema, type CreatePurchaseOrderInput } from "@/lib/validation/po";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import type { FormLine } from "@/components/embedded/po-form.types";

interface FormStateForValidation {
    vendor: string;
    importDuties: boolean;
    importType: string;
    expectedDate: string;
    shippingFees: string;
    purchaseOrderCurrency: string;
    notes: string;
    lines: FormLine[];
}

type ValidationSuccess = { success: true; payload: CreatePurchaseOrderInput };
type ValidationFailure = {
    success: false;
    headerError?: string;
    submitError?: string;
};

export type FormValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates purchase order form state using the shared Zod schema.
 * Also checks for pre-existing SKU validation errors on lines.
 * Returns either a validated payload or user-friendly error messages.
 */
export function validatePurchaseOrderForm(
    state: FormStateForValidation
): FormValidationResult {
    // Check for pending SKU errors (async validation results stored in form state)
    for (const [index, line] of state.lines.entries()) {
        if (line.skuError) {
            return {
                success: false,
                submitError: `Line ${index + 1}: ${line.skuError}`,
            };
        }
    }

    const vendor = state.vendor.trim();
    if (!vendor || vendor === "Select Vendor" || vendor === "Loading vendors...") {
        return { success: false, headerError: "Vendor is required" };
    }

    // Build the raw payload from form state
    const raw = {
        header: {
            vendor,
            importDuties: state.importDuties,
            importType: state.importType,
            expectedDate: state.expectedDate || null,
            shippingFees: state.shippingFees.trim() || null,
            purchaseOrderCurrency: state.purchaseOrderCurrency || DEFAULT_CURRENCY,
            notes: state.notes.trim() || null,
        },
        items: state.lines.map((line) => ({
            existingPoItem: line.existingPoItem,
            sku: line.sku.trim() || null,
            productTitle: line.productTitle.trim(),
            variantTitle: line.variantTitle.trim(),
            orderQty: line.orderQty,
            unitCost: line.unitCost.trim() || null,
        })),
    };

    const result = createPurchaseOrderSchema.safeParse(raw);

    if (!result.success) {
        const firstError = result.error.issues[0];
        const path = firstError.path;

        // Map Zod path to user-friendly error location
        if (path[0] === "header") {
            return {
                success: false,
                headerError: firstError.message,
            };
        }

        if (path[0] === "items") {
            const lineIndex = typeof path[1] === "number" ? path[1] : 0;
            return {
                success: false,
                submitError: `Line ${lineIndex + 1}: ${firstError.message}`,
            };
        }

        return { success: false, submitError: firstError.message };
    }

    return { success: true, payload: result.data };
}
