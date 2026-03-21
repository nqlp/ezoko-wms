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
