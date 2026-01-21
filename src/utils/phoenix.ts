/**
 * Phoenix timezone utilities.
 * NIGEL operates on America/Phoenix time for all period calculations.
 */

const PHOENIX_TZ = "America/Phoenix";

/**
 * Gets the current date in Phoenix timezone.
 */
export function getPhoenixDate(): Date {
  const now = new Date();
  const phoenixString = now.toLocaleString("en-US", { timeZone: PHOENIX_TZ });
  return new Date(phoenixString);
}

/**
 * Gets just the date portion (YYYY-MM-DD) in Phoenix timezone.
 */
export function getPhoenixDateString(): string {
  const now = new Date();
  return now.toLocaleDateString("en-CA", { timeZone: PHOENIX_TZ }); // en-CA gives YYYY-MM-DD
}

/**
 * Checks if two dates are the same day in Phoenix timezone.
 */
export function isSamePhoenixDay(date1: Date, date2: Date): boolean {
  const d1 = date1.toLocaleDateString("en-CA", { timeZone: PHOENIX_TZ });
  const d2 = date2.toLocaleDateString("en-CA", { timeZone: PHOENIX_TZ });
  return d1 === d2;
}

/**
 * Gets the number of days between two dates in Phoenix timezone.
 */
export function getPhoenixDaysDiff(earlier: Date, later: Date): number {
  const d1 = new Date(earlier.toLocaleDateString("en-CA", { timeZone: PHOENIX_TZ }));
  const d2 = new Date(later.toLocaleDateString("en-CA", { timeZone: PHOENIX_TZ }));
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Gets the start of the current week (Monday) in Phoenix timezone.
 */
export function getPhoenixWeekStart(): string {
  const now = getPhoenixDate();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is start
  now.setDate(now.getDate() - diff);
  now.setHours(0, 0, 0, 0);
  return now.toISOString().split("T")[0];
}

/**
 * Gets the start of the current month in Phoenix timezone.
 */
export function getPhoenixMonthStart(): string {
  const now = getPhoenixDate();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

/**
 * Formats a date for display with Phoenix timezone context.
 */
export function formatPhoenixDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: PHOENIX_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a time for display with Phoenix timezone context.
 */
export function formatPhoenixTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: PHOENIX_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
