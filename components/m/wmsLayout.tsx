"use client";

import React, { useState } from "react";
import AppBar from "./AppBar";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { requestScanRefocus } from "./scanner/focusBus";

interface WmsLayoutProps {
    title: string;
    children: React.ReactNode;
    shopifyUserName?: string | null;
    shopifyUserEmail?: string | null;
}

export default function WmsLayout({
    title,
    children,
    shopifyUserName,
    shopifyUserEmail,
}: WmsLayoutProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const router = useRouter();

    const openDrawer = () => {
        setDrawerOpen(true);
        requestScanRefocus("drawer-open");
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        requestScanRefocus("drawer-close");
    };

    const handleDrawerToggle = () => {
        if (drawerOpen) {
            closeDrawer();
            return;
        }

        openDrawer();
    };

    const drawerContent = (
        <Box onClick={closeDrawer} sx={{ textAlign: "center" }}>
            <Toolbar />
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => router.push("/m")}
                        sx={{ justifyContent: "center", gap: 1 }}>
                        <ListItemIcon sx={{ minWidth: 0 }}>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="HOME"
                            sx={{ m: 0, flex: "0 0 auto" }}
                            slotProps={{ primary: { align: "center" } }}
                        />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => router.push("/m/move")}
                        sx={{ justifyContent: "center" }}
                    >
                        <ListItemText
                            primary="MOVE"
                            sx={{ m: 0, flex: "0 0 auto" }}
                            slotProps={{ primary: { align: "center" } }}
                        />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => router.push("/m/putaway")}
                        sx={{ justifyContent: "center" }}
                    >
                        <ListItemText
                            primary="PUTAWAY"
                            sx={{ m: 0, flex: "0 0 auto" }}
                            slotProps={{ primary: { align: "center" } }}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <div>
            <AppBar
                title={title}
                onMenuClick={handleDrawerToggle}
                shopifyUserName={shopifyUserName}
                shopifyUserEmail={shopifyUserEmail}
            />
            <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={closeDrawer}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                {drawerContent}
            </Drawer>

            <main>
                <Toolbar />
                {children}
            </main>
        </div>
    );
}
