"use client";

import { PurchaseOrderForm } from '@/components/embedded/PurchaseOrderForm';
import { useEmbeddedBootstrap } from '@/lib/client/hooks';
import { usePurchaseOrder } from './hooks/usePurchaserOrder';

interface PurchaseOrderEditPageProps {
  poNumber: string;
}

export function PurchaseOrderEditPage({ poNumber }: PurchaseOrderEditPageProps) {
  const bootstrap = useEmbeddedBootstrap();
  const { purchaseOrder, error, loading } = usePurchaseOrder(poNumber, !bootstrap.loading && !bootstrap.error);

  const errorMessage = bootstrap.error || error;

  if (errorMessage) {
    return <div className="panel error-text">{errorMessage}</div>;
  }

  if (bootstrap.loading || loading || !purchaseOrder) {
    return <div className="panel">Loading purchase order #{poNumber}...</div>;
  }

  return (
    <PurchaseOrderForm
      mode="edit"
      title={`Modify Purchase Order #${purchaseOrder.poNumber}`}
      initialData={purchaseOrder}
      readOnly={purchaseOrder.status === "ARCHIVED"}
    />
  );
}
