const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-10";
const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const apiUrl =
    process.env.SHOPIFY_API_URL ||
    (storeDomain ? `https://${storeDomain}/admin/api/${apiVersion}/graphql.json` : undefined);

export const shopifyConfig = {
    apiUrl,
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    apiVersion,
} as const;

export function validateShopifyConfig(options?: { allowMissingAccessToken?: boolean }) {
    if (
        storeDomain &&
        process.env.SHOPIFY_API_URL &&
        shopifyConfig.apiUrl &&
        !shopifyConfig.apiUrl.includes(storeDomain)
    ) {
        throw new Error(
            `SHOPIFY_API_URL (${shopifyConfig.apiUrl}) does not match SHOPIFY_STORE_DOMAIN (${storeDomain}). ` +
            `This usually means you're accidentally pointing at the wrong Shopify store.`
        );
    }
    if (!options?.allowMissingAccessToken && !shopifyConfig.accessToken) {
        throw new Error("SHOPIFY_ACCESS_TOKEN is required");
    }
    if (!shopifyConfig.apiUrl) {
        throw new Error("SHOPIFY_API_URL or SHOPIFY_STORE_DOMAIN is required");
    }
}