"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { useState } from "react";

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

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);
    const open = Boolean(anchorEl);
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleMenuClick = () => {
        onMenuClick();
    };

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }
        handleClose();
        setLogoutError(null);
        setIsLoggingOut(true);

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
            });

            if (!response.ok) {
                let message = "Unable to log out. Please try again.";

                try {
                    const errorPayload = (await response.json()) as { message?: string };
                    if (errorPayload.message) {
                        message = errorPayload.message;
                    }
                } catch {
                    // Keep the default message when response body is not JSON
                }

                setLogoutError(`${message} Redirecting...`);
                window.location.assign("/api/auth/logout");
                return;
            }

            let logoutUrl: string | null = null;
            try {
                const payload = (await response.json()) as { logoutUrl?: string };
                if (payload.logoutUrl) {
                    logoutUrl = payload.logoutUrl;
                }
            } catch (error) {
                console.warn("[Logout] Failed to parse logout URL from /api/auth/logout", error);
            }

            if (!logoutUrl) {
                window.location.assign("/api/auth/logout");
                return;
            }

            window.location.assign(logoutUrl);
        } catch (error) {
            console.error("[Logout] Failed to log out from client:", error);
            setLogoutError("Unable to log out. Redirecting...");
            window.location.assign("/api/auth/logout");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const initials = getAvatarInitials(shopifyUserName, shopifyUserEmail);
    return (
        <>
            <AppBar
                position="fixed"
                color="primary"
                sx={{
                    backgroundColor: "var(--ezoko-ink)",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar>
                    {/* Hamburger menu */}
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
                        <MenuIcon />
                    </IconButton>

                    {/* Title */}
                    <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>

                    {/* User Avatar */}
                    <Avatar
                        sx={{ bgcolor: "var(--ezoko-mint)", color: "var(--ezoko-ink)", width: 32, height: 32 }}
                        aria-label="account avatar"
                        onClick={handleAvatarClick}
                    >
                        {initials}
                    </Avatar>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                            {isLoggingOut ? "Logging out..." : "Log out"}
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {logoutError && (
                <Alert severity="error" sx={{ mx: 1, mt: 1 }}>
                    {logoutError}
                </Alert>
            )}
        </>
    );
}
