import "server-only";

import { shopifyConfig, validateShopifyConfig } from "@/lib/config/shopify";
import { prisma } from "@/lib/prisma";

export class ShopifyClient {
    private apiUrl: string;
    private accessToken?: string;
    private envAccessToken?: string;
    private storeDomain?: string;

    constructor(accessToken?: string) {
        validateShopifyConfig({ allowMissingAccessToken: true });
        this.apiUrl = shopifyConfig.apiUrl!;
        this.envAccessToken = shopifyConfig.accessToken;
        this.storeDomain = process.env.SHOPIFY_STORE_DOMAIN ?? this.extractStoreDomain(this.apiUrl);
        if (accessToken) {
            this.accessToken = accessToken;
        }
    }

    private extractStoreDomain(apiUrl: string): string | undefined {
        try {
            return new URL(apiUrl).hostname;
        } catch {
            return undefined;
        }
    }

    private async resolveAccessToken(): Promise<string> {
        if (this.accessToken) {
            return this.accessToken;
        }

        // Check if we have an access token stored for the shop domain in DB (offline token)
        if (this.storeDomain) {
            const integration = await prisma.store_integration.findUnique({
                where: { store_domain: this.storeDomain },
            });
            // If we have an integration with an access token, use it
            if (integration?.access_token) {
                this.accessToken = integration.access_token;
                return this.accessToken;
            }
        }

        // Check in environment variable as a fallback
        if (this.envAccessToken) {
            this.accessToken = this.envAccessToken;
            return this.accessToken;
        }

        throw new Error(
            "Shopify access token is missing. Set SHOPIFY_ACCESS_TOKEN or complete offline OAuth."
        );
    }

    async query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
        console.log(`[ShopifyClient] Requesting: ${this.apiUrl}`);
        const accessToken = await this.resolveAccessToken();
        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken,
            },
            body: JSON.stringify({ query, variables }),
            cache: "no-store",
        });

        const json = await response.json();

        if (json.errors) {
            throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
        }

        return json.data;
    }

    async mutate<T>(mutation: string, variables: Record<string, unknown>): Promise<T> {
        const accessToken = await this.resolveAccessToken();
        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken,
            },
            body: JSON.stringify({ query: mutation, variables }),
            cache: "no-store",
        });

        const json = await response.json();

        if (json.errors) {
            throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
        }

        return json.data;
    }
}
