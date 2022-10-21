/**
 * Calculates today + a given number of days and returns the result as a UTC string.
 */
export function nowPlusDays(days: number): string {
    const now = new Date();
    now.setDate(now.getDate() + days);
    return now.toUTCString();
}

/**
 * Calculates if today is after a given limit.
 * The limit must be a valid date string.
 */
export function nowIsAfter(limit: string): boolean {
    const limitDate = new Date(limit);
    const today = new Date();
    return today > limitDate;
}
