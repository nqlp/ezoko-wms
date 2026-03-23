"use client";

import { useCallback } from "react";
import { useRouter, type ReadonlyURLSearchParams } from "next/navigation";
import { withEmbeddedParams } from "@/lib/client/embedded-url";
import { createPurchaseOrder, updatePurchaseOrder } from "@/lib/client/purchaseOrderApi";
import { validatePurchaseOrderForm } from "@/lib/po/validateFormState";
import type { PurchaseOrderDto } from "@/components/embedded/po-form.types";
import type { FormState, FormAction } from "@/components/embedded/usePurchaseOrderForm";

export function usePurchaseOrderSubmit(params: {
    state: FormState;
    dispatch: React.Dispatch<FormAction>;
    bootstrap: {
        loading: boolean;
        error: string | null;
        csrfToken: string | null;
    };
    mode: "create" | "edit";
    initialData: PurchaseOrderDto | undefined;
    readOnly: boolean;
    searchParams: ReadonlyURLSearchParams;
    router: ReturnType<typeof useRouter>;
}): {
    submit: () => Promise<void>;
} {
    const { state, dispatch, bootstrap, mode, initialData, readOnly, searchParams, router } = params;

    const submit = useCallback(async () => {
        if (readOnly || state.submitting || bootstrap.loading) return;

        dispatch({ type: "SET_SUBMIT_ERROR", error: null });
        dispatch({ type: "SET_HEADER_ERROR", error: null });

        if (!bootstrap.csrfToken) {
            dispatch({
                type: "SET_SUBMIT_ERROR",
                error: "Creation failed: missing CSRF token. Reload the page and open the app from Shopify Admin.",
            });
            return;
        }

        const validation = validatePurchaseOrderForm(state);
        if (!validation.success) {
            if (validation.headerError) {
                dispatch({ type: "SET_HEADER_ERROR", error: validation.headerError });
            }
            if (validation.submitError) {
                dispatch({ type: "SET_SUBMIT_ERROR", error: validation.submitError });
            }
            return;
        }

        const payload = validation.payload;

        try {
            dispatch({ type: "SET_SUBMITTING", value: true });
            dispatch({ type: "SET_SUCCESS_MESSAGE", message: null });

            if (mode === "create") {
                const created = await createPurchaseOrder(payload, bootstrap.csrfToken);

                dispatch({
                    type: "SET_SUCCESS_MESSAGE",
                    message: `Purchase order #${created.poNumber} created successfully.`,
                });

                const nextListHref = withEmbeddedParams(
                    `/purchase-orders?createdPoNumber=${encodeURIComponent(created.poNumber)}`,
                    searchParams
                );
                router.push(nextListHref);
                router.refresh();
            } else {
                const poNumber = initialData?.poNumber;
                if (!poNumber) throw new Error("Missing purchase order number");

                await updatePurchaseOrder(poNumber, payload, bootstrap.csrfToken);

                dispatch({
                    type: "SET_SUCCESS_MESSAGE",
                    message: `Purchase order #${poNumber} updated successfully.`,
                });
                router.refresh();
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save purchase order.";
            dispatch({ type: "SET_SUBMIT_ERROR", error: message });
            console.error("Error submitting purchase order form", error);
        } finally {
            dispatch({ type: "SET_SUBMITTING", value: false });
        }
    }, [
        readOnly,
        state,
        bootstrap.loading,
        bootstrap.csrfToken,
        mode,
        initialData?.poNumber,
        searchParams,
        router,
        dispatch,
    ]);

    return { submit };
}
