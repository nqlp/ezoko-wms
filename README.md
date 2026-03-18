# Ezoko WMS

Full-stack warehouse management application built with Next.js. It integrates with Shopify to manage inventory at the bin level and provides two interfaces: an embedded Shopify Admin app for back-office operations and a mobile WMS for warehouse operators.

## Interfaces

### Embedded Shopify App
Runs inside the Shopify Admin panel. Used by back-office staff to:
- Manage purchase orders (create, edit, import from CSV/Excel)
- View and filter stock movement activity logs

### WMS Mobile (`/m/`)
Mobile-optimized interface for warehouse operators. Used with a physical barcode scanner to:
- **PUTAWAY** — receive goods from the RECEIVING bin to storage bins
- **MOVE** — transfer stock between any two bins

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI — Embedded | React 19 + Shopify App Bridge |
| UI — Mobile | Material UI 7 |
| CSS | Tailwind CSS 4 |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Shopify API | @shopify/shopify-api 12 |
| Validation | Zod 4 |

## Getting Started

See [docs/guides/getting-started.md](docs/guides/getting-started.md) for full setup instructions.

```bash
npm install
cp .env.example .env   # fill in the values
npx prisma migrate dev
npm run dev
```

## Project Structure

```
ezoko-frontend/
├── app/
│   ├── (embedded)/       # Shopify Admin embedded app (POs, logs)
│   ├── m/                # WMS mobile (move, putaway, login)
│   ├── api/              # API routes (auth, shopify, purchase-orders, logs)
│   └── actions/          # Server actions (barcode lookup, stock moves)
├── components/
│   ├── embedded/         # Embedded app components
│   └── m/                # Mobile WMS components (scanner, bin table, layout)
├── lib/
│   ├── auth/             # Session management, CSRF, JWT verification
│   ├── shopify/          # GraphQL client, queries, mutations, catalog
│   ├── types/            # Shared TypeScript types
│   └── ...
├── shared/               # Shared types and GraphQL mutations (main app + extension)
├── bin-location-extension/ # Shopify Admin UI Extension (bin qty management)
└── prisma/               # Schema and migrations
```

## Documentation

Full documentation is available in [`docs/`](docs/README.md):

- [Architecture](docs/architecture/overview.md)
- [WMS — Move](docs/wms/move.md) / [Putaway](docs/wms/putaway.md) / [Scanner](docs/wms/scanner.md)
- [Shopify — Auth](docs/shopify/auth.md) / [GraphQL API](docs/shopify/graphql-api.md) / [Bin Location Extension](docs/shopify/bin-location-extension.md)
- [Database Schema](docs/prisma/schema.md) / [Migrations](docs/prisma/migrations.md)
- [Getting Started](docs/guides/getting-started.md)
