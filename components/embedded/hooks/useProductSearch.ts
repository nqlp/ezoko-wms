"use client";

import { useCallback } from "react";
import {
    searchProducts as apiSearchProducts,
    searchVariants as apiSearchVariants,
    fetchProductVariants,
} from "@/lib/client/shopifyProductApi";
import type { ProductOption, VariantOption } from "../po-form.types";
import type { FormAction } from "@/components/embedded/usePurchaseOrderForm";

export function useProductSearch(params: {
    dispatch: React.Dispatch<FormAction>;
}): {
    searchProducts: (rowId: string, query: string) => Promise<void>;
    searchVariants: (rowId: string, query: string) => Promise<void>;
    selectProduct: (rowId: string, product: ProductOption) => Promise<void>;
    selectVariant: (rowId: string, variant: VariantOption) => void;
} {
    const { dispatch } = params;

    const searchProducts = useCallback(async (rowId: string, query: string) => {
        if (query.trim().length < 2) {
            dispatch({ type: "SET_PRODUCT_SUGGESTIONS", rowId, products: [] });
            dispatch({ type: "CLEAR_POPOVER_IF_MATCH", rowId, target: "product" });
            return;
        }

        try {
            const products = await apiSearchProducts(query);
            dispatch({ type: "SET_PRODUCT_SUGGESTIONS", rowId, products });
            dispatch({ type: "SET_ACTIVE_PRODUCT_POPOVER", rowId });
        } catch {
            dispatch({ type: "SET_PRODUCT_SUGGESTIONS", rowId, products: [] });
            dispatch({ type: "CLEAR_POPOVER_IF_MATCH", rowId, target: "product" });
        }
    }, [dispatch]);

    const searchVariants = useCallback(async (rowId: string, query: string) => {
        if (query.trim().length < 1) {
            dispatch({ type: "SET_VARIANT_SEARCH_RESULTS", rowId, variants: [] });
            dispatch({ type: "CLEAR_POPOVER_IF_MATCH", rowId, target: "variant" });
            return;
        }

        try {
            const variants = await apiSearchVariants(query);
            dispatch({ type: "SET_VARIANT_SEARCH_RESULTS", rowId, variants });
            dispatch({ type: "SET_ACTIVE_VARIANT_POPOVER", rowId });
        } catch {
            dispatch({ type: "SET_VARIANT_SEARCH_RESULTS", rowId, variants: [] });
            dispatch({ type: "CLEAR_POPOVER_IF_MATCH", rowId, target: "variant" });
        }
    }, [dispatch]);

    const selectProduct = useCallback(async (rowId: string, product: ProductOption) => {
        dispatch({
            type: "UPDATE_LINE",
            rowId,
            updater: (line) => ({
                ...line,
                productId: product.id,
                productTitle: product.title,
                variantId: null,
                variantTitle: "",
            }),
        });

        dispatch({ type: "SET_PRODUCT_SUGGESTIONS", rowId, products: [] });
        dispatch({ type: "CLEAR_POPOVER_IF_MATCH", rowId, target: "product" });

        try {
            const variants = await fetchProductVariants(product.id);
            dispatch({ type: "SET_VARIANT_SUGGESTIONS", rowId, variants });
        } catch {
            dispatch({ type: "SET_VARIANT_SUGGESTIONS", rowId, variants: product.variants ?? [] });
        }
    }, [dispatch]);

    const selectVariant = useCallback((rowId: string, variant: VariantOption) => {
        dispatch({
            type: "UPDATE_LINE",
            rowId,
            updater: (line) => ({
                ...line,
                variantId: variant.id,
                variantTitle: variant.variantTitle,
                sku: line.sku || variant.sku || "",
                skuError: null,
                ...(variant.productId && !line.productId ? { productId: variant.productId } : {}),
                ...(variant.productTitle && !line.productTitle ? { productTitle: variant.productTitle } : {}),
            }),
        });
        dispatch({ type: "SET_VARIANT_SEARCH_RESULTS", rowId, variants: [] });
        dispatch({ type: "CLEAR_POPOVER_IF_MATCH", rowId, target: "variant" });
    }, [dispatch]);

    return {
        searchProducts,
        searchVariants,
        selectProduct,
        selectVariant
    }
}
