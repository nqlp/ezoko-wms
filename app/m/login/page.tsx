import { redirect } from "next/navigation";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { getSession } from "@/lib/auth/session";

export default async function MobileLoginPage() {
    const session = await getSession();

    if (session) {
        redirect("/m");
    }

    return (
        <main>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                <Button
                    size="large"
                    href="/api/auth/shopify"
                    aria-label="connect"
                    fullWidth
                    variant="outlined"
                    style={{
                        display: "inline-block",
                        borderRadius: "10px",
                        backgroundColor: "var(--ezoko-mint)",
                        color: "var(--ezoko-paper)"
                    }}
                >
                    Connect with Shopify
                </Button>
            </Box>
        </main>
    )
}
