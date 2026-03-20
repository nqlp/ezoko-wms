import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleOAuthCallback } from "@/lib/auth/shopify-oauth";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const shop = searchParams.get("shop") ?? undefined;

    if (!code || !state) {
        return NextResponse.json(
            { error: "Missing code or state" },
            { status: 400 }
        );
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("shopify_auth_state")?.value;
    const authType = cookieStore.get("shopify_auth_type")?.value ?? "online";
    const appUrl = process.env.SHOPIFY_APP_URL ?? request.nextUrl.origin;

    try {
        const result = await handleOAuthCallback({
            code,
            state,
            storedState,
            shop,
            authType,
            appUrl,
        });

        cookieStore.delete("shopify_auth_state");
        cookieStore.delete("shopify_auth_type");

        if (result.type === "online") {
            cookieStore.set("wms_session", result.sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 7, // 7 days
                path: "/",
            });
        }

        return NextResponse.redirect(result.redirectUrl);
    } catch (error) {
        if (error instanceof Error && error.message === "CSRF_INVALID") {
            return NextResponse.json({ error: "Invalid state" }, { status: 403 });
        }
        if (error instanceof Error && error.message === "MISSING_SHOP_DOMAIN") {
            return NextResponse.json({ error: "Missing shop domain" }, { status: 400 });
        }
        if (error instanceof Error && error.message === "MISSING_ASSOCIATED_USER") {
            return NextResponse.json(
                { error: "Missing associated user for online OAuth" },
                { status: 500 }
            );
        }
        console.error("OAuth callback error exchanging code for token:", error);
        return NextResponse.json(
            { error: "Failed to exchange code for token" },
            { status: 500 }
        );
    }
}
