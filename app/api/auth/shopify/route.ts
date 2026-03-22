import { initiateShopifyAuth } from "@/lib/auth/shopify-oauth";

export async function GET() {
    return initiateShopifyAuth(true); // true = online
}