import { prisma } from '@/lib/prisma';
import type { AuthenticatedSession } from '@/lib/auth/session-token';
import { runShopifyGraphql } from '@/lib/shopify/graphql';
import type { SkuValidationMatch } from '@/lib/shopify/sku-utils';
export { interpretSkuMatches, type SkuValidationMatch } from '@/lib/shopify/sku-utils';
import {
  VERIFY_PRODUCT_TITLE_QUERY,
  FIND_PRODUCT_BY_HANDLE_QUERY,
  VENDORS_QUERY,
  SEARCH_PRODUCTS_QUERY,
  SEARCH_VARIANTS_BY_TITLE_QUERY,
  PRODUCT_VARIANTS_QUERY,
  VALIDATE_SKU_QUERY,
} from '@/lib/shopify/queries/catalogQueries';

const VENDOR_CACHE_TTL_MS = 30 * 60 * 1000;

interface ProductVendorsResponse {
  productVendors: {
    nodes: string[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

interface ProductSearchResponse {
  products: {
    nodes: Array<{
      handle: string;
      id: string;
      title: string;
      vendor: string;
      variants: {
        nodes: Array<{
          id: string;
          title: string;
          sku: string | null;
          selectedOptions: Array<{ name: string; value: string }>;
        }>;
      };
    }>;
  };
}

interface ProductByHandleResponse {
  productByHandle: {
    handle: string;
    title: string;
  } | null;
}

interface ProductVariantsResponse {
  product: {
    id: string;
    title: string;
    variants: {
      nodes: Array<{
        id: string;
        title: string;
        sku: string | null;
        selectedOptions: Array<{ name: string; value: string }>;
      }>;
    };
  } | null;
}

interface VariantSearchResponse {
  productVariants: {
    nodes: Array<{
      id: string;
      title: string;
      sku: string | null;
      product: { id: string; title: string };
      selectedOptions: Array<{ name: string; value: string }>;
    }>;
  };
}

interface SkuValidationResponse {
  productVariants: {
    nodes: Array<{
      id: string;
      sku: string | null;
      product: { id: string; title: string };
      selectedOptions: Array<{ name: string; value: string }>;
    }>;
  };
}

export interface ShopifyVariantLite {
  id: string;
  sku: string | null;
  title: string;
  variantTitle: string;
}

export interface ShopifyProductLite {
  id: string;
  title: string;
  vendor: string;
  variants: ShopifyVariantLite[];
}


export async function verifyProductTitlesExist(
  session: AuthenticatedSession,
  titles: string[]): Promise<{ validTitles: string[]; invalidTitles: string[] }> {
  const uniqueTitles = [... new Set(titles.map(title => title.trim()).filter(Boolean))];
  if (uniqueTitles.length === 0) {
    return { validTitles: [], invalidTitles: [] };
  }
  const validTitles: string[] = [];
  const invalidTitles: string[] = [];

  for (const title of uniqueTitles) {
    const data = await runShopifyGraphql<ProductSearchResponse>(
      session,
      VERIFY_PRODUCT_TITLE_QUERY,
      { query: `title:"${title.replace(/"/g, '\\"')}"` }
    );

    const foundProduct = data.products.nodes.some((product) => product.title.toLowerCase() === title.toLowerCase());
    if (foundProduct) {
      validTitles.push(title);
    } else {
      invalidTitles.push(title);
    }
  }
  return { validTitles, invalidTitles };
}

export async function validateProductByHandle(
  session: AuthenticatedSession,
  handle: string,
) {
  const data = await runShopifyGraphql<ProductByHandleResponse>(
    session,
    FIND_PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );

  const product = data.productByHandle;

  if (!product) {
    throw new Error(`Product with handle "${handle}" not found`);
  }

  return {
    title: product.title,
    handle: product.handle,
  };
}
function toVariantTitle(selectedOptions: Array<{ name: string; value: string }>, fallback: string): string {
  const values = selectedOptions.map((option) => option.value).filter(Boolean);
  if (values.length === 0) {
    return fallback;
  }
  return values.join(" - ");
}
async function fetchAllVendorsFromShopify(session: AuthenticatedSession): Promise<string[]> {
  const vendors = new Set<string>();
  let after: string | null = null;

  for (; ;) {
    const data: ProductVendorsResponse = await runShopifyGraphql<ProductVendorsResponse>(
      session,
      VENDORS_QUERY,
      { first: 250, after }
    );

    for (const node of data.productVendors.nodes) {
      const vendor = node.trim();
      if (vendor) {
        vendors.add(vendor);
      }
    }

    const { hasNextPage, endCursor } = data.productVendors.pageInfo;
    if (!hasNextPage || !endCursor) {
      break;
    }

    after = endCursor;
  }

  return [...vendors].sort((a, b) => a.localeCompare(b));
}

export async function getVendors(session: AuthenticatedSession): Promise<string[]> {
  const cached = await prisma.shopifyVendorCache.findUnique({
    where: { shop: session.shop }
  });

  if (cached && Date.now() - cached.refreshedAt.getTime() < VENDOR_CACHE_TTL_MS) {
    const vendors = cached.vendors;
    if (Array.isArray(vendors)) {
      return vendors.filter((entry): entry is string => typeof entry === "string");
    }
  }

  const vendors = await fetchAllVendorsFromShopify(session);

  await prisma.shopifyVendorCache.upsert({
    where: { shop: session.shop },
    create: {
      shop: session.shop,
      vendors,
      refreshedAt: new Date()
    },
    update: {
      vendors,
      refreshedAt: new Date()
    }
  });

  return vendors;
}

export async function searchProducts(session: AuthenticatedSession, rawQuery: string): Promise<ShopifyProductLite[]> {
  const query = rawQuery.trim();
  if (!query) {
    return [];
  }

  const data = await runShopifyGraphql<ProductSearchResponse>(
    session,
    SEARCH_PRODUCTS_QUERY,
    { query }
  );

  return data.products.nodes.map((product) => ({
    id: product.id,
    title: product.title,
    vendor: product.vendor,
    variants: product.variants.nodes.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      title: variant.title,
      variantTitle: toVariantTitle(variant.selectedOptions, variant.title),
    }))
  }));
}

export interface ShopifyVariantSearchResult extends ShopifyVariantLite {
  productId: string;
  productTitle: string;
}

export async function searchVariantsByTitle(session: AuthenticatedSession, rawQuery: string): Promise<ShopifyVariantSearchResult[]> {
  const query = rawQuery.trim();
  if (!query) {
    return [];
  }

  const data = await runShopifyGraphql<VariantSearchResponse>(
    session,
    SEARCH_VARIANTS_BY_TITLE_QUERY,
    { query: `title:*${query}*` }
  );

  return data.productVariants.nodes.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    title: variant.title,
    variantTitle: toVariantTitle(variant.selectedOptions, variant.title),
    productId: variant.product.id,
    productTitle: variant.product.title,
  }));
}

export async function getProductVariants(session: AuthenticatedSession, productId: string): Promise<ShopifyVariantLite[]> {
  const data = await runShopifyGraphql<ProductVariantsResponse>(
    session,
    PRODUCT_VARIANTS_QUERY,
    { id: productId }
  );

  if (!data.product) {
    return [];
  }

  return data.product.variants.nodes.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    title: variant.title,
    variantTitle: toVariantTitle(variant.selectedOptions, variant.title),
  }));
}

export async function validateSku(session: AuthenticatedSession, rawSku: string): Promise<SkuValidationMatch[]> {
  const sku = rawSku.trim();
  if (!sku) {
    return [];
  }

  const data = await runShopifyGraphql<SkuValidationResponse>(
    session,
    VALIDATE_SKU_QUERY,
    { query: `sku:${sku}` }
  );

  const normalizedSku = sku.toLowerCase();

  return data.productVariants.nodes
    .filter((variant) => variant.sku?.toLowerCase() === normalizedSku)
    .map((variant) => ({
      variantId: variant.id,
      sku: variant.sku ?? sku,
      productId: variant.product.id,
      productTitle: variant.product.title,
      variantTitle: toVariantTitle(variant.selectedOptions, "Default Title"),
    }));
}

