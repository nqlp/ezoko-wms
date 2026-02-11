import WmsLayout from "@/components/m/wmsLayout";
import MobileScanner from "@/components/m/MobileScanner";
import { requireSession } from "@/lib/auth/session";

export default async function MovePage() {
    const session = await requireSession();
    
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
