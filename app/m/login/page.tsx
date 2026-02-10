import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

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
