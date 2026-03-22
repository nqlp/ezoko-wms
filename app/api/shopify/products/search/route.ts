import { NextResponse } from 'next/server';

import { requireShopifySession } from '@/lib/auth/require-auth';
import { ApiError, handleRouteError } from '@/lib/http';
import { searchProducts } from '@/lib/shopify/catalog';

export async function GET(request: Request) {
  try {
    const session = await requireShopifySession(request, { csrf: false });
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    const products = await searchProducts(session, query);
    return NextResponse.json({ products });
  } catch (error) {
    return handleRouteError(error);
  }
}
