import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a date as a short, locale-stable string (e.g. "Jun 29, 2026"). */
export function formatDate(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Relative time string, e.g. "3 days ago". Falls back to absolute date. */
export function formatRelativeTime(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  let duration = seconds;
  let unit: Intl.RelativeTimeFormatUnit = "second";
  for (const [amount, nextUnit] of divisions) {
    if (Math.abs(duration) < amount) {
      unit = nextUnit;
      break;
    }
    duration /= amount;
    unit = nextUnit;
  }
  return rtf.format(-Math.round(duration), unit);
}

/** Convert an arbitrary string into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Type-safe guard for narrowing `unknown` errors to `Error`. */
export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(typeof value === "string" ? value : JSON.stringify(value));
}
