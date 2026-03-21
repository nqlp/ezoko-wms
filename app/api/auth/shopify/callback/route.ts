import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleOAuthCallback } from "@/lib/auth/shopify-oauth";
import { setSessionCookie } from "@/lib/auth/cookies";
import { getOAuthErrorDetail } from "@/lib/auth/utils";

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

        const response = NextResponse.redirect(result.redirectUrl);

        if (result.type === "online" && result.sessionToken) {
            setSessionCookie(response, result.sessionToken);
        }

        return response;
    } catch (error) {
        const { msg, status } = getOAuthErrorDetail(error);

        if (status === 500) {
            console.error("[Shopify OAuth Callback] Internal error:", error);
        }
        return NextResponse.json(
            { error: msg },
            { status }
        );
    } finally {
        cookieStore.delete("shopify_auth_state");
        cookieStore.delete("shopify_auth_type");
    }
}
