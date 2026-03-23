import type {
  BreakdownMetric,
  DailyMetricPoint,
  DashboardOverview,
  DownloadAttributionMetric,
  EventMetric,
  ExplorerMetrics,
  ExplorerTimeseriesPoint,
  FunnelMetric,
  TimeRange,
  TopPageMetric
} from "@/domain/events/types";

export interface OverviewResponse {
  range: TimeRange;
  overview: DashboardOverview;
}

export interface TimeseriesResponse {
  range: TimeRange;
  points: DailyMetricPoint[];
}

export interface FunnelResponse {
  range: TimeRange;
  funnel: FunnelMetric[];
}

export interface DownloadAttributionResponse {
  range: TimeRange;
  downloads: DownloadAttributionMetric[];
}

export interface TopPagesResponse {
  range: TimeRange;
  pages: TopPageMetric[];
}

export interface ExplorerResponse {
  range: TimeRange;
  explorer: ExplorerMetrics;
}

export type ExplorerSeriesPoint = ExplorerTimeseriesPoint;
export type ExplorerBreakdownItem = BreakdownMetric;
export type ExplorerEventItem = EventMetric;
export type DownloadAttributionItem = DownloadAttributionMetric;
