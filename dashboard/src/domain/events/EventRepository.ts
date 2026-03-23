import type {
  AnalyticsEvent,
  DailyMetricPoint,
  DashboardOverview,
  DownloadAttributionMetric,
  ExplorerMetrics,
  FunnelMetric,
  TimeRange,
  TopPageMetric
} from "@/domain/events/types";

export interface EventRepository {
  insertEvent(event: AnalyticsEvent): boolean;
  getOverview(range: TimeRange): DashboardOverview;
  getTimeseries(range: TimeRange): DailyMetricPoint[];
  getFunnel(range: TimeRange): FunnelMetric[];
  getDownloadAttribution(range: TimeRange, limit: number): DownloadAttributionMetric[];
  getTopPages(range: TimeRange, limit: number): TopPageMetric[];
  getExplorerMetrics(range: TimeRange, limit: number): ExplorerMetrics;
}
