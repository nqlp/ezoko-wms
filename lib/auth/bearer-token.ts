import { NextRequest } from "next/server";
import { shopify } from "@/lib/shopify-auth";

export async function requireBearerAuth(request: NextRequest): Promise<{ userId: string }> {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
        throw new Error("Unauthorized: missing Authorization header");
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1];
    if (!token) {
        throw new Error("Unauthorized: invalid header format");
    }

    const payload = await shopify.session.decodeSessionToken(token, {
        checkAudience: true,
    });

    const expectedShop = process.env.SHOPIFY_STORE_DOMAIN;
    if (expectedShop) {
        const tokenShop = new URL(payload.dest).hostname;
        if (tokenShop !== expectedShop) {
            throw new Error("Unauthorized: shop domain mismatch");
        }
    }

    return { userId: payload.sub };
}