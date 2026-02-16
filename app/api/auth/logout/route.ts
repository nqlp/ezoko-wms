import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SHOPIFY_LOGOUT_URL = "https://accounts.shopify.com/logout";

async function performServerLogout() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("wms_session")?.value;

    if (!sessionToken) {
        return;
    }

    // Fetch the session to get the Shopify access token before deleting
    const session = await prisma.userSession.findFirst({
        where: { sessionToken },
        select: { accessToken: true },
    });

    // Revoke the Shopify access token so the user must re-authorize on next login
    if (session?.accessToken) {
        const shop = process.env.SHOPIFY_STORE_DOMAIN;
        if (shop) {
            try {
                await fetch(
                    `https://${shop}/admin/api/2025-01/access_tokens/current.json`,
                    {
                        method: "DELETE",
                        headers: {
                            "X-Shopify-Access-Token": session.accessToken,
                        },
                    }
                );
                console.log("[Logout] Shopify access token revoked");
            } catch (err) {
                console.error("[Logout] Failed to revoke Shopify token:", err);
            }
        }
    }

    // Delete our session from the database
    await prisma.userSession.deleteMany({
        where: { sessionToken },
    });
}

function clearAuthCookies(response: NextResponse, clearSessionCookie = true) {
    // Clear all app cookies
    const secure = process.env.NODE_ENV === "production";
    const clearCookie = (name: string) => {
        response.cookies.set(name, "", {
            httpOnly: true,
            secure,
            sameSite: "lax",
            path: "/",
            maxAge: 0,
            expires: new Date(0),
        });
    };

    if (clearSessionCookie) {
        clearCookie("wms_session");
    }
    
    clearCookie("shopify_auth_state");
    clearCookie("shopify_auth_type");
    response.headers.set("Cache-Control", "no-store");
}

export async function GET() {
    try {
        await performServerLogout();
    } catch (error) {
        console.error("[Logout] Failed to clean up server session:", error);
    }

    // Redirect to Shopify accounts logout to also destroy the browser session
    const response = NextResponse.redirect(SHOPIFY_LOGOUT_URL);
    clearAuthCookies(response);
    return response;
}

export async function POST() {
    try {
        await performServerLogout();
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
