"use client";

import { apiFetch } from "@/lib/client/api";
import type { PurchaseOrderDto } from "@/components/embedded/po-form.types";

export async function createPurchaseOrder(
    payload: unknown,
    csrfToken: string
): Promise<{ poNumber: string }> {
    return apiFetch<{ poNumber: string }>("/api/purchase-orders", {
        method: "POST",
        csrfToken,
        body: JSON.stringify(payload),
    });
}

export async function updatePurchaseOrder(
    poNumber: string,
    payload: unknown,
    csrfToken: string
): Promise<{ purchaseOrder: PurchaseOrderDto }> {
    return apiFetch<{ purchaseOrder: PurchaseOrderDto }>(
        `/api/purchase-orders/${poNumber}`,
        {
            method: "PATCH",
            csrfToken,
            body: JSON.stringify(payload),
        }
    );
}

export async function checkInPurchaseOrder(
    poNumber: string,
    csrfToken: string
): Promise<void> {
    await apiFetch(`/api/purchase-orders/${poNumber}/check-in`, {
        method: "POST",
        csrfToken,
    });
}

export interface PurchaseOrderListResponse {
    purchaseOrders: PurchaseOrderDto[];
}

export async function fetchPurchaseOrders(
    queryParams: string
): Promise<PurchaseOrderListResponse> {
    return apiFetch<PurchaseOrderListResponse>(
        `/api/purchase-orders?${queryParams}`
    );
}
