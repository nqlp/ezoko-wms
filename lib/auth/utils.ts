export interface AuthErrorDetail {
    msg: string;
    status: number;
}

export function getOAuthErrorDetail(error: unknown): AuthErrorDetail {
    const message = error instanceof Error ? error.message : "";

    const errorMap: Record<string, AuthErrorDetail> = {
        "CSRF_INVALID": {
            msg: "Invalid state",
            status: 403
        },
        "MISSING_SHOP_DOMAIN": {
            msg: "Missing shop parameter",
            status: 400
        },
        "MISSING_ASSOCIATED_USER": {
            msg: "Missing associated user for offline token",
            status: 500
        }
    };

    return errorMap[message] || {
        msg: "Authentication failed",
        status: 500
    };
}