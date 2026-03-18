# Shopify - Overview

## Architecture

The Shopify integration has three main areas:

1. **Embedded App** — Runs inside Shopify Admin for back-office operations (POs, logs)
2. **WMS Mobile** — Uses Shopify OAuth for authentication and Shopify GraphQL for inventory data
3. **Bin Location Extension** — Admin UI extension for managing bin-level stock directly on product pages

All three share the same Shopify GraphQL client and authentication layer.

```
Shopify Admin
├── Embedded App (app/(embedded)/)    ← Session token auth
│   ├── Purchase Orders
│   └── Activity Logs
│
├── Bin Location Extension             ← Direct admin API via extension
│   └── Product page block
│
└── OAuth Login
    └── WMS Mobile (app/m/)           ← Cookie-based session auth
```

## Key Components

| File | Purpose |
|------|---------|
| `lib/shopify/client.ts` | `ShopifyClient` class — low-level GraphQL query/mutate methods |
| `lib/shopify/graphql.ts` | `runShopifyGraphql()` — authenticated requests with retry, throttle handling, and token refresh |
| `lib/shopify/catalog.ts` | Product search, variant validation, vendor listing with caching |
| `lib/shopify/productsApi.ts` | `ProductsApi` class — variant lookup by barcode, bin qty updates, inventory sync |
| `lib/shopify/token-exchange.ts` | OAuth token exchange (online → offline) |
| `lib/config/shopify.ts` | API version, URL, store domain configuration |
| `lib/shopify/mutations/` | GraphQL mutations (metaobject update, inventory set) |
| `lib/shopify/queries/` | GraphQL queries (variant by barcode with metafields) |

## Embedded App

The embedded app lives in `app/(embedded)/` and uses Shopify App Bridge for session management.

### Routes

| Route | Description |
|-------|-------------|
| `/(embedded)/purchase-orders` | List purchase orders with filters (status, vendor, date) |
| `/(embedded)/purchase-orders/new` | Create a new purchase order (manual or Excel import) |
| `/(embedded)/purchase-orders/[poNumber]/edit` | Edit an existing purchase order |
| `/(embedded)/logs` | View and filter stock movement activity logs |

### Components (`components/embedded/`)

Key components include:
- `AppNav.tsx` — Navigation sidebar
- `PurchaseOrderForm.tsx` — PO creation/edit form with item grid
- `PurchaseOrderTable.tsx` — PO list table with filtering
- `LogsPage.tsx` / `Logs.tsx` — Activity log display and filtering
- `ExcelImportDialog.tsx` — CSV/Excel import with column mapping and validation
- `ItemGrids.tsx` — PO line item management with autocomplete
