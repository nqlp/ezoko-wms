/**
 * Search scoring utilities for bin location matching.
 */

/**
 * Fuzzy match: checks if all characters of `query` appear in `target` in order.
 * e.g. "abc" matches "Alpha Beta Charlie"
 */
export function fuzzyMatch(query: string, target: string): boolean {
    const pattern = query
        .split("")
        .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*");
    return new RegExp(pattern, "i").test(target);
}

export interface ScoredResult<T> {
    item: T;
    score: number;
}

/**
 * Score a title against a search query
 *
 * Scoring rules:
 *   10 = exact match
 *    8 = starts with query
 *    5 = contains query
 *    2 = fuzzy match
 *    0 = no match
 */
export function scoreMatch(query: string, title: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();

    if (titleLower === queryLower) {
        return 10;
    }
    if (titleLower.startsWith(queryLower)) {
        return 8;
    }
    if (titleLower.includes(queryLower)) {
        return 5;
    }
    if (fuzzyMatch(queryLower, titleLower)) {
        return 2
    };
    return 0;
}
