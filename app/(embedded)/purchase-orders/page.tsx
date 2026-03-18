import { Suspense } from 'react';

import { PurchaseOrderListPage } from '@/components/embedded/PurchaseOrderListPage';

export default function PurchaseOrderListRoute() {
  return (
    <Suspense fallback={null}>
      <PurchaseOrderListPage />
    </Suspense>
  );
}
