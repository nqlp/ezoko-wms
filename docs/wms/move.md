# WMS - Move

## Description

The Move workflow allows operators to transfer stock from any bin to any other bin. It is accessible at `/m/move` and uses the physical barcode scanner throughout.

Activity type logged: `MOVEMENT`

## Flow

```
1. Scan product barcode (starts with a digit 0-9)
       ↓
2. Product info and bin locations are displayed
       ↓
3. Select source bin (checkbox — single selection)
       ↓
4. Adjust move quantity (default: 1, minimum: 1)
       ↓
5. Scan destination bin barcode (starts with a letter A-Z)
       ↓
6. Stock is updated and the movement is logged
```

### Step-by-step Details

**1. Scan product**
- `handleProductScan()` calls `getVariantByBarcode()` server action
- Fetches the variant with its `binQty[]` (all bin locations and quantities)
- If the same barcode is scanned again → increments the move quantity
- Auto-selects source bin if only one bin has stock

**2. Select source bin**
- `BinLocationTable` shows all bins with quantities
- Single-select only — clicking a selected row deselects it

**3. Set quantity**
- `MoveQtyControl` with +/- buttons and a text field
- Defaults to 1; must be a positive integer

**4. Scan destination bin**
- `handleBinScan()` validates before executing:
  - A source bin must be selected
  - Destination ≠ source
  - Destination bin must exist in the variant's bin list
  - Move quantity ≤ source bin quantity
- Calls `moveStockBetweenBins()` server action

**5. Result**
- Source bin quantity decreases by `moveQty`
- Destination bin quantity increases by `moveQty`
- A `StockMovementLog` record is created (`activity: MOVEMENT`)
- Success snackbar is shown, state resets for the next scan

## Error Messages

| Condition | Message |
|-----------|---------|
| Product not found | Snackbar error (NOT_FOUND) |
| Multiple variants matched | Inline error (MULTIPLE_VARIANTS) |
| Scanned a bin barcode first | "is NOT a PRODUCT barcode" |
| No source bin selected | Inline error |
| Source = destination | "Source bin cannot be the same as destination bin" |
| Move qty > source qty | "Qty to move X is greater than qty on source bin" |
| Destination not in variant's bins | Inline error |

## Key Files

| File | Description |
|------|-------------|
| `app/m/move/page.tsx` | Page — renders `WmsLayout` + `MobileScanner(mode="move")` |
| `components/m/MobileScanner.tsx` | Main scanner component |
| `components/m/useMobileScanner.ts` | State machine hook (`useReducer`) |
| `components/m/scanner/scannerRules.ts` | `isProductBarcode()`, `isBinBarcode()`, `findBinByBarcode()` |
| `app/actions/moveStockBetweenBins.ts` | Server action — updates both bins and logs movement |
| `app/actions/getVariantByBarcode.ts` | Server action — barcode → variant + binQty[] |
| `lib/stockMovement.ts` | `logMoveActivity()` — writes to `StockMovementLog` |
