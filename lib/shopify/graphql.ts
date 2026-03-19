import "server-only";

import { ApiError } from "@/lib/http";
import type { AuthenticatedSession } from "@/lib/auth/session-token";
import { env } from "@/lib/env";
import {
  ensureOfflineAccessToken,
  refreshOfflineAccessToken,
} from "@/lib/shopify/token-exchange";
import { prisma } from "@/lib/prisma";
import { decryptAccessToken } from "@/lib/crypto/token-encryption";

// ============================================================================
// Types
// ============================================================================

interface GraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

// ============================================================================
// Internal helpers
// ============================================================================

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

function hasThrottleError<T>(payload: GraphqlResponse<T>): boolean {
  return (
    payload.errors?.some((error) => error.extensions?.code === "THROTTLED") ??
    false
  );
}

async function sendRequest<T>(
  shop: string,
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<{ status: number; payload: GraphqlResponse<T> }> {
  const response = await fetch(
    `https://${shop}/admin/api/${env.SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  let payload: GraphqlResponse<T> = {};
  try {
    payload = (await response.json()) as GraphqlResponse<T>;
  } catch {
    // keep default empty payload
  }

  return { status: response.status, payload };
}

// ============================================================================
// Core pipeline — shared by both entry points
// ============================================================================

async function executeWithRetry<T>(
  shop: string,
  initialAccessToken: string,
  query: string,
  variables?: Record<string, unknown>,
  onUnauthorized?: () => Promise<string>
): Promise<T> {
  let accessToken = initialAccessToken;

  for (let attempt = 0; attempt < 5; attempt++) {
    const result = await sendRequest<T>(shop, accessToken, query, variables);

    // On first 401, try refreshing the token (if a refresh strategy is provided)
    if (result.status === 401 && attempt === 0 && onUnauthorized) {
      accessToken = await onUnauthorized();
      continue;
    }

    // Retryable: 429, 5xx, or GraphQL THROTTLED
    if (isRetryable(result.status) || hasThrottleError(result.payload)) {
      const delayMs =
        Math.min(500 * 2 ** attempt, 6_000) + Math.floor(Math.random() * 250);
      await wait(delayMs);
      continue;
    }

    // Non-retryable HTTP error
    if (result.status >= 400) {
      throw new ApiError(
        result.status,
        result.payload.errors?.[0]?.message ?? "Shopify GraphQL request failed"
      );
    }

    // GraphQL-level errors (non-throttle)
    if (result.payload.errors && result.payload.errors.length > 0) {
      throw new ApiError(
        400,
        result.payload.errors.map((error) => error.message).join("; ")
      );
    }

    // Missing data
    if (!result.payload.data) {
      throw new ApiError(502, "Shopify GraphQL response missing data");
    }

    return result.payload.data;
  }

  throw new ApiError(429, "Shopify GraphQL request retried too many times");
}

// ============================================================================
// Public API — Embedded app (requires AuthenticatedSession)
// ============================================================================

/**
 * Execute a Shopify GraphQL query using an authenticated embedded session.
 * Handles token exchange, retry, throttle, and 401 refresh automatically.
 */
export async function runShopifyGraphql<T>(
  session: AuthenticatedSession,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const accessToken = await ensureOfflineAccessToken(session);

  return executeWithRetry<T>(
    session.shop,
    accessToken,
    query,
    variables,
    () => refreshOfflineAccessToken(session)
  );
}

// ============================================================================
// Public API — Offline / Server actions (no session required)
// ============================================================================

/**
 * Resolve the shop domain and offline access token from DB or environment.
 * Used by server actions that don't have an AuthenticatedSession.
 */
async function resolveOfflineCredentials(
  accessTokenOverride?: string
): Promise<{ shop: string; accessToken: string }> {
  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  if (!shop) {
    throw new ApiError(
      500,
      "SHOPIFY_STORE_DOMAIN is required for offline GraphQL access"
    );
  }

  // Explicit token takes priority (e.g. passed from a specific context)
  if (accessTokenOverride) {
    return { shop, accessToken: accessTokenOverride };
  }

  // Try encrypted token from DB
  const installation = await prisma.shopInstallation.findUnique({
    where: { shop },
  });

  if (installation?.encryptedAccessToken) {
    return {
      shop,
      accessToken: decryptAccessToken(installation.encryptedAccessToken),
    };
  }

  // Fallback to environment variable
  const envToken = process.env.SHOPIFY_ACCESS_TOKEN;
  if (envToken) {
    return { shop, accessToken: envToken };
  }

  throw new ApiError(
    500,
    "No offline access token available. Complete OAuth or set SHOPIFY_ACCESS_TOKEN."
  );
}

/**
 * Execute a Shopify GraphQL query using the offline access token.
 * Resolves the token from DB → env var. Same retry/throttle pipeline as the embedded path.
 *
 * @param accessTokenOverride — optional explicit token (skips DB/env resolution)
 */
export async function runShopifyGraphqlOffline<T>(
  query: string,
  variables?: Record<string, unknown>,
  accessTokenOverride?: string
): Promise<T> {
  const { shop, accessToken } =
    await resolveOfflineCredentials(accessTokenOverride);

  return executeWithRetry<T>(shop, accessToken, query, variables);
}