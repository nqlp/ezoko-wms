# Shopify - Authentication

## OAuth Flow

The app supports two OAuth flows depending on the use case.

### Online OAuth (WMS Mobile users)

Used by warehouse operators to authenticate in the mobile app.

1. User navigates to `/m/login` → redirected to `GET /api/auth/shopify`
2. Server sets `shopify_auth_state` (CSRF) and `shopify_auth_type: "online"` cookies
3. User is redirected to Shopify: `https://{shop}/admin/oauth/authorize?grant_options[]=per-user`
4. Shopify redirects back to `GET /api/auth/shopify/callback`
5. Server validates state, exchanges code for an online access token
6. A `UserSession` record is created in the database
7. A `wms_session` cookie is set (7 days, httpOnly)
8. User is redirected to `/m`

### Offline OAuth (Store Integration)

Used for system-level access (unattended operations, embedded app).

1. Admin initiates `GET /api/auth/shopify/offline`
2. Flow is identical to online, but without `grant_options[]=per-user`
3. A `shop_installation` record is created with the store domain and access token

**Key files**: `app/api/auth/shopify/`, `lib/shopify-auth.ts`

## Token Exchange

The embedded app uses Shopify's session token (JWT) instead of OAuth cookies. On first load, the app exchanges this token for an offline access token stored in the database.

**Endpoint**: `GET /api/auth/token-exchange`

**Flow**:
1. Embedded app sends a request with `Authorization: Bearer <session-token>`
2. `requireShopifySession()` verifies the JWT (signature, audience, expiry)
3. `ensureOfflineAccessToken(session)` checks if a `ShopInstallation` record exists
4. If missing or token is invalid: `runTokenExchange()` is called
   - Calls `POST https://{shop}/admin/oauth/access_token` with OAuth 2.0 Token Exchange grant
   - Returns a new offline access token
5. Token is encrypted with AES-256 and stored in `ShopInstallation.encryptedAccessToken`
6. Returns `{ ok: true, shop: string }`

**Key files**: `lib/shopify/token-exchange.ts`, `app/api/auth/token-exchange/route.ts`

## Sessions

### Cookie-based Sessions (WMS Mobile)

**File**: `lib/auth/session.ts`

| Function | Description |
|----------|-------------|
| `getSession()` | Reads `wms_session` cookie, returns `UserSession \| null` |
| `requireSession()` | Same, but redirects to `/m/login` if no valid session |
| `getCurrentUserName()` | Returns `shopifyUserName` from the current session |

### JWT Session Tokens (Embedded App)

**File**: `lib/auth/session-token.ts`

The embedded app sends a Shopify-issued JWT in the `Authorization` header on every request.

```typescript
interface AuthenticatedSession {
  shop: string;         // e.g. "store.myshopify.com"
  userId: string;       // Shopify staff member ID
  sessionToken: string; // Raw JWT
  payload: JWTPayload;  // Decoded payload
}
```

`authenticateSessionToken(request)` verifies:
- JWT signature using `SHOPIFY_CLIENT_SECRET`
- `aud` claim matches `SHOPIFY_CLIENT_ID`
- Extracts `shop` from the `dest` claim

### Middleware

**File**: `lib/auth/require-auth.ts`

`requireShopifySession(request, { csrf? })` — used in all embedded API routes:
1. Calls `authenticateSessionToken()` to verify the JWT
2. Optionally enforces CSRF validation (enabled by default)

## CSRF Protection

**File**: `lib/auth/csrf.ts`

Used for state-mutating requests in the embedded app.

- `createCsrfToken(session)` — HMAC-SHA256 signed token with `{ shop, userId, exp, nonce }` payload (2 hour TTL)
- `verifyCsrfToken(token, session)` — validates signature and expiration
- `requireCsrf(request, session)` — throws on invalid/missing `x-csrf-token` header (skipped for GET)

**Endpoint**: `GET /api/auth/csrf` — returns `{ csrfToken: string }` for authenticated sessions

## Logout

**Endpoint**: `GET|POST /api/auth/logout`

1. Revokes the Shopify access token via `DELETE /admin/api/.../access_tokens/current.json`
2. Deletes the `UserSession` record from the database
3. Clears all auth cookies
4. Redirects to `https://accounts.shopify.com/logout`

## Bearer Token Auth (Bin Location Extension)

**File**: `lib/auth/bearer-token.ts`

The Bin Location Extension runs in a Shopify Admin UI context and cannot use cookie-based sessions. Instead, it sends a Shopify session token via the `Authorization: Bearer <token>` header.

| Function | Description |
|----------|-------------|
| `requireBearerAuth(request)` | Extracts Bearer token, decodes it via `shopify.session.decodeSessionToken()`, verifies shop domain, returns `{ userId }`. Throws `ApiError(401)` on failure. |

**Used by**: `POST /api/stock-movements-logs`, `GET /api/stock-movements-logs`