import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import WmsLayout from "@/components/m/wmsLayout";
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

export default async function MobilePage() {
    const session = await getSession();

    if (!session) {
        redirect("/m/login");
    }

    return (
        <WmsLayout
            title="HOME"
            shopifyUserName={session.shopifyUserName}
            shopifyUserEmail={session.shopifyUserEmail}
        >
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <Image
                    src="/favicon.ico"
                    alt="Ezoko Logo"
                    width={200}
                    height={200}
                    priority
                />
            </div>
        </WmsLayout>
    );
}
