import WmsLayout from "@/components/m/wmsLayout";
import MobileScanner from "@/components/m/MobileScanner";
import { requireMobileSession } from "@/lib/auth/session";

export default async function PutawayPage() {
   const session = await requireMobileSession();

    return (
        <WmsLayout
            title="PUTAWAY"
            shopifyUserName={session.shopifyUserName}
            shopifyUserEmail={session.shopifyUserEmail}
        >
            <div className="wms-container">
                <MobileScanner mode="putaway" />              
            </div>
        </WmsLayout>
    );
}
