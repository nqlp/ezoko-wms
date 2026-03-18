# WMS - Mobile Scanner

## Description

The scanner system captures barcodes from a physical USB/Bluetooth scanner (or manual keyboard input) and dispatches them to the active workflow. It is designed to work reliably on mobile devices while managing focus across competing UI elements.

## Architecture

```
ScanInput.tsx
├── Hidden catcher div (opacity: 0, position: absolute)
│   └── Captures rapid keystrokes from physical scanner
├── Manual text field
│   └── Visible fallback for manual barcode entry
└── FIFO queue
    └── Processes barcodes sequentially even if multiple arrive at once
```

### Key Files

| File | Description |
|------|-------------|
| `components/m/ScanInput.tsx` | Main scanner input component |
| `components/m/scanner/scannerRules.ts` | Barcode classification and bin lookup helpers |
| `components/m/scanner/focusBus.ts` | Custom event system for refocus coordination |
| `components/m/scanner/scannerState.ts` | Reducer, state shape, and action types |
| `components/m/scanner/scannerApi.ts` | API wrapper functions called by the scanner |
| `components/m/scanner/scannerTypes.ts` | TypeScript types for scanner state and actions |

## Scan Modes

Barcodes are classified by their first character:

| Type | Rule | Example |
|------|------|---------|
| Product | Starts with a digit (`0-9`) | `0123456789` |
| Bin | Starts with a letter (`A-Z`, case-insensitive) | `A-01`, `RECEIVING` |

```typescript
isBinBarcode(barcode)      // true if first char is a letter
isProductBarcode(barcode)  // true if first char is a digit
```

If neither rule matches, the scan is ignored with an inline error.

### Special Bin: RECEIVING

The string `"receiving"` (case-insensitive) identifies the receiving dock bin. Used by the putaway workflow to auto-select the source.

```typescript
RECEIVING_BIN_LOCATION = "receiving"
findReceivingBin(stockLocations)  // returns the RECEIVING StockLocation or undefined
```

## Focus Management

Physical barcode scanners emit keystrokes very quickly. The hidden catcher div must stay focused at all times, or characters get typed into the wrong UI element.

### Focus Bus (`scanner/focusBus.ts`)

A lightweight custom event system to coordinate refocus across components:

```typescript
const WMS_SCAN_REFOCUS_EVENT = "wms:scan-refocus"
requestScanRefocus(reason?: string)  // dispatches event to window
```

`ScanInput` listens for `WMS_SCAN_REFOCUS_EVENT` and calls `focusCatcher(true)` in response.

### Triggers for refocus

| Trigger | Where called |
|---------|-------------|
| Snackbar closes | `MobileScanner.tsx` — `onAfterClose` |
| Drawer opens/closes | `wmsLayout.tsx` — on toggle |
| `MoveQtyControl` field blur | After qty adjustment |
| Document becomes visible | `visibilitychange` event in `ScanInput` |

## Input Queue

Physical scanners can emit a full barcode in under 50ms. If the UI is busy (e.g., a previous scan is being processed), incoming characters could be lost. `ScanInput` uses a FIFO queue:

1. Each completed barcode string is pushed to the queue
2. `processQueue()` runs sequentially — waits for each scan to finish before starting the next
3. Prevents race conditions during rapid consecutive scans
