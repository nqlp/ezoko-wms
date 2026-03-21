import { NextResponse } from "next/server";

export function clearAuthCookies(response: NextResponse, includeSession = true) {
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    };

    if (includeSession) {
        response.cookies.set("wms_session", "", cookieOptions);
    }

    response.cookies.set("shopify_auth_state", "", cookieOptions);
    response.cookies.set("shopify_auth_type", "", cookieOptions);

    response.headers.set("Cache-Control", "no-store");
}

export const SESSION_COOKIE_NAME = "wms_session";
export const SESSION_MAX_AGE = 24 * 60 * 60 * 7; // 7 days

export function setSessionCookie(response: NextResponse, sessionToken: string) {
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
    });
}