import Image from "next/image";
import WmsLayout from "@/components/m/wmsLayout";
import { requireMobileSession } from "@/lib/auth/session";

export default async function MobilePage() {
   const session = await requireMobileSession();

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
