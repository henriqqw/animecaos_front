import { container } from "@/infrastructure/container";
import { errorJson, okJson } from "@/interface/http/http";
import { requireDashboardAuth } from "@/interface/http/authGuard";
import { resolveTimeRange } from "@/shared/timeRange";

export async function GET(request: Request) {
  try {
    const auth = requireDashboardAuth(request);
    if (!auth.ok) {
      return auth.response;
    }

    const url = new URL(request.url);
    const range = resolveTimeRange(url.searchParams);
    const funnel = container.getFunnelMetricsUseCase.execute(range);

    return okJson({
      range,
      funnel
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorJson(500, "Failed to load funnel metrics.", null, { message });
  }
}
