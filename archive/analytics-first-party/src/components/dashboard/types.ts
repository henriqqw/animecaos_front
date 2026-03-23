import type {
  DailyMetricPoint,
  DashboardOverview,
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

export interface TopPagesResponse {
  range: TimeRange;
  pages: TopPageMetric[];
}

