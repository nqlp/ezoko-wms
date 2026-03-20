import { requireShopifySession } from "@/lib/auth/require-auth";
import { validateImportRows } from "@/lib/po/item-import/validateImportRows";
import { handleRouteError } from "@/lib/http";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const session = await requireShopifySession(request, { csrf: false });
        const body = await request.json();

        const result = await validateImportRows(session, body);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error validating CSV import:", error);
        return handleRouteError(error);
    }
}