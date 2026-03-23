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
import { requestScanRefocus } from "./scanner/focusBus";
import { useLogout } from "@/lib/client/hooks/useLogout";
import { getAvatarInitials } from "@/lib/auth/utils";

interface AppBarProps {
    title: string;
    onMenuClick: () => void;
    shopifyUserName?: string | null;
    shopifyUserEmail?: string | null;
}

export default function WmsAppBar({
    title,
    onMenuClick,
    shopifyUserName,
    shopifyUserEmail,
}: AppBarProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const { logout, isLoggingOut, logoutError } = useLogout();
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        requestScanRefocus("avatar-menu-close");
    };

    const onLogoutClick = async () => {
        handleClose();
        await logout();
    };

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
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenuClick}>
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
                        {getAvatarInitials(shopifyUserName, shopifyUserEmail)}
                    </Avatar>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                        <MenuItem onClick={onLogoutClick} disabled={isLoggingOut}>
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
