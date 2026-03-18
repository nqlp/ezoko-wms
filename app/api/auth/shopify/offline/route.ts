import { NextResponse } from "next/server";
import { getAuthorizationUrl, generateState } from "@/lib/shopify-auth";
import { cookies } from "next/headers";

export async function GET() {
    const shop = process.env.SHOPIFY_STORE_DOMAIN;

    if (!shop) {
        return NextResponse.json(
            { error: "Missing shop parameter" },
            { status: 500 }
        );
    }

    const state = generateState();

    // Protect against CSRF by storing the state in a secure cookie
    const cookieStore = await cookies();
    cookieStore.set("shopify_auth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 10,
        path: "/",
    });

    // Indicate the type of OAuth flow (online vs offline) in a cookie
    // Offline: shop_installation
    cookieStore.set("shopify_auth_type", "offline", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 10,
        path: "/",
    });

    const authUrl = getAuthorizationUrl(shop, state, { online: false });

    return NextResponse.redirect(authUrl);
}
