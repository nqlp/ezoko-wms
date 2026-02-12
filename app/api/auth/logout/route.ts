import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("wms_session")?.value;

    if (sessionToken) {
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

    // Redirect to Shopify accounts logout to also destroy the browser session
    const response = NextResponse.redirect("https://accounts.shopify.com/logout");

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

    clearCookie("wms_session");
    clearCookie("shopify_auth_state");
    clearCookie("shopify_auth_type");
    response.headers.set("Cache-Control", "no-store");

    return response;
}
