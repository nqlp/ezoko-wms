"use client";

import { apiFetch } from "@/lib/client/api";
import type { ProductOption, VariantOption } from "@/components/embedded/po-form.types";
import type { SkuValidationMatch } from "@/lib/shopify/sku-utils";

export async function searchProducts(query: string): Promise<ProductOption[]> {
    const payload = await apiFetch<{ products: ProductOption[] }>(
        `/api/shopify/products/search?q=${encodeURIComponent(query)}`
    );
    return payload.products;
}

export async function searchVariants(query: string): Promise<VariantOption[]> {
    const payload = await apiFetch<{ variants: VariantOption[] }>(
        `/api/shopify/variants/search?q=${encodeURIComponent(query)}`
    );
    return payload.variants;
}

export async function fetchProductVariants(productId: string): Promise<VariantOption[]> {
    const payload = await apiFetch<{ variants: VariantOption[] }>(
        `/api/shopify/products/${encodeURIComponent(productId)}/variants`
    );
    return payload.variants;
}

export async function validateSkuApi(sku: string): Promise<{
    matches: SkuValidationMatch[];
    count: number;
}> {
    return apiFetch(`/api/shopify/variants/validate-sku?sku=${encodeURIComponent(sku)}`);
}
