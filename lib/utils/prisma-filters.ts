import { ApiError } from "@/lib/http";

/**
 * Parses a date string into a Date object.
 * Supports date-only (YYYY-MM-DD) and full ISO formats.
 * When endOfDay is true and input is date-only, sets time to 23:59:59.999 UTC.
 */
export function parseDate(
    value: string | null | undefined,
    options: { endOfDay?: boolean } = {}
): Date | null {
    if (!value) return null;

    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const parsed = new Date(isDateOnly ? `${value}T00:00:00.000Z` : value);

    if (Number.isNaN(parsed.getTime())) {
        throw new ApiError(400, `Invalid date value: ${value}`);
    }

    if (options.endOfDay && isDateOnly) {
        parsed.setUTCHours(23, 59, 59, 999);
    }

    return parsed;
}

/**
 * Builds a Prisma-compatible date range filter ({ gte, lte }).
 * Returns null if both start and end are empty.
 */
export function dateRangeFilter(
    startValue?: string,
    endValue?: string,
    options: { endOfDay?: boolean } = {}
): { gte?: Date; lte?: Date } | null {
    const start = parseDate(startValue);
    const end = parseDate(endValue, { endOfDay: options.endOfDay });

    if (!start && !end) return null;

    return {
        ...(start ? { gte: start } : {}),
        ...(end ? { lte: end } : {}),
    };
}
