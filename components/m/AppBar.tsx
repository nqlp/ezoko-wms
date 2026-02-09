"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";

interface AppBarProps {
    title: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    onMenuClick: () => void;
}

export default function AppBarProps({ title, icon, actions, onMenuClick }: AppBarProps) {
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

                {/* Optional icon before title */}
                {icon && (
                    <IconButton color="inherit" sx={{ mr: 1 }}>
                        {icon}
                    </IconButton>
                )}

                {/* Title */}
                <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>

                {/* Custom actions (if provided) */}
                {actions}

                {/* Account */}
                
            </Toolbar>
        </AppBar>
    );
}