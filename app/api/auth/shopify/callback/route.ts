import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForToken, generateSessionToken } from "@/lib/shopify-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const shop = searchParams.get("shop");

    if (!code || !state) {
        return NextResponse.json(
            { error: "Missing code or state" },
            { status: 400 }
        );
    }

    // Check state matches the one we saved (CSRF protection)
    const cookieStore = await cookies();
    const storedState = cookieStore.get("shopify_auth_state")?.value;
    const authType = cookieStore.get("shopify_auth_type")?.value ?? "online";
    const isOnline = authType !== "offline";

    if (state !== storedState) {
        return NextResponse.json(
            { error: "Invalid state" },
            { status: 403 }
        );
    }

    cookieStore.delete("shopify_auth_state");
    cookieStore.delete("shopify_auth_type");

    try {
        const appUrl = process.env.SHOPIFY_APP_URL ?? request.nextUrl.origin;
        const shopDomain = shop ?? process.env.SHOPIFY_STORE_DOMAIN;
        if (!shopDomain) {
            return NextResponse.json(
                { error: "Missing shop domain" },
                { status: 400 }
            );
        }
        const tokenData = await exchangeCodeForToken(
            shopDomain,
            code
        );
        console.log("Token exchange successful!");

        // If offline, update store integration
        if (!isOnline) {
            await prisma.store_integration.upsert({
                where: {
                    store_domain: shopDomain,
                },
                update: {
                    access_token: tokenData.accessToken,
                },
                create: {
                    store_domain: shopDomain,
                    access_token: tokenData.accessToken,
                },
            });

            return NextResponse.redirect(`${appUrl}/m`);
        }

        if (!tokenData.associatedUser) {
            return NextResponse.json(
                { error: "Missing associated user for online OAuth" },
                { status: 500 }
            );
        }

        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000 * 7); // 7 days
        const shopifyUserId = String(tokenData.associatedUser.id);
        const shopifyUserEmail = tokenData.associatedUser.email;
        const shopifyUserName = `${tokenData.associatedUser.firstName} ${tokenData.associatedUser.lastName}`.trim();

        // Upsert: create if user session does not exist in the database or update if it does
        await prisma.userSession.upsert({
            where: {
                shopifyUserId,
            },
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

        // Set the session cookie so user stays logged in
        cookieStore.set("wms_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 7, // 7 days
            path: "/",
        });

        return NextResponse.redirect(`${appUrl}/m`);
    } catch (error) {
        console.error("OAuth callback error exchanging code for token:", error);
        return NextResponse.json(
            { error: "Failed to exchange code for token" },
            { status: 500 }
        );
    }
}