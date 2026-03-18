# Shopify - GraphQL API

## Client Setup

### ShopifyClient (`lib/shopify/client.ts`)

Low-level client for server-side GraphQL operations.

```typescript
const client = new ShopifyClient(accessToken?: string)
await client.query<T>(query, variables)
await client.mutate<T>(mutation, variables)
```

Token resolution order: constructor argument → `store_integration` table → `SHOPIFY_ACCESS_TOKEN` env var.

### runShopifyGraphql (`lib/shopify/graphql.ts`)

Higher-level wrapper for the embedded app. Requires an `AuthenticatedSession`.

```typescript
await runShopifyGraphql<T>(session, query, variables?)
```

Features:
- Automatic offline token exchange on first call (`ensureOfflineAccessToken`)
- Auto-refresh on 401 errors
- Up to 5 retries with exponential backoff (500ms → 6s + jitter)
- Throttle handling: retries on HTTP 429 and `THROTTLED` GraphQL errors

## Queries

### `FIND_VARIANTS_BY_BARCODE_QUERY`

**File**: `lib/shopify/queries/variantQuery.ts`

Fetches a variant by barcode with full warehouse stock data:
- Variant: `id`, `title`, `sku`, `barcode`, `displayName`, `price`, `inventoryQuantity`
- Inventory: `inventoryItem.id`, `inventoryLevels` (location IDs)
- Metafields: up to 250, with nested metaobject references (used to extract bin quantities)
- Media: first image URL
- Product: `title`, `featuredMedia`

### Catalog Queries

**File**: `lib/shopify/catalog.ts` (inline GQL strings)

| Query | Description |
|-------|-------------|
| `Vendors` | Paginates all product vendors (250/page) |
| `SearchProducts` | Searches products + variants by title (returns up to 20) |
| `SearchVariantsByTitle` | Searches variants by title (returns up to 20) |
| `VerifyProductTitle` | Exact product title match check |
| `FindProductByHandle` | Fetch product by handle |
| `ProductVariants` | Fetch up to 100 variants for a given product ID |
| `ValidateSku` | Search variants by SKU for import validation |

### Extension Queries

**File**: `bin-location-extension/extensions/bin-location/src/graphql/queries.ts`

| Query | Description |
|-------|-------------|
| `VARIANT_WAREHOUSE_STOCK_QUERY` | Fetches variant stock with metafield references for bin data |
| `SEARCH_BIN_LOCATIONS_QUERY` | Searches `bin_location` metaobjects by title |
| `STAFF_MEMBER_QUERY` | Fetches a staff member's name by ID (for logging) |

## Mutations

Shared mutations are defined in `shared/graphql/mutations.ts` and re-exported from both the main app and the extension.

### `METAOBJECT_UPDATE_MUTATION`

Updates fields on a Shopify metaobject (used to change bin quantities).

```graphql
mutation MetaobjectUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) {
  metaobjectUpdate(id: $id, metaobject: $metaobject) {
    metaobject { id, displayName, fields { key, value } }
    userErrors { field, message, code }
  }
}
```

Called by: `UpdateBinQtyByID()` server action, `saveStock()` in the extension.

### `INVENTORY_SET_QUANTITIES_MUTATION`

Syncs the total on-hand quantity to Shopify's inventory system.

```graphql
mutation InventorySetQuantities($input: InventorySetQuantitiesInput!) {
  inventorySetQuantities(input: $input) {
    inventoryAdjustmentGroup { reason, changes { delta } }
    userErrors { field, message, code }
  }
}
```

Called by: `syncShopifyInventory()` server action, `saveStock()` in the extension.

## API Routes

### Products & Variants

| Route | Method | Description |
|-------|--------|-------------|
| `/api/shopify/variants/validate-sku` | GET | Validate SKU, returns matches + `isExactSingleMatch` |
| `/api/shopify/variants/search` | GET | Search variants by title (`q` ≥ 1 char) |
| `/api/shopify/products/search` | GET | Search products by title (`q` ≥ 2 chars) |
| `/api/shopify/products/validate-excel-import` | POST | Validate a batch of rows from CSV/Excel import |
| `/api/shopify/vendors` | GET | List all vendors (cached 30 min in `ShopifyVendorCache`) |

All routes require a valid Shopify session token (`requireShopifySession()`).

### Excel Import Validation (`POST /api/shopify/products/validate-excel-import`)

Validates rows before saving to a PO:
1. Extracts unique SKUs and product handles from all rows
2. Runs `validateSku()` and `validateProductByHandle()` in parallel (`Promise.all`)
3. Validates `qty` (positive integer) and `unit_cost` (positive number) per row
4. Returns `{ issues, hasErrors, validRows }`
