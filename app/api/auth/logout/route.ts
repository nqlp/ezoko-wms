import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SHOPIFY_LOGOUT_URL } from "@/lib/constants";
import { destroyServerSession } from "@/lib/auth/session";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function GET() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("wms_session")?.value;

    if (sessionToken) {
        try {
            await destroyServerSession(sessionToken);

            // Redirect to Shopify accounts logout to also destroy the browser session
            const response = NextResponse.json({
                ok: true,
                logoutUrl: SHOPIFY_LOGOUT_URL,
            });
            clearAuthCookies(response);
            return response;
        } catch (error) {
            console.error("[Logout] Failed to clean up server session:", error);
            const errorResponse = NextResponse.json(
                { message: "Unable to log out. Please try again." },
                { status: 500 }
            );

            clearAuthCookies(errorResponse, false);
            return errorResponse;
        }
    }
}

export async function POST() {
    try {

    } catch (error) {
        console.error("[Logout] Failed to clean up server session:", error);

        const errorResponse = NextResponse.json(
            { message: "Unable to log out. Please try again." },
            { status: 500 }
        );
        // Keep wms_session so a fallback GET /api/auth/logout can still locate and delete DB session.
        clearAuthCookies(errorResponse, false);
        return errorResponse;
    }

    const response = NextResponse.json({
        ok: true,
        logoutUrl: SHOPIFY_LOGOUT_URL,
    });
    clearAuthCookies(response);
    return response;
}
