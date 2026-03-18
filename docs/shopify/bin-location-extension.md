# Shopify - Bin Location Extension

## Description

A Shopify Admin UI Extension that adds a "Bin Locations" block to product variant pages. It allows back-office staff to view and edit bin-level stock quantities directly in the Shopify Admin, without opening the WMS app.

When a quantity is changed, the extension:
1. Updates the corresponding metaobject in Shopify
2. Syncs the new total to Shopify's inventory system
3. Logs a `CORRECTION` movement to the Ezoko activity log

## Structure

```
bin-location-extension/
└── extensions/bin-location/
    └── src/
        ├── BlockExtension.tsx        # Entry point — rendered on product variant page
        ├── components/
        │   ├── StockTable.tsx        # Displays bin rows (bin name + editable qty)
        │   └── AddBinLocationForm.tsx # Search field + qty input to link a new bin
        ├── hooks/
        │   ├── useWarehouseStock.ts  # Loads variant bin data from metafields
        │   └── useBinLocationSearch.ts # Debounced bin search with fuzzy scoring
        ├── services/
        │   ├── stockService.ts       # saveStock() — orchestrates updates and logging
        │   └── stockMovementLog.ts   # logCorrectionActivity() — posts to Ezoko API
        ├── graphql/
        │   ├── queries.ts            # VARIANT_WAREHOUSE_STOCK_QUERY, SEARCH_BIN_LOCATIONS_QUERY
        │   └── mutations.ts          # Re-exports from shared/graphql/mutations
        ├── types/
        │   ├── warehouseStock.ts     # StockItem, BinLocation interfaces
        │   └── api.ts                # Response types for all mutations/queries
        └── config.ts                 # Build-time configuration placeholder
```

## Features

### View & Edit Bin Quantities

`useWarehouseStock(variantId)` fetches the variant's `warehouse_stock` metafield, which holds references to `bin_qty` metaobjects. Each metaobject contains a bin location reference and a quantity field.

The `StockTable` displays these as editable rows. Changes are tracked against `initialQtyById` to detect dirty items.

### Search & Add a Bin

`useBinLocationSearch` searches `bin_location` metaobjects by title with a 300ms debounce. Results are scored and ranked:

| Score | Condition |
|-------|-----------|
| 10 | Exact match |
| 8 | Title starts with query |
| 5 | Title contains query |
| 2 | Fuzzy character match |

Top 3 results are shown as selectable buttons in `AddBinLocationForm`.

> **Note**: Adding a new bin only works if the bin is already linked to the variant's `warehouse_stock` metafield. The extension cannot create new metaobject relationships — that must be done separately.

### Save Flow (`saveStock()`)

1. For each changed bin: call `METAOBJECT_UPDATE_MUTATION` to update the quantity
2. Log a `CORRECTION` movement for each change via the Ezoko API
3. If a new bin was entered: validate it was selected from search results
4. Recalculate total on-hand and sync to Shopify via `INVENTORY_SET_QUANTITIES_MUTATION`

### Correction Logging (`logCorrectionActivity()`)

Posts to the Ezoko stock movement logs API with:
- `activity: CORRECTION`
- `barcode`, `variantTitle`, `destinationLocation`, `destinationQty`
- `user`: extracted from the JWT `sub` claim if available

Failures are logged silently and do not block the save operation.
