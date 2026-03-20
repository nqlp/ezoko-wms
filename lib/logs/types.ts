export type LogSortBy = "createdAt";
export type LogSortDirection = "asc" | "desc";
import { ACTIVITY_TYPES, type ActivityType } from "@/lib/constants";
export { ACTIVITY_TYPES, type ActivityType };

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
    sortDirection: LogSortDirection): string {
    const params = new URLSearchParams();

    if (filters.activity) params.set("activity", filters.activity);
    if (filters.user) params.set("user", filters.user);
    if (filters.dateStart) params.set("dateStart", filters.dateStart);
    if (filters.dateEnd) params.set("dateEnd", filters.dateEnd);
    if (filters.barcode) params.set("barcode", filters.barcode);
    if (filters.referenceDoc) params.set("referenceDoc", filters.referenceDoc);
    params.set("sortBy", sortBy);
    params.set("sortDirection", sortDirection);
    return params.toString();
}