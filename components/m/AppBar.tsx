"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { requestScanRefocus } from "./scanner/focusBus";

interface AppBarProps {
    title: string;
    onMenuClick: () => void;
    shopifyUserName?: string | null;
    shopifyUserEmail?: string | null;
}

function getAvatarInitials(shopifyName?: string | null, shopifyEmail?: string | null): string {
    const trimmedName = shopifyName?.trim();
    if (trimmedName) {
        const parts = trimmedName.split(/\s+/);
        const firstInitial = parts[0][0] || "";
        const secondInitial = parts[parts.length - 1][0] || "";
        return `${firstInitial}${secondInitial}`.toUpperCase();
    }

    return shopifyEmail?.[0]?.toUpperCase() ?? "?";
}

export default function AppBarProps({
    title,
    onMenuClick,
    shopifyUserName,
    shopifyUserEmail,
}: AppBarProps) {

    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorElement);
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorElement(null);
        requestScanRefocus("avatar-menu-close");
    };

    const handleMenuClick = () => {
        onMenuClick();
    };

    const handleLogout = () => {
        handleClose();
        window.location.assign("/api/auth/logout");
    };

    const initials = getAvatarInitials(shopifyUserName, shopifyUserEmail);
    return (
        <AppBar position="absolute" color="primary" sx={{ backgroundColor: "var(--ezoko-ink)" }}>
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>

                <Avatar
                    sx={{ bgcolor: "var(--ezoko-mint)", color: "var(--ezoko-ink)", width: 32, height: 32 }}
                    aria-label="account avatar"
                    onClick={handleAvatarClick}
                >
                    {initials}
                </Avatar>
                <Menu
                    anchorEl={anchorElement}
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleLogout}>Log out</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}