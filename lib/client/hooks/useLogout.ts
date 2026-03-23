import { useState } from "react";

export function useLogout() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);

    const logout = async () => {
        if (isLoggingOut) return;

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
                } catch (error) {
                    console.warn("[Logout] Failed to parse error message from /api/auth/logout", error);
                }
                window.location.assign("/api/auth/logout");
                return;
            }

            const payload = await response.json();
            window.location.assign(payload.logoutUrl || "/api/auth/logout");
        } catch (error) {
            console.error("[Logout Hook] Error:", error);
            setLogoutError("Unable to log out. Redirecting...");
            window.location.assign("/api/auth/logout");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return { logout, isLoggingOut, logoutError };
}