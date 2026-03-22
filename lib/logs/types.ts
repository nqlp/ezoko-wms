export type LogSortBy = "createdAt";
export type LogSortDirection = "asc" | "desc";
import { type ActivityType } from "@/lib/constants";

export interface LogFiltersState {
    activity: "" | ActivityType;
    user: string;
    dateStart: string;
    dateEnd: string;
    barcode: string;
    referenceDoc: string;
}

export const EMPTY_LOG_FILTERS: LogFiltersState = {
    activity: "",
    user: "",
    dateStart: "",
    dateEnd: "",
    barcode: "",
    referenceDoc: "",
};

export { getControlValue as getLogControlValue } from "@/lib/utils/domEvents";

export function toLogQueryParams(
    filters: LogFiltersState,
    sortBy: LogSortBy,
    sortDirection: LogSortDirection
): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.set(key, value.toString());
        }
    });

    params.set("sortBy", sortBy);
    params.set("sortDirection", sortDirection);

    return params.toString();
}