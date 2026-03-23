import { container } from "@/infrastructure/container";
import { errorJson, okJson } from "@/interface/http/http";
import { clampLimit, resolveTimeRange } from "@/shared/timeRange";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const range = resolveTimeRange(url.searchParams);
    const limit = clampLimit(url.searchParams.get("limit"), 10, 30);
    const pages = container.getTopPagesUseCase.execute(range, limit);

    return okJson({
      range,
      pages
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorJson(500, "Failed to load top pages metrics.", null, { message });
  }
}

