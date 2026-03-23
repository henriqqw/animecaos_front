export type EventName =
  | "page_view"
  | "download_click"
  | "pwa_installed"
  | "first_open"
  | (string & {});

export type DeviceType = "mobile" | "tablet" | "desktop" | "bot" | "unknown";

export interface AnalyticsEvent {
  eventId: string;
  eventName: EventName;
  occurredAt: string;
  visitorId: string;
  sessionId: string | null;
  path: string | null;
  referrer: string | null;
  country: string | null;
  userAgent: string | null;
  deviceType: DeviceType;
  isBot: boolean;
  metadata: Record<string, unknown>;
}

export interface DashboardOverview {
  uniqueVisitors: number;
  totalEvents: number;
  pageViews: number;
  downloadClicks: number;
  installs: number;
  clickThroughRate: number;
  installRateFromClicks: number;
}

export interface DailyMetricPoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  downloadClicks: number;
  installs: number;
}

export interface FunnelMetric {
  step: "visit" | "click" | "install";
  visitors: number;
  conversionFromPreviousStep: number;
}

export interface DownloadAttributionMetric {
  path: string;
  channel: string;
  totalDownloads: number;
  uniqueVisitors: number;
}

export interface TopPageMetric {
  path: string;
  views: number;
  uniqueVisitors: number;
}

export interface BreakdownMetric {
  name: string;
  visitors: number;
  percent: number;
}

export interface TopReferrerMetric {
  name: string;
  visitors: number;
}

export interface EventMetric {
  eventName: string;
  visitors: number;
  total: number;
}

export interface ExplorerTimeseriesPoint {
  date: string;
  visitors: number;
  pageViews: number;
}

export interface ExplorerMetrics {
  visitors: number;
  activeUsersLast5Minutes: number;
  pageViews: number;
  bounceRate: number;
  points: ExplorerTimeseriesPoint[];
  pages: TopPageMetric[];
  routes: TopPageMetric[];
  hostnames: BreakdownMetric[];
  referrers: TopReferrerMetric[];
  utmParameters: TopReferrerMetric[];
  countries: BreakdownMetric[];
  devices: BreakdownMetric[];
  browsers: BreakdownMetric[];
  operatingSystems: BreakdownMetric[];
  events: EventMetric[];
  isSynthetic: boolean;
}

export interface TimeRange {
  from: string;
  to: string;
}
