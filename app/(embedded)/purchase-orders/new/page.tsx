import { Suspense } from 'react';

import { PurchaseOrderCreatePage } from '@/components/embedded/PurchaseOrderCreatePage';

export default function PurchaseOrderCreateRoute() {
  return (
    <Suspense fallback={null}>
      <PurchaseOrderCreatePage />
    </Suspense>
  );
}
