import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("wms_session")?.value;

    if (!sessionToken) {
        return null;
    }

    return prisma.userSession.findFirst({
        where: {
            sessionToken,
            expiresAt: {
                gte: new Date(),
            },
        },
    });
}

export async function requireMobileSession() {
    const session = await getSession();
    if (!session) {
        redirect("/m/login");
    }
    return session;
}

export async function getCurrentUserName(): Promise<string | null> {
    const session = await getSession();
    return session?.shopifyUserName ?? null;
}

export async function destroyServerSession(sessionToken: string) {
    const session = await prisma.userSession.findFirst({
        where: {
            sessionToken
        },
        select: {
            accessToken: true
        },
    });

    if (session?.accessToken) {
        const shop = process.env.SHOPIFY_STORE_DOMAIN;
        if (shop) {
            try {
                await fetch(`https://${shop}/admin/api/2025-01/access_tokens/current.json`, {
                    method: "DELETE",
                    headers: {
                        "X-Shopify-Access-Token": session.accessToken,
                    },
                });
                console.log("[Session] Shopify access token revoked");
            }
            catch (error) {
                console.error("[Session] Failed to revoke Shopify token:", error);
            }
        }
    }

    return prisma.userSession.deleteMany({
        where: {
            sessionToken
        },
    });
}
