# Prisma - Database Schema

## Enum

### Activity

Represents warehouse stock movement types.

| Value | Description |
|-------|-------------|
| `CORRECTION` | Manual quantity correction via Product Admin UI extension |
| `GOODS_RECEIPT` | Receiving items from a purchase order |
| `MOVEMENT` | Moving stock from one bin to another |
| `PUTAWAY` | Moving stock from RECEIVING bin to a storage bin |
| `PICKING` | — |
| `GOODS_ISSUE` | — |
| `INV_COUNTING` | Quantity adjustment due to inventory count discrepancy |

## Models

### store_integration

Stores Shopify offline access token for system-level API access.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `store_domain` | String | `@id`, default `ezokofishing.myshopify.com` | Store domain (primary key) |
| `access_token` | String | required | Shopify offline access token |

### StockMovementLog

Audit trail for all warehouse stock movements. Table: `stock_movement_logs`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | `@id`, `uuid()` | Unique log entry ID |
| `createdAt` | DateTime | `now()` | Timestamp of the activity |
| `user` | String? | optional | User who performed the activity |
| `activity` | Activity | required | Movement type (enum) |
| `barcode` | String? | optional | Product barcode (blank for Correction) |
| `variantTitle` | String? | optional | Product variant name |
| `srcLocation` | String? | optional | Source bin location (blank for Correction) |
| `srcQty` | Int? | optional | Quantity at source before move |
| `destinationLocation` | String? | optional | Destination bin (blank for Goods Issue) |
| `destinationQty` | Int? | optional | Quantity at destination before move |
| `referenceDoc` | String? | optional | Reference document (e.g., PO number) |

### UserSession

Online OAuth sessions for mobile WMS users. Table: `user_sessions`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | `@id`, `uuid()` | Session ID |
| `shopifyUserId` | String | `@unique` | Shopify staff member ID |
| `shopifyUserEmail` | String | required | User email |
| `shopifyUserName` | String | required | User full name |
| `sessionToken` | String | `@unique` | Unique session token |
| `accessToken` | String | required | OAuth access token |
| `expiresAt` | DateTime | required | Token expiration |
| `createdAt` | DateTime | `now()` | Session creation time |

**Indexes**: `session_token` (unique), `shopifyUserId` (unique)

### PoHeader

Purchase order header. Table: `po_header`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `poNumber` | BigInt | `@id`, autoincrement | Purchase order number |
| `vendor` | String | indexed | Vendor name |
| `status` | String | default `"OPEN"`, indexed | PO status |
| `creationUser` | String | required | User who created the PO |
| `createdAt` | DateTime | indexed | Creation timestamp |
| `importDuties` | Boolean | default `false` | Import duties flag |
| `importType` | String | default `"NO_IMPORT"` | Import classification |
| `expectedDate` | DateTime? | indexed | Expected delivery date |
| `shippingFees` | Decimal? | `Decimal(12,2)` | Shipping cost |
| `purchaseOrderCurrency` | String | default `"CAD"`, `Char(3)` | Currency code |
| `notes` | String? | optional | Additional notes |

### PoItem

Purchase order line item. Table: `po_item`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `poNumber` | BigInt | FK → PoHeader, indexed | Reference to header |
| `poItem` | Int | indexed | Line item number |
| `productTitle` | String | indexed | Product name |
| `variantTitle` | String | indexed | Variant name |
| `sku` | String? | indexed | Stock keeping unit |
| `orderQty` | Int | default `1` | Ordered quantity |
| `receivedQty` | Int? | default `0` | Received quantity |
| `status` | String | default `"OPEN"`, indexed | Item status |
| `unitCost` | Decimal? | `Decimal(12,2)` | Unit price |
| `lastReceivingDate` | DateTime? | optional | Last receipt timestamp |
| `lastModification` | DateTime | required | Last change timestamp |
| `lastModificationUser` | String | required | User who made last change |

**Primary Key**: Composite `[poNumber, poItem]`
**Relation**: `header` → PoHeader (onDelete: Restrict, onUpdate: Cascade)

### ShopInstallation

Encrypted offline access tokens for embedded app. Table: `shop_installation`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `shop` | String | `@id` | Shopify store domain |
| `encryptedAccessToken` | String | required | AES-256 encrypted token |
| `scopes` | String? | optional | OAuth scopes granted |
| `createdAt` | DateTime | `now()` | Installation time |
| `updatedAt` | DateTime | `@updatedAt` | Last update time |

### ShopifyVendorCache

Cached vendor list to avoid repeated Shopify API calls. Table: `shopify_vendor_cache`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `shop` | String | `@id` | Store domain (cache key) |
| `vendors` | Json | required | Cached vendor list |
| `refreshedAt` | DateTime | required | Cache refresh timestamp |

### UserPrefs

Per-user saved filters and sorting preferences. Table: `user_prefs`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `shop` | String | part of composite key | Store domain |
| `userId` | String | part of composite key | Shopify user ID |
| `filters` | Json? | optional | Saved filter configuration |
| `sorting` | Json? | optional | Preferred sorting |
| `updatedAt` | DateTime | `now()` | Last update |

**Primary Key**: Composite `[shop, userId]`

### PoShopScope

Maps a purchase order to a specific shop. Table: `po_shop_scope`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `poNumber` | BigInt | `@id`, FK → PoHeader | PO reference |
| `shop` | String | indexed | Store domain |

**Relation**: `header` → PoHeader (onDelete: Cascade, onUpdate: Cascade)

## Relations

- `PoHeader` 1───* `PoItem` (one header has many line items)
- `PoHeader` 1───? `PoShopScope` (one header has one optional shop scope)
- `PoItem.header` → `PoHeader` via `poNumber` (Restrict delete, Cascade update)
- `PoShopScope.header` → `PoHeader` via `poNumber` (Cascade delete, Cascade update)
