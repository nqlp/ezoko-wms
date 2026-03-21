import WmsLayout from "@/components/m/wmsLayout";
import MobileScanner from "@/components/m/MobileScanner";
import { requireMobileSession } from "@/lib/auth/session";

export default async function MovePage() {
    const session = await requireMobileSession();
    
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
