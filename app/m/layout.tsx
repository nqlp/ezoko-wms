import "@/app/globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
export const metadata = {
    title: "Ezoko WMS",
    description: "Warehouse Management System",

};

export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppRouterCacheProvider>
            <div
                style={{
                    maxWidth: "360px",
                    margin: "0 auto",
                    minHeight: "100vh",
                    textAlign: "center",
                    backgroundColor: "var(--ezoko-paper)",
                }}
            >
                {children}
            </div>
        </AppRouterCacheProvider>
    );
}