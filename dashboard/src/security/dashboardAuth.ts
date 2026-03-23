import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "node:crypto";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

interface DashboardAuthConfig {
  username: string;
  passwordHash: string;
  sessionSecret: string;
  sessionTtlSeconds: number;
  secureCookie: boolean;
}

interface ParsedScryptHash {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  hash: Buffer;
}

export interface DashboardSession {
  username: string;
  iat: number;
  exp: number;
  nonce: string;
}

export const DASHBOARD_SESSION_COOKIE_NAME = "dashboard_session";

const DEFAULT_SESSION_TTL_SECONDS = 12 * 60 * 60;

function toBase64Url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function parseInteger(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseScryptHash(encoded: string): ParsedScryptHash | null {
  const parts = encoded.trim().split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return null;
  }

  const N = parseInteger(parts[1], 0);
  const r = parseInteger(parts[2], 0);
  const p = parseInteger(parts[3], 0);
  if (N <= 0 || r <= 0 || p <= 0) {
    return null;
  }

  try {
    const salt = fromBase64Url(parts[4]);
    const hash = fromBase64Url(parts[5]);
    if (salt.length < 8 || hash.length < 16) {
      return null;
    }

    return { N, r, p, salt, hash };
  } catch {
    return null;
  }
}

function verifyScryptPassword(password: string, encodedHash: string): boolean {
  const parsed = parseScryptHash(encodedHash);
  if (!parsed) {
    return false;
  }

  try {
    const derived = scryptSync(password, parsed.salt, parsed.hash.length, {
      N: parsed.N,
      r: parsed.r,
      p: parsed.p,
      maxmem: 64 * 1024 * 1024
    });

    if (derived.length !== parsed.hash.length) {
      return false;
    }

    return timingSafeEqual(derived, parsed.hash);
  } catch {
    return false;
  }
}

function loadAuthConfig(): DashboardAuthConfig | null {
  const username = process.env.DASHBOARD_AUTH_USERNAME?.trim();
  const passwordHash = process.env.DASHBOARD_AUTH_PASSWORD_HASH?.trim();
  const sessionSecret = process.env.DASHBOARD_SESSION_SECRET?.trim();

  if (!username || !passwordHash || !sessionSecret) {
    return null;
  }

  const sessionTtlSeconds = parseInteger(
    process.env.DASHBOARD_SESSION_TTL_SECONDS ?? "",
    DEFAULT_SESSION_TTL_SECONDS
  );
  const secureCookie =
    process.env.DASHBOARD_SESSION_COOKIE_SECURE?.trim() === "true" ||
    (process.env.NODE_ENV === "production" &&
      process.env.DASHBOARD_SESSION_COOKIE_SECURE?.trim() !== "false");

  return {
    username,
    passwordHash,
    sessionSecret,
    sessionTtlSeconds,
    secureCookie
  };
}

function deriveSessionKey(secret: string): Buffer {
  return createHmac("sha256", "dashboard-session").update(secret).digest();
}

function encryptSessionPayload(payload: DashboardSession, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveSessionKey(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return toBase64Url(Buffer.concat([iv, tag, encrypted]));
}

function decryptSessionPayload(token: string, secret: string): DashboardSession | null {
  try {
    const raw = fromBase64Url(token);
    if (raw.length <= 28) {
      return null;
    }

    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);

    const decipher = createDecipheriv("aes-256-gcm", deriveSessionKey(secret), iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const parsed = JSON.parse(plain.toString("utf8")) as Partial<DashboardSession>;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.username !== "string" ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number" ||
      typeof parsed.nonce !== "string"
    ) {
      return null;
    }

    if (parsed.exp <= Date.now()) {
      return null;
    }

    return {
      username: parsed.username,
      iat: parsed.iat,
      exp: parsed.exp,
      nonce: parsed.nonce
    };
  } catch {
    return null;
  }
}

function readCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [rawName, ...rest] = pair.trim().split("=");
    if (rawName !== cookieName || rest.length === 0) {
      continue;
    }

    return rest.join("=");
  }

  return null;
}

export function getDashboardAuthConfigError(): string | null {
  if (!process.env.DASHBOARD_AUTH_USERNAME?.trim()) {
    return "Missing DASHBOARD_AUTH_USERNAME.";
  }

  if (!process.env.DASHBOARD_AUTH_PASSWORD_HASH?.trim()) {
    return "Missing DASHBOARD_AUTH_PASSWORD_HASH.";
  }

  if (!process.env.DASHBOARD_SESSION_SECRET?.trim()) {
    return "Missing DASHBOARD_SESSION_SECRET.";
  }

  return null;
}

export function isDashboardAuthConfigured(): boolean {
  return loadAuthConfig() !== null;
}

export function validateDashboardCredentials(username: string, password: string): boolean {
  const config = loadAuthConfig();
  if (!config) {
    return false;
  }

  if (username !== config.username) {
    return false;
  }

  return verifyScryptPassword(password, config.passwordHash);
}

export function issueDashboardSession(response: NextResponse, username: string): boolean {
  const config = loadAuthConfig();
  if (!config || username !== config.username) {
    return false;
  }

  const now = Date.now();
  const payload: DashboardSession = {
    username,
    iat: now,
    exp: now + config.sessionTtlSeconds * 1000,
    nonce: toBase64Url(randomBytes(16))
  };
  const token = encryptSessionPayload(payload, config.sessionSecret);

  response.cookies.set({
    name: DASHBOARD_SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: config.secureCookie,
    path: "/",
    maxAge: config.sessionTtlSeconds
  });
  return true;
}

export function clearDashboardSession(response: NextResponse): void {
  response.cookies.set({
    name: DASHBOARD_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.DASHBOARD_SESSION_COOKIE_SECURE?.trim() === "true" ||
      (process.env.NODE_ENV === "production" &&
        process.env.DASHBOARD_SESSION_COOKIE_SECURE?.trim() !== "false"),
    path: "/",
    maxAge: 0
  });
}

export function readDashboardSessionFromRequest(request: Request): DashboardSession | null {
  const config = loadAuthConfig();
  if (!config) {
    return null;
  }

  const token = readCookieValue(request.headers.get("cookie"), DASHBOARD_SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }

  return decryptSessionPayload(token, config.sessionSecret);
}

export async function readDashboardSessionFromCookiesStore(): Promise<DashboardSession | null> {
  const config = loadAuthConfig();
  if (!config) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(DASHBOARD_SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return decryptSessionPayload(token, config.sessionSecret);
}

export function buildScryptHashForDocs(password: string): string {
  const N = 16384;
  const r = 8;
  const p = 1;
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 32, { N, r, p, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${r}$${p}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}
