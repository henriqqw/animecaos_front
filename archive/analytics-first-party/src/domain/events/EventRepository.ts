import type {
  AnalyticsEvent,
  DailyMetricPoint,
  DashboardOverview,
  FunnelMetric,
  TimeRange,
  TopPageMetric
} from "@/domain/events/types";

export interface EventRepository {
  insertEvent(event: AnalyticsEvent): boolean;
  getOverview(range: TimeRange): DashboardOverview;
  getTimeseries(range: TimeRange): DailyMetricPoint[];
  getFunnel(range: TimeRange): FunnelMetric[];
  getTopPages(range: TimeRange, limit: number): TopPageMetric[];
}

