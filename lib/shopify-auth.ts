/**
 * Shopify OAuth Configuration using @shopify/shopify-api
 * 
 * This module configures the official Shopify API library for OAuth
 * authentication on mobile WMS screens.
 * 
 * NOTE: This is SEPARATE from lib/config/shopify.ts which uses
 * a stored Admin API token for system-level operations.
 */

import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
import crypto from "crypto";

// Initialize the Shopify API client
export const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_CLIENT_ID_BIN_LOCATION_EXTENSION!,
    apiSecretKey: process.env.SHOPIFY_CLIENT_SECRET_BIN_LOCATION_EXTENSION!,
    scopes: (process.env.SHOPIFY_OAUTH_SCOPES || "read_inventory,write_inventory").split(","),
    hostName: process.env.APP_URL ? new URL(process.env.APP_URL).hostname : "localhost",
    apiVersion: ApiVersion.January26,
    isEmbeddedApp: false,
});

/**
 * Generate a cryptographically secure random session token.
 * This will be stored in a cookie for session management.
 */
export function generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a state parameter for CSRF protection.
 */
export function generateState(): string {
    return crypto.randomBytes(16).toString("hex");
}

/**
 * Get the OAuth authorization URL using the Shopify library.
 */
export function getAuthorizationUrl(
    shop: string,
    state: string,
    options?: { online?: boolean; }
): string {
    const appUrl = process.env.APP_URL?.replace(/\/+$/, "");
    if (!appUrl) {
        throw new Error("APP_URL is required to build Shopify OAuth redirect URI");
    }

    const redirectUri = `${appUrl}/api/auth/shopify/callback`;
    const scopes = process.env.SHOPIFY_OAUTH_SCOPES || "read_inventory,write_inventory";
    const isOnline = options?.online !== false;

    // Build authorization URL for online (per-user) access tokens
    const baseUrl = `https://${shop}/admin/oauth/authorize?` +
        `client_id=${process.env.SHOPIFY_CLIENT_ID_BIN_LOCATION_EXTENSION}` +
        `&scope=${scopes}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${state}`;

    return isOnline ? `${baseUrl}&grant_options[]=per-user` : baseUrl;
}

/**
 * Exchange authorization code for access token.
 * Returns both the token and associated user info.
 */
export async function exchangeCodeForToken(
    shop: string,
    code: string
): Promise<{
    accessToken: string;
    scope: string;
    expiresIn: number;
    associatedUser?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}> {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: process.env.SHOPIFY_CLIENT_ID_BIN_LOCATION_EXTENSION!,
            client_secret: process.env.SHOPIFY_CLIENT_SECRET_BIN_LOCATION_EXTENSION!,
            code,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Shopify token exchange failed:", response.status, error);
        throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        scope: data.scope,
        expiresIn: data.expires_in,
        associatedUser: data.associated_user
            ? {
                id: data.associated_user.id,
                firstName: data.associated_user.first_name,
                lastName: data.associated_user.last_name,
                email: data.associated_user.email,
            }
            : undefined,
    };
}
