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

    // Generate a state parameter for CSRF protection
    const state = generateState();

    const cookieStore = await cookies();
    cookieStore.set("shopify_auth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
    });

    // Online: user_sessions 
    cookieStore.set("shopify_auth_type", "online", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
    });

    const authUrl = getAuthorizationUrl(shop, state, { online: true });

    return NextResponse.redirect(authUrl);
}
