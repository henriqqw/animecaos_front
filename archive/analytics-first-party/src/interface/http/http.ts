import { NextResponse } from "next/server";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
} as const;

function normalizeOrigins(): string[] {
  const configured = process.env.TRACKING_ALLOWED_ORIGINS ?? "*";
  return configured
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function resolveOriginHeader(requestOrigin: string | null): string {
  const allowedOrigins = normalizeOrigins();
  if (allowedOrigins.includes("*")) {
    return "*";
  }

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] ?? "*";
}

export function buildCorsHeaders(requestOrigin: string | null): HeadersInit {
  const origin = resolveOriginHeader(requestOrigin);
  return {
    ...DEFAULT_HEADERS,
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Analytics-Key",
    Vary: "Origin"
  };
}

export function okJson(data: unknown, requestOrigin: string | null = null): NextResponse {
  return NextResponse.json(data, { headers: buildCorsHeaders(requestOrigin) });
}

export function errorJson(
  status: number,
  message: string,
  requestOrigin: string | null = null,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {})
    },
    {
      status,
      headers: buildCorsHeaders(requestOrigin)
    }
  );
}

export function optionsResponse(requestOrigin: string | null): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(requestOrigin)
  });
}

