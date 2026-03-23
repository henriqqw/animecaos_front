import { NextResponse } from "next/server";

import {
  getDashboardAuthConfigError,
  isDashboardAuthConfigured,
  readDashboardSessionFromRequest,
  type DashboardSession
} from "@/security/dashboardAuth";

export type AuthGuardResult =
  | { ok: true; session: DashboardSession }
  | { ok: false; response: NextResponse };

export function requireDashboardAuth(request: Request): AuthGuardResult {
  if (!isDashboardAuthConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Dashboard auth is not configured.",
          details: { message: getDashboardAuthConfigError() }
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      )
    };
  }

  const session = readDashboardSessionFromRequest(request);
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      )
    };
  }

  return { ok: true, session };
}
