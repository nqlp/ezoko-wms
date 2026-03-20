import { prisma } from "@/lib/prisma";
import type { AuthenticatedSession } from "@/lib/auth/session-token";
import type { UserPrefsInput } from "@/lib/validation/prefs";

export async function getUserPrefs(session: AuthenticatedSession) {
    const prefs = await prisma.userPrefs.findUnique({
        where: {
            shop_userId: {
                shop: session.shop,
                userId: session.userId
            }
        }
    });

    return {
        filters: prefs?.filters ?? null,
        sorting: prefs?.sorting ?? null
    };
}

export async function updateUserPrefs(session: AuthenticatedSession, data: UserPrefsInput) {
    const prefs = await prisma.userPrefs.upsert({
        where: {
            shop_userId: {
                shop: session.shop,
                userId: session.userId,
            }
        },
        create: {
            shop: session.shop,
            userId: session.userId,
            filters: data.filters ?? {},
            sorting: data.sorting ?? {}
        },
        update: {
            filters: data.filters ?? {},
            sorting: data.sorting ?? {}
        }
    });

    return {
        filters: prefs.filters,
        sorting: prefs.sorting
    };
}