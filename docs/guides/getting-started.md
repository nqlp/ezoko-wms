# Getting Started

## Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** (local or remote instance)
- **Shopify Partner account** with a development store
- A registered **Shopify App** (to get `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/nqlp/ezoko-frontend.git
cd ezoko-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and fill in the values:
```bash
cp .env.example .env
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

Add the following to your `.env` file:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/ezoko`) |
| `SHOPIFY_CLIENT_ID` | Yes | OAuth App ID from Shopify Partners dashboard |
| `SHOPIFY_CLIENT_SECRET` | Yes | OAuth App Secret from Shopify Partners dashboard |
| `SHOPIFY_APP_URL` | Yes | Public URL of this app (used for OAuth redirect). Use Railway or similar in development |
| `SHOPIFY_SCOPES` | No | OAuth scopes to request (default: `read_products`) |
| `SHOPIFY_API_VERSION` | No | Shopify Admin API version (default: `2026-01`) |
| `TOKEN_ENCRYPTION_KEY` | Yes | Base64-encoded 32-byte key for AES-256 token encryption |
| `SHOPIFY_ACCESS_TOKEN` | No | Static admin API token for system-level operations |
| `SHOPIFY_STORE_DOMAIN` | No | Store domain (e.g., `yourstore.myshopify.com`) — required if `SHOPIFY_API_URL` is not set |
| `SHOPIFY_API_URL` | No | Full GraphQL endpoint URL — overrides `SHOPIFY_STORE_DOMAIN` |

### Generating TOKEN_ENCRYPTION_KEY

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Running the Application Locally

```bash
# Development
npm run dev

## Running the Bin Location Extension (optional)

The Shopify Admin UI Extension is a separate build inside `bin-location-extension/`.

```bash
cd bin-location-extension
npm install
npm run dev 
```
