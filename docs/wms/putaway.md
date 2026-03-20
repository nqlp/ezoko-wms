# WMS - Putaway

## Description

The Putaway workflow is used during goods receipt. It moves stock from the special **RECEIVING** bin to a permanent storage bin in the warehouse. Accessible at `/m/putaway`.

Activity type logged: `PUTAWAY`

## Flow

```
1. Scan product barcode (starts with a digit 0-9)
       ↓
2. Product info and bin locations are displayed
   RECEIVING bin is automatically selected as source
       ↓
3. Adjust move quantity (default: 1, max: RECEIVING qty)
       ↓
4. Scan destination bin barcode (starts with a letter A-Z)
       ↓
5. Stock is moved from RECEIVING to the destination bin
```

### Step-by-step Details

**1. Scan product**
- Same as Move: calls `getVariantByBarcode()` to fetch variant + `binQty[]`
- Immediately validates that a RECEIVING bin exists and has qty > 0
- If no stock in RECEIVING → error: *"No stock on RECEIVING for [product]"*

**2. RECEIVING auto-selected**
- `findReceivingBin()` finds the bin where `binLocation.toLowerCase() === "receiving"`
- That bin is automatically set as the source: `SET_SELECTED_BINS([receivingBinId])`
- `BinLocationTable` renders with `selectionDisabled={true}` — operator cannot change the source

**3. Set quantity**
- Same `MoveQtyControl` as Move
- Maximum is capped at RECEIVING bin quantity

**4. Scan destination bin**
- Same barcode validation as Move
- Source is always RECEIVING, destination must be a different bin present in the variant's bin list
- Calls `moveStockBetweenBins({ ..., activity: "PUTAWAY" })`

**5. Result**
- RECEIVING bin quantity decreases by `moveQty`
- Destination bin quantity increases by `moveQty`
- A `StockMovementLog` record is created (`activity: PUTAWAY`)
- State resets for the next product

## Differences from Move

| Aspect | Move | Putaway |
|--------|------|---------|
| Source bin | Manually selected by operator | Automatically set to RECEIVING |
| Bin selection UI | Enabled (checkbox) | Disabled (`selectionDisabled={true}`) |
| Source validation | Any bin with stock | Must have a RECEIVING bin with qty > 0 |
| Activity logged | `MOVEMENT` | `PUTAWAY` |
| Use case | Any bin-to-bin transfer | Goods receipt from receiving dock |

## Key Files

| File | Description |
|------|-------------|
| `app/m/putaway/page.tsx` | Page — renders `WmsLayout` + `MobileScanner(mode="putaway")` |
| `components/m/MobileScanner.tsx` | Main scanner component |
| `components/m/useMobileScanner.ts` | State machine — `handleProductScan()` auto-selects RECEIVING |
| `components/m/scanner/scannerRules.ts` | `findReceivingBin()`, `RECEIVING_BIN_LOCATION = "receiving"` |
| `app/actions/moveStockBetweenBins.ts` | Server action — updates both bins and logs with `activity: PUTAWAY` |
| `components/m/scanner/moveValidation.ts` | Source bin resolution (RECEIVING) and move validation |