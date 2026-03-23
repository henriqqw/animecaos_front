import type { TimeRange } from "@/domain/events/types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type PredefinedRange = "7d" | "30d" | "90d";

const DEFAULT_RANGE: PredefinedRange = "30d";

function toIso(date: Date): string {
  return date.toISOString();
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function subtractDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * DAY_IN_MS);
}

function normalizePredefinedRange(value: string | null): PredefinedRange {
  if (value === "7d" || value === "30d" || value === "90d") {
    return value;
  }

  return DEFAULT_RANGE;
}

function parseDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function resolveTimeRange(searchParams: URLSearchParams): TimeRange {
  const fromQuery = parseDate(searchParams.get("from"));
  const toQuery = parseDate(searchParams.get("to"));

  if (fromQuery && toQuery && fromQuery < toQuery) {
    return {
      from: toIso(fromQuery),
      to: toIso(toQuery)
    };
  }

  const range = normalizePredefinedRange(searchParams.get("range"));
  const now = new Date();
  const end = now;
  const start = (() => {
    if (range === "7d") {
      return subtractDays(now, 7);
    }

    if (range === "90d") {
      return subtractDays(now, 90);
    }

    return subtractDays(now, 30);
  })();

  return {
    from: toIso(start),
    to: toIso(end)
  };
}

export function enumerateUtcDays(range: TimeRange): string[] {
  const fromDate = startOfUtcDay(new Date(range.from));
  const toDate = startOfUtcDay(new Date(range.to));
  const days: string[] = [];

  for (let ts = fromDate.getTime(); ts <= toDate.getTime(); ts += DAY_IN_MS) {
    days.push(new Date(ts).toISOString().slice(0, 10));
  }

  return days;
}

export function clampLimit(input: string | null, fallback = 10, max = 50): number {
  if (!input) {
    return fallback;
  }

  const parsed = Number.parseInt(input, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, max);
}

