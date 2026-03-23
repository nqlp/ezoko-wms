import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/client/api';
import type { PurchaseOrderDto } from '@/components/embedded/po-form.types';

export function usePurchaseOrder(poNumber: string, isReady: boolean = true) {
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isReady || !poNumber) return;

        let mounted = true;
        setLoading(true);

        (async () => {
            try {
                const response = await apiFetch<{ purchaseOrder: PurchaseOrderDto }>(
                    `/api/purchase-orders/${poNumber}`
                );
                if (mounted) {
                    setPurchaseOrder(response.purchaseOrder);
                    setError(null);
                }
            } catch (error) {
                if (mounted) {
                    setError(error instanceof Error ? error.message : "Failed to load purchase order");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [poNumber, isReady]);

    return { purchaseOrder, error, loading };
}