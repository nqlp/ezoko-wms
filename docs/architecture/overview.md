# Architecture - Overview

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1 |
| Language | TypeScript | 5 |
| UI (Embedded) | React + Shopify App Bridge | 19.2 |
| UI (Mobile) | Material UI (MUI) | 7.3 |
| CSS | Tailwind CSS | 4 |
| ORM | Prisma | 7.3 |
| Database | PostgreSQL | — |
| Shopify API | @shopify/shopify-api | 12.3 |
| Validation | Zod | 4.3 |
| Auth/Crypto | jose (JWT) + custom AES-256 encryption | 6.2 |
| File parsing | PapaParse (CSV), xlsx (Excel) | — |

## Project Structure

```
ezoko-frontend/
├── app/                          # Next.js App Router
│   ├── (embedded)/               # Embedded Shopify Admin app
│   │   ├── logs/                 # Activity logs page
│   │   └── purchase-orders/      # PO management (list, create, edit)
│   ├── m/                        # WMS Mobile interface
│   │   ├── login/                # Login
│   │   ├── move/                 # Stock movement between bins
│   │   └── putaway/              # Goods receipt workflow
│   ├── api/                      # API Routes
│   │   ├── auth/                 # OAuth, CSRF, token-exchange, logout
│   │   ├── purchase-orders/      # PO CRUD
│   │   ├── shopify/              # Products, variants, vendors
│   │   ├── logs/                 # Activity logs
│   │   └── user-prefs/           # User preferences
│   ├── actions/                  # Server Actions (barcode lookup, stock moves)
│   └── scan/                     # Barcode scanner UI
│
├── components/
│   ├── embedded/                 # Shopify Admin components (PO forms, logs, tables)
│   └── m/                        # Mobile WMS components (scanner, bin table, layout)
│
├── lib/
│   ├── auth/                     # Session management, CSRF, token verification
│   ├── shopify/                  # GraphQL client, queries, mutations, catalog
│   ├── types/                    # TypeScript types (ProductVariant, StockLocation, etc.)
│   ├── validation/               # Zod schemas for PO and input validation
│   ├── config/                   # Shopify configuration
│   ├── crypto/                   # Token encryption (AES-256)
│   ├── logs/                     # Log filtering and types
│   ├── po/                       # Purchase order service layer
│   └── utils/                    # General utilities
│
├── shared/                       # Shared code between main app and extensions
│   ├── types/                    # Activity enum, StockItem, BinLocation
│   └── graphql/                  # Shared mutations
│
├── bin-location-extension/       # Shopify Admin UI Extension (separate build)
│   └── extensions/bin-location/  # Preact extension for bin management
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
│
└── docs/                         # This documentation
```

## Interfaces

The application has two distinct user interfaces:

### 1. Embedded Shopify App — `app/(embedded)/`

Runs inside the Shopify Admin panel. Used by office staff for:

- **Purchase Order Management** — Create, edit, list POs with filtering by status, vendor, date range. Import items from CSV/Excel files.
- **Activity Logs** — View and filter all stock movement logs (by activity type, user, barcode, date range).

Uses Shopify App Bridge for session management and Polaris-style UI patterns.

### 2. WMS Mobile — `app/m/`

Mobile-optimized interface (max 360px) for warehouse operators. Used for:

- **Putaway** — Receive goods from RECEIVING bin to storage bins.
- **Move** — Transfer stock between bins.
- **Barcode Scanning** — Physical scanner integration via hidden input catcher.

Uses Material UI for responsive mobile components. Authentication via Shopify OAuth with session cookies.

## Key Flows

| Flow | Entry Point | Description |
|------|-------------|-------------|
| Barcode Scan → Stock Move | `/m/move` | Scan product → select source bin → set qty → scan destination bin |
| Putaway | `/m/putaway` | Scan product → auto-select RECEIVING → scan destination bin |
| PO Creation | `/(embedded)/purchase-orders/new` | Fill form or import Excel → validate SKUs → save to database |
| Correction | Bin Location Extension | Edit bin qty in Shopify Admin → sync to Shopify inventory |
| Log Filtering | `/(embedded)/logs` | Apply filters → API call → Prisma query → display results |

## Diagrams

- [Filter Logs Flow](diagrams/filterLogs.puml) — Sequence diagram of the log filtering pipeline
