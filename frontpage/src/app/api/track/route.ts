import { NextResponse } from "next/server";

import { getClientIp, isLikelyBotRequest } from "@/lib/security/botDetection";
import { consumeRateLimit } from "@/lib/security/rateLimit";

interface IncomingTrackPayload {
  eventName?: unknown;
  visitorId?: unknown;
  sessionId?: unknown;
  path?: unknown;
  referrer?: unknown;
  metadata?: unknown;
}

const EVENT_NAME_REGEX = /^[a-z0-9_:.\\/-]{2,64}$/i;
const MAX_TEXT_LENGTH = 2048;
const MAX_METADATA_KEYS = 24;
const MAX_METADATA_DEPTH = 2;
const MAX_ARRAY_LENGTH = 20;
const MAX_METADATA_STRING_LENGTH = 256;
const CLIENT_HEADER_PASSTHROUGH = [
  "user-agent",
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
  "x-vercel-forwarded-for",
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country",
  "accept-language"
] as const;
const HUMAN_TRACK_RATE_LIMIT = { limit: 240, windowMs: 60 * 1000 };
const BOT_TRACK_RATE_LIMIT = { limit: 30, windowMs: 60 * 1000 };

function isValidText(value: unknown, maxLength = 128): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

function sanitizePath(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_TEXT_LENGTH) {
    return undefined;
  }

  return trimmed;
}

function sanitizeReferrer(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_TEXT_LENGTH) {
    return undefined;
  }

  return trimmed;
}

function sanitizeMetadataValue(value: unknown, depth: number): unknown {
  if (typeof value === "string") {
    return value.slice(0, MAX_METADATA_STRING_LENGTH);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "boolean" || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    if (depth >= MAX_METADATA_DEPTH) {
      return undefined;
    }

    return value
      .slice(0, MAX_ARRAY_LENGTH)
      .map((item) => sanitizeMetadataValue(item, depth + 1))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    if (depth >= MAX_METADATA_DEPTH) {
      return undefined;
    }

    const entries = Object.entries(value as Record<string, unknown>).slice(0, MAX_METADATA_KEYS);
    const sanitizedEntries = entries
      .map(([key, child]) => [key, sanitizeMetadataValue(child, depth + 1)] as const)
      .filter(([, child]) => child !== undefined);

    return Object.fromEntries(sanitizedEntries);
  }

  return undefined;
}

function sanitizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>).slice(0, MAX_METADATA_KEYS);
  const sanitizedEntries = entries
    .map(([key, child]) => [key, sanitizeMetadataValue(child, 0)] as const)
    .filter(([, child]) => child !== undefined);

  return Object.fromEntries(sanitizedEntries);
}

function validatePayload(payload: IncomingTrackPayload): {
  valid: boolean;
  body?: Record<string, unknown>;
  error?: string;
} {
  if (!isValidText(payload.eventName, 64) || !EVENT_NAME_REGEX.test(payload.eventName)) {
    return { valid: false, error: "Invalid eventName." };
  }

  if (!isValidText(payload.visitorId, 128)) {
    return { valid: false, error: "Invalid visitorId." };
  }

  if (!isValidText(payload.sessionId, 128)) {
    return { valid: false, error: "Invalid sessionId." };
  }

  const body = {
    eventName: payload.eventName,
    visitorId: payload.visitorId,
    sessionId: payload.sessionId,
    path: sanitizePath(payload.path),
    referrer: sanitizeReferrer(payload.referrer),
    metadata: sanitizeMetadata(payload.metadata)
  };

  return { valid: true, body };
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const host =
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      new URL(request.url).host;
    const proto =
      request.headers.get("x-forwarded-proto") ??
      new URL(request.url).protocol.replace(":", "");
    return originUrl.origin.toLowerCase() === `${proto}://${host}`.toLowerCase();
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const endpoint = process.env.ANALYTICS_ENDPOINT ?? process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  const writeKey = process.env.ANALYTICS_WRITE_KEY;

  if (!endpoint) {
    return NextResponse.json(
      { error: "Analytics endpoint not configured on landing server." },
      { status: 503 }
    );
  }

  if (!writeKey) {
    return NextResponse.json(
      { error: "ANALYTICS_WRITE_KEY is missing on landing server." },
      { status: 503 }
    );
  }

  const payload = (await request.json().catch(() => null)) as IncomingTrackPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const validated = validatePayload(payload);
  if (!validated.valid || !validated.body) {
    return NextResponse.json({ error: validated.error ?? "Invalid payload." }, { status: 400 });
  }

  const ip = getClientIp(request.headers);
  const isBot = isLikelyBotRequest(request.headers);
  const limitResult = consumeRateLimit(
    `track:${ip}:${isBot ? "bot" : "human"}`,
    isBot ? BOT_TRACK_RATE_LIMIT : HUMAN_TRACK_RATE_LIMIT
  );

  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Too many track requests from this source." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(Math.ceil(limitResult.retryAfterMs / 1000), 1))
        }
      }
    );
  }

  if (isBot) {
    return NextResponse.json({ ok: true, dropped: "bot_signal" }, { status: 202 });
  }

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Analytics-Key": writeKey
  };

  for (const headerName of CLIENT_HEADER_PASSTHROUGH) {
    const value = request.headers.get(headerName);
    if (value) {
      upstreamHeaders[headerName] = value;
    }
  }

  const upstreamResponse = await fetch(endpoint, {
    method: "POST",
    headers: upstreamHeaders,
    body: JSON.stringify(validated.body),
    cache: "no-store"
  }).catch(() => null);

  if (!upstreamResponse) {
    return NextResponse.json({ error: "Analytics upstream unavailable." }, { status: 502 });
  }

  const upstreamJson = await upstreamResponse.json().catch(() => null);

  if (!upstreamResponse.ok) {
    const hint =
      upstreamResponse.status === 401
        ? "Verify ANALYTICS_WRITE_KEY on the landing and dashboard environments."
        : undefined;

    return NextResponse.json(
      {
        error: "Upstream tracking rejected the event.",
        upstreamStatus: upstreamResponse.status,
        upstream: upstreamJson,
        ...(hint ? { hint } : {})
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      upstream: upstreamJson
    },
    { status: 202 }
  );
}
