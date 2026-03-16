"use client";

import { useCallback, useEffect } from "react";
import Alert from "@mui/material/Alert";

interface SnackbarProps {
    message: string;
    onClose: () => void;
    onAfterClose?: () => void;
    autoHideDuration?: number;
    severity?: "error" | "warning" | "info" | "success";
}

export default function SnackBar({
    message,
    onClose,
    onAfterClose,
    autoHideDuration,
    severity = "error" }: SnackbarProps) {
    const handleClose = useCallback(() => {
        onClose();
        onAfterClose?.();
    }, [onClose, onAfterClose]);

    useEffect(() => {
        if (message && autoHideDuration) {
            const timer = setTimeout(() => {
                handleClose();
            }, autoHideDuration);

            return () => clearTimeout(timer);
        }
    }, [message, autoHideDuration, handleClose]);

    if (!message) {
        return null;
    }

    return (
        <Alert
            onClose={handleClose}
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