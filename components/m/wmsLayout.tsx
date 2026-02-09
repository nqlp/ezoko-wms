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

interface WmsLayoutProps {
    title: string;
    children: React.ReactNode;
}

export default function WmsLayout({
    title,
    children,
}: WmsLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => router.push("/m")}>
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="HOME" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => router.push("/m/move")}>
                        <ListItemText primary="MOVE" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <div>
            <AppBar title={title} onMenuClick={handleDrawerToggle} />

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
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