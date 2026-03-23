/**
 * Parse a string value into a non-negative integer quantity.
 * Single source of truth for quantity parsing across the app.
 *
 * @param value - The string to parse
 * @param min   - Minimum allowed value (default 0)
 * @returns Parsed integer clamped to `min`, or `min` if unparseable
 */
export function parseQty(value: string, min = 0): number {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(min, parsed) : min;
}
