import "./embedded.css";
import { Suspense } from 'react';
import { AppNav } from '@/components/embedded/AppNav';

export const metadata = {
    title: "EZOKO Purchase Orders",
    description: "Embedded Shopify app for purchase order CRUD",
};

export default function EmbeddedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" data-api-key={process.env.SHOPIFY_CLIENT_ID} />
            <script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
            <ui-title-bar title="EZOKO Purchase Orders" />
            <Suspense fallback={null}>
                <AppNav />
            </Suspense>
            <main>{children}</main>
        </>
    );
}