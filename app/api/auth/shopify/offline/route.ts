import { initiateShopifyAuth } from "@/lib/auth/shopify-oauth";

export async function GET() {
    return initiateShopifyAuth(false); // false = offline
}