export type ApiErrorCode =
    | "NOT_FOUND"
    | "MULTIPLE_VARIANTS"
    | "SERVER_ERROR";

export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; message: string; errorCode?: ApiErrorCode };

export interface UpdateStockResult {
    id: string;
    displayName: string;
    updatedQty: number;
}