import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("wms_session")?.value;

    // Delete the session from the database
    if (sessionToken) {
        await prisma.userSession.deleteMany({
            where: { sessionToken },
        });
    }

    // Redirect to Shopify accounts-level logout to destroy the Shopify session.
    // On production stores, this forces the user to re-enter credentials on next login.
    // NOTE: On dev stores, Shopify sessions may persist — manual cookie clearing is needed.
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
