import type { ApiErrorCode } from "@/lib/types/ApiResponse";

export function handleServerActionError(
    error: unknown,
    context: string,
    errorCode?: ApiErrorCode
): { success: false; message: string; errorCode?: ApiErrorCode } {
    console.error(`${context}:`, error);

    const message =
        error instanceof Error ? error.message : "Error performing server action";

    return {
        success: false,
        message,
        ...(errorCode ? { errorCode } : {}),
    };
}
