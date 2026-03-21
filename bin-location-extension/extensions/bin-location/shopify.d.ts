import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/BlockExtension.tsx' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/hooks/useWarehouseStock.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/hooks/useBinLocationSearch.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/components/StockTable.tsx' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/components/AddBinLocationForm.tsx' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/services/stockService.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/graphql/queries.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/types/warehouseStock.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/utils/helpers.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/types/api.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/graphql/mutations.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/services/stockMovementLog.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/config.ts' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.block.render').Api;
  const globalThis: { shopify: typeof shopify };
}
