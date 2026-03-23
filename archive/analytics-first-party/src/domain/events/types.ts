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

export interface TopPageMetric {
  path: string;
  views: number;
  uniqueVisitors: number;
}

export interface TimeRange {
  from: string;
  to: string;
}

