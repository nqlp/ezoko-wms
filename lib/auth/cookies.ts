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