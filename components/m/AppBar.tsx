"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

interface AppBarProps {
    title: string;
    account?: {
        name: string;
        avatarUrl: string;
    };
    onMenuClick: () => void;
}

export default function AppBarProps({ title, account, onMenuClick }: AppBarProps) {
    const handleMenuClick = () => {
        onMenuClick();
    }
    return (
        <AppBar position="absolute" color="primary" sx={{ backgroundColor: "var(--ezoko-ink)" }}>
            <Toolbar>
                {/* Hamburger menu */}
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
                    <MenuIcon />
                </IconButton>

                {/* Title */}
                <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>

                {/* Account */}
                {account && (
                    <Avatar alt={account.name} src={account.avatarUrl} />
                )}
            </Toolbar>
        </AppBar>
    );
}