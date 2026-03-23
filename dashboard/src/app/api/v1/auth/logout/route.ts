import { NextResponse } from "next/server";

import { clearDashboardSession } from "@/security/dashboardAuth";
import { isSameOriginRequest } from "@/security/requestSecurity";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Invalid origin for this action." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  clearDashboardSession(response);
  return response;
}
