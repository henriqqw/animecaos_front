import { container } from "@/infrastructure/container";
import { requireDashboardAuth } from "@/interface/http/authGuard";
import { errorJson } from "@/interface/http/http";
import { clampLimit, resolveTimeRange } from "@/shared/timeRange";

const SUPPORTED_BLOCKS = ["pages", "referrers", "countries", "events"] as const;

type SupportedBlock = (typeof SUPPORTED_BLOCKS)[number];

function isSupportedBlock(input: string | null): input is SupportedBlock {
  return Boolean(input && SUPPORTED_BLOCKS.includes(input as SupportedBlock));
}

function escapeCsvCell(value: string | number): string {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }
  return stringValue;
}

function toCsv(rows: Array<Array<string | number>>): string {
  return rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(",")).join("\n");
}

function buildRows(
  block: SupportedBlock,
  explorer: ReturnType<typeof container.getExplorerMetricsUseCase.execute>
): Array<Array<string | number>> {
  if (block === "pages") {
    return [
      ["path", "views", "unique_visitors"],
      ...explorer.pages.map((item) => [item.path, item.views, item.uniqueVisitors])
    ];
  }

  if (block === "referrers") {
    return [
      ["referrer", "visitors"],
      ...explorer.referrers.map((item) => [item.name, item.visitors])
    ];
  }

  if (block === "countries") {
    return [
      ["country", "visitors", "percent"],
      ...explorer.countries.map((item) => [item.name, item.visitors, item.percent])
    ];
  }

  return [
    ["event", "visitors", "total"],
    ...explorer.events.map((item) => [item.eventName, item.visitors, item.total])
  ];
}

export async function GET(request: Request) {
  try {
    const auth = requireDashboardAuth(request);
    if (!auth.ok) {
      return auth.response;
    }

    const url = new URL(request.url);
    const block = url.searchParams.get("block");
    if (!isSupportedBlock(block)) {
      return errorJson(400, "Invalid export block. Use pages, referrers, countries or events.");
    }

    const range = resolveTimeRange(url.searchParams);
    const limit = clampLimit(url.searchParams.get("limit"), 200, 5000);
    const explorer = container.getExplorerMetricsUseCase.execute(range, limit);
    const rows = buildRows(block, explorer);
    const csv = toCsv(rows);
    const dateSuffix = new Date().toISOString().slice(0, 10);
    const filename = `analytics-${block}-${dateSuffix}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorJson(500, "Failed to export metrics.", null, { message });
  }
}
