import { exchangeCodeForToken, generateSessionToken } from "@/lib/shopify-auth";
import { prisma } from "@/lib/prisma";
import { encryptAccessToken } from "@/lib/crypto/token-encryption";
import { NextResponse } from "next/server";
import { getAuthorizationUrl, generateState } from "@/lib/shopify-auth"; 
import { setAuthStateCookies } from "./cookies";

type OAuthCallbackParams = {
    code: string;
    state: string;
    storedState: string | undefined;
    shop: string | undefined;
    authType: string;
    appUrl: string;
};

type OAuthCallbackResult =
    | { type: "offline"; redirectUrl: string }
    | { type: "online"; redirectUrl: string; sessionToken: string };

export async function handleOAuthCallback(
    params: OAuthCallbackParams
): Promise<OAuthCallbackResult> {
    const { code, state, storedState, shop, authType, appUrl } = params;

    if (state !== storedState) {
        throw new Error("CSRF_INVALID");
    }

    const shopDomain = shop ?? process.env.SHOPIFY_STORE_DOMAIN;
    if (!shopDomain) {
        throw new Error("MISSING_SHOP_DOMAIN");
    }

    const isOnline = authType !== "offline";
    const tokenData = await exchangeCodeForToken(shopDomain, code);
    console.log("Token exchange successful!");

    if (!isOnline) {
        await prisma.shopInstallation.upsert({
            where: { shop: shopDomain },
            update: {
                encryptedAccessToken: encryptAccessToken(tokenData.accessToken),
                scopes: tokenData.scope ?? null,
            },
            create: {
                shop: shopDomain,
                encryptedAccessToken: encryptAccessToken(tokenData.accessToken),
                scopes: tokenData.scope ?? null,
            },
        });

        return {
            type: "offline",
            redirectUrl: `${appUrl}/m`
        };
    }

    if (!tokenData.associatedUser) {
        throw new Error("MISSING_ASSOCIATED_USER");
    }

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000 * 7); // 7 days
    const shopifyUserId = String(tokenData.associatedUser.id);
    const shopifyUserEmail = tokenData.associatedUser.email;
    const shopifyUserName =
        `${tokenData.associatedUser.firstName} ${tokenData.associatedUser.lastName}`.trim();

    await prisma.userSession.upsert({
        where: { shopifyUserId },
        update: {
            sessionToken,
            accessToken: tokenData.accessToken,
            expiresAt,
            shopifyUserEmail,
            shopifyUserName,
        },
        create: {
            shopifyUserId,
            shopifyUserEmail,
            shopifyUserName,
            sessionToken,
            accessToken: tokenData.accessToken,
            expiresAt,
        },
    });

    return {
        type: "online",
        redirectUrl: `${appUrl}/m`,
        sessionToken
    };
}

export async function initiateShopifyAuth(online: boolean) {
    const shop = process.env.SHOPIFY_STORE_DOMAIN;

    if (!shop) {
        return NextResponse.json(
            { error: "Missing shop parameter (SHOPIFY_STORE_DOMAIN)" },
            { status: 500 }
        );
    }

    const state = generateState();
    const type = online ? "online" : "offline";
    const authUrl = getAuthorizationUrl(shop, state, { online });

    const response = NextResponse.redirect(authUrl);
    
    setAuthStateCookies(response, state, type);

    return response;
}