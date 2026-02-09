"use client";

import { useEffect } from "react";
import Alert from "@mui/material/Alert";

interface SnackbarProps {
    message: string,
    onClose: () => void;
    autoHideDuration?: number; // in milliseconds
    severity?: "error" | "warning" | "info" | "success";
}

export default function SnackBar({ message, onClose, autoHideDuration, severity = "error" }: SnackbarProps) {
    useEffect(() => {
        if (message && autoHideDuration) {
            const timer = setTimeout(() => {
                onClose();
            }, autoHideDuration);

            return () => clearTimeout(timer);
        }
    }, [message, autoHideDuration, onClose]);

    if (!message) return null;

    return (
        <Alert
            onClose={onClose}
            severity={severity}
            variant="filled"
            sx={{
                width: "100%",
                marginTop: "16px",
            }}
        >
            {message}
        </Alert>
    );
}
