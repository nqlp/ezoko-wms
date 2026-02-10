import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import WmsLayout from "@/components/m/wmsLayout";
import MobileScanner from "@/components/m/MobileScanner";
import { redirect } from "next/navigation";

async function getSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("wms_session")?.value;

    if (!sessionToken) {
        return null;
    }

    const userSession = await prisma.userSession.findFirst({
        where: {
            sessionToken,
            expiresAt: {
                gte: new Date(),
            },
        },
    });
    return userSession;
}

export default async function MovePage() {
    const session = await getSession();

    if (!session) {
        redirect("/m/login");
    }

    return (
        <WmsLayout
            title="MOVE"
            shopifyUserName={session.shopifyUserName}
            shopifyUserEmail={session.shopifyUserEmail}
        >
            <div className="wms-container">
                <MobileScanner mode="move" />
            </div>
        </WmsLayout>
    );
}
