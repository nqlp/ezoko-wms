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
            <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" data-api-key={process.env.SHOPIFY_API_KEY} />
            <script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
            <ui-title-bar title="EZOKO Purchase Orders" />
            <main>{children}</main>
        </>
    );
}