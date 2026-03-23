import { createHash, randomUUID } from "node:crypto";

import type { DeviceType } from "@/domain/events/types";

const MOBILE_REGEX =
  /android|iphone|ipod|blackberry|iemobile|opera mini|mobile|phone/i;
const TABLET_REGEX = /ipad|tablet|kindle|silk/i;
const BOT_REGEX = /bot|crawler|spider|slurp|bingpreview|headless/i;

function firstNonEmpty(values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (value && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function extractClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  return firstNonEmpty([
    headers.get("x-real-ip"),
    headers.get("cf-connecting-ip"),
    headers.get("x-vercel-forwarded-for")
  ]);
}

function deriveDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) {
    return "unknown";
  }

  if (BOT_REGEX.test(userAgent)) {
    return "bot";
  }

  if (TABLET_REGEX.test(userAgent)) {
    return "tablet";
  }

  if (MOBILE_REGEX.test(userAgent)) {
    return "mobile";
  }

  return "desktop";
}

export function deriveCountry(headers: Headers): string | null {
  return firstNonEmpty([
    headers.get("x-vercel-ip-country"),
    headers.get("cf-ipcountry"),
    headers.get("x-country")
  ]);
}

export function deriveDeviceTypeFromHeaders(headers: Headers): DeviceType {
  return deriveDeviceType(headers.get("user-agent"));
}

export function deriveUserAgent(headers: Headers): string | null {
  return firstNonEmpty([headers.get("user-agent")]);
}

export function deriveVisitorId(headers: Headers, providedVisitorId?: string): string {
  if (providedVisitorId && providedVisitorId.trim()) {
    return providedVisitorId.trim();
  }

  const ip = extractClientIp(headers) ?? "0.0.0.0";
  const userAgent = headers.get("user-agent") ?? "unknown";
  const salt = process.env.VISITOR_HASH_SALT ?? "analytics-first-party-default-salt";
  return createHash("sha256").update(`${salt}:${ip}:${userAgent}`).digest("hex").slice(0, 32);
}

export function deriveSessionId(providedSessionId?: string): string {
  if (providedSessionId && providedSessionId.trim()) {
    return providedSessionId.trim();
  }

  return randomUUID();
}

export function validateWriteKey(headers: Headers): boolean {
  const requiredKey = process.env.ANALYTICS_WRITE_KEY;
  if (!requiredKey || !requiredKey.trim()) {
    return true;
  }

  const receivedKey = headers.get("x-analytics-key");
  return receivedKey === requiredKey;
}

