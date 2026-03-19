import { NextResponse } from 'next/server';

import { requireShopifySession } from '@/lib/auth/require-auth';
import { handleRouteError } from '@/lib/http';
import { parsePoNumber } from '@/lib/po/params';
import { getPurchaseOrder, updatePurchaseOrder } from '@/lib/po/service';
import { parseOrThrow } from '@/lib/validation/utils';
import { updatePurchaseOrderSchema } from '@/lib/validation/po';

export async function GET(
  request: Request,
  context: {
    params: Promise<{ poNumber: string }>;
  }
) {
  try {
    const session = await requireShopifySession(request, { csrf: false });
    const params = await context.params;
    const poNumber = parsePoNumber(params.poNumber);
    const purchaseOrder = await getPurchaseOrder(session, poNumber);

    return NextResponse.json({ purchaseOrder });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ poNumber: string }>;
  }
) {
  try {
    const session = await requireShopifySession(request);
    const params = await context.params;
    const poNumber = parsePoNumber(params.poNumber);
    const body = (await request.json()) as unknown;
    const input = parseOrThrow(updatePurchaseOrderSchema, body, 'Invalid purchase order update payload');
    const purchaseOrder = await updatePurchaseOrder(session, poNumber, input);

    return NextResponse.json({ purchaseOrder });
  } catch (error) {
    return handleRouteError(error);
  }
}
