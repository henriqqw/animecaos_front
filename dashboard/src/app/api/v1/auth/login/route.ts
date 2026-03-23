import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getDashboardAuthConfigError,
  isDashboardAuthConfigured,
  issueDashboardSession,
  validateDashboardCredentials
} from "@/security/dashboardAuth";
import { consumeRateLimit, resetRateLimit } from "@/security/rateLimit";
import { getRequestIp, isSameOriginRequest } from "@/security/requestSecurity";

const loginSchema = z.object({
  username: z.string().trim().min(3).max(64),
  password: z.string().min(8).max(256)
});

const LOGIN_IP_RATE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 };
const LOGIN_USER_RATE_LIMIT = { limit: 6, windowMs: 10 * 60 * 1000 };

function tooManyRequests(retryAfterMs: number): NextResponse {
  const retryAfterSeconds = Math.max(Math.ceil(retryAfterMs / 1000), 1);
  return NextResponse.json(
    { error: "Too many login attempts. Try again later." },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds)
      }
    }
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Invalid origin for this action." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!isDashboardAuthConfigured()) {
    return NextResponse.json(
      {
        error: "Dashboard auth is not configured.",
        details: { message: getDashboardAuthConfigError() }
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid login payload." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { username, password } = parsed.data;
  const ip = getRequestIp(request.headers);
  const normalizedUsername = username.toLowerCase();

  const ipAttempt = consumeRateLimit(`dashboard-auth:ip:${ip}`, LOGIN_IP_RATE_LIMIT);
  if (!ipAttempt.allowed) {
    return tooManyRequests(ipAttempt.retryAfterMs);
  }

  const userAttempt = consumeRateLimit(
    `dashboard-auth:user:${ip}:${normalizedUsername}`,
    LOGIN_USER_RATE_LIMIT
  );
  if (!userAttempt.allowed) {
    return tooManyRequests(userAttempt.retryAfterMs);
  }

  const valid = validateDashboardCredentials(username, password);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  resetRateLimit(`dashboard-auth:user:${ip}:${normalizedUsername}`);
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  const sessionSet = issueDashboardSession(response, username);
  if (!sessionSet) {
    return NextResponse.json(
      { error: "Failed to issue session." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  return response;
}
