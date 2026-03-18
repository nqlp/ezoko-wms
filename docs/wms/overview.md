# WMS - Overview

## Description

The WMS (Warehouse Management System) is a mobile-optimized interface for warehouse operators. It is accessible at `/m/` and designed for small screens (max 360px width). Operators use it with a physical barcode scanner to move stock between bin locations in the warehouse.

Authentication uses Shopify OAuth with a cookie-based session (`wms_session`, 7-day TTL).

## Main Routes

| Route | Description |
|-------|-------------|
| `/m/login` | Redirects to Shopify OAuth flow |
| `/m` | Home — displays the Ezoko logo, requires authentication |
| `/m/move` | Stock movement between any two bins |
| `/m/putaway` | Goods receipt — moves stock from RECEIVING to a storage bin |

## Key Components

| Component | File | Description |
|-----------|------|-------------|
| `WmsLayout` | `components/m/wmsLayout.tsx` | Drawer navigation with AppBar, user avatar, logout |
| `MobileScanner` | `components/m/MobileScanner.tsx` | Main scanner component, handles both move and putaway modes |
| `ScanInput` | `components/m/ScanInput.tsx` | Invisible input catcher for physical scanner + manual fallback |
| `BinLocationTable` | `components/m/BinLocationTable.tsx` | Displays bin locations with selectable checkboxes |
| `MoveQtyControl` | `components/m/MoveQtyControl.tsx` | +/- quantity selector |
| `SnackBar` | `components/m/SnackBar.tsx` | Auto-hiding success/error alerts |
| `AppBar` | `components/m/AppBar.tsx` | Top bar with menu button and user avatar |

## State Management

Each scanner page uses a `useReducer`-based state machine (`components/m/scanner/scannerState.ts`). State tracks: current variant, stock locations, selected bins, move quantity, loading state, and error/success messages.

## Server Actions (`app/actions/`)

| Action | Description |
|--------|-------------|
| `getVariantByBarcode(barcode)` | Looks up a product variant by barcode via Shopify GraphQL |
| `getVariantById(id)` | Same, but by variant ID |
| `moveStockBetweenBins(input)` | Updates both bin quantities and logs the movement |
| `UpdateBinQtyByID(id, qty)` | Updates a single bin's metaobject quantity |
| `saveInventoryChanges(...)` | Batch update bins + sync total to Shopify |
| `syncShopifyInventory(...)` | Syncs on-hand total to Shopify inventory system |
