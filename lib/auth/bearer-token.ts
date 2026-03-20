import { NextRequest } from "next/server";
import { shopify } from "@/lib/shopify-auth";
import { ApiError } from "@/lib/http";

export async function requireBearerAuth(request: NextRequest): Promise<{ userId: string }> {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
        throw new ApiError(401, "Unauthorized: missing Authorization header");
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1];
    if (!token) {
        throw new ApiError(401, "Unauthorized: invalid header format");
    }

    const payload = await shopify.session.decodeSessionToken(token, {
        checkAudience: true,
    });

    const expectedShop = process.env.SHOPIFY_STORE_DOMAIN;
    if (expectedShop) {
        const tokenShop = new URL(payload.dest).hostname;
        if (tokenShop !== expectedShop) {
            throw new ApiError(401, "Unauthorized: shop domain mismatch");
        }
    }

    return { userId: payload.sub };
}