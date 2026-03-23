import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

import type { DeviceType } from "@/domain/events/types";

const MOBILE_REGEX =
  /android|iphone|ipod|blackberry|iemobile|opera mini|mobile|phone/i;
const TABLET_REGEX = /ipad|tablet|kindle|silk/i;
const HIGH_CONFIDENCE_BOT_UA_REGEX =
  /bot|crawler|spider|slurp|bingpreview|headless|phantomjs|selenium|playwright|puppeteer|facebookexternalhit|discordbot|telegrambot|linkedinbot|python-requests|curl|wget|postmanruntime|insomnia|axios|go-http-client|okhttp|apache-httpclient|libwww-perl|java\//i;

function firstNonEmpty(values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (value && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function extractClientIp(headers: Headers): string | null {
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

function hasHeadlessClientHints(headers: Headers): boolean {
  const secChUa = headers.get("sec-ch-ua")?.toLowerCase() ?? "";
  if (secChUa.includes("headless")) {
    return true;
  }

  return Boolean(headers.get("x-playwright") || headers.get("x-puppeteer"));
}

function hasBrowserNavigationHeaders(headers: Headers): boolean {
  return Boolean(headers.get("sec-fetch-mode") && headers.get("sec-fetch-site"));
}

export function deriveBotSignal(
  headers: Headers,
  metadata: Record<string, unknown> | undefined = undefined
): boolean {
  const userAgent = headers.get("user-agent");
  let score = 0;

  if (!userAgent) {
    score += 3;
  }

  if (userAgent && HIGH_CONFIDENCE_BOT_UA_REGEX.test(userAgent)) {
    score += 5;
  }

  if (hasHeadlessClientHints(headers)) {
    score += 4;
  }

  if (!hasBrowserNavigationHeaders(headers) && !headers.get("accept-language")) {
    score += 2;
  }

  if (metadata?.is_bot === true || metadata?.bot === true) {
    score += 5;
  }

  return score >= 5;
}

function deriveDeviceType(userAgent: string | null, isBot: boolean): DeviceType {
  if (isBot) {
    return "bot";
  }

  if (!userAgent) {
    return "unknown";
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

export function deriveDeviceTypeFromHeaders(
  headers: Headers,
  metadata: Record<string, unknown> | undefined = undefined
): DeviceType {
  const isBot = deriveBotSignal(headers, metadata);
  return deriveDeviceType(headers.get("user-agent"), isBot);
}

export function deriveUserAgent(headers: Headers): string | null {
  return firstNonEmpty([headers.get("user-agent")]);
}

export function deriveVisitorId(headers: Headers, providedVisitorId?: string): string {
  if (providedVisitorId && providedVisitorId.trim()) {
    return providedVisitorId.trim();
  }

  const ip = extractClientIp(headers) ?? "0.0.0.0";
  const host = headers.get("host") ?? "unknown-host";
  const userAgent = headers.get("user-agent") ?? "unknown";
  const salt =
    process.env.VISITOR_HASH_SALT?.trim() ??
    process.env.ANALYTICS_WRITE_KEY?.trim() ??
    "dashboard-default";
  return createHash("sha256")
    .update(`${salt}:${host}:${ip}:${userAgent}`)
    .digest("hex")
    .slice(0, 32);
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
  if (!receivedKey) {
    return false;
  }

  const expected = Buffer.from(requiredKey, "utf8");
  const provided = Buffer.from(receivedKey, "utf8");
  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}
