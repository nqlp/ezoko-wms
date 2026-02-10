import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    cookieStore.delete("wms_session");

    return NextResponse.redirect(new URL("/m/login", request.url));
}
