export const DAILY_COINS = 10;

const TIMEZONE = "Europe/Paris";

// Date du jour à Paris, au format "2026-10-07"
export function todayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isWednesday(date: Date = new Date()): boolean {
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      weekday: "long",
    }).format(date) === "Wednesday"
  );
}