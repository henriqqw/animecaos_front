import fs from "node:fs";
import path from "node:path";

import defaultBaselineSeed from "../../../config/vercel-baseline.json";
import type { EventRepository } from "@/domain/events/EventRepository";
import type {
  AnalyticsEvent,
  BreakdownMetric,
  DailyMetricPoint,
  DashboardOverview,
  DownloadAttributionMetric,
  EventMetric,
  ExplorerMetrics,
  ExplorerTimeseriesPoint,
  FunnelMetric,
  TimeRange,
  TopPageMetric,
  TopReferrerMetric
} from "@/domain/events/types";
import { EventFileStore } from "@/infrastructure/db/fileStore";
import { enumerateUtcDays } from "@/shared/timeRange";

interface BaselineFile {
  capturedAt?: string;
  visitors?: number;
  pageViews?: number;
  bounceRate?: number;
  points?: ExplorerTimeseriesPoint[];
  pages?: TopPageMetric[];
  routes?: TopPageMetric[];
  hostnames?: BreakdownMetric[];
  referrers?: TopReferrerMetric[];
  utmParameters?: TopReferrerMetric[];
  countries?: BreakdownMetric[];
  devices?: BreakdownMetric[];
  browsers?: BreakdownMetric[];
  operatingSystems?: BreakdownMetric[];
  events?: EventMetric[];
}

interface BaselineSnapshot {
  capturedAt: string | null;
  metrics: ExplorerMetrics;
}

const DEFAULT_BASELINE_FILE = defaultBaselineSeed as BaselineFile;

function percentage(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(2));
}

function eventInRange(event: AnalyticsEvent, range: TimeRange): boolean {
  return event.occurredAt >= range.from && event.occurredAt <= range.to;
}

function isHumanEvent(event: AnalyticsEvent): boolean {
  return event.isBot !== true && event.deviceType !== "bot";
}

function dayKey(value: string): string {
  return value.slice(0, 10);
}

function isInstallEvent(eventName: string): boolean {
  return eventName === "first_open";
}

function parseHostname(input: string | null): string | null {
  if (!input) {
    return null;
  }

  try {
    const url = new URL(input);
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

function parsePathname(input: string | null): string {
  if (!input) {
    return "/";
  }

  if (input.startsWith("/")) {
    return input.split("?")[0] ?? "/";
  }

  try {
    return new URL(input).pathname || "/";
  } catch {
    return "/";
  }
}

function extractDownloadChannel(metadata: Record<string, unknown>): string {
  const raw = metadata.channel;
  if (typeof raw !== "string") {
    return "unknown_button";
  }

  const normalized = raw.trim();
  if (!normalized) {
    return "unknown_button";
  }

  return normalized.slice(0, 120);
}

function extractUtmTag(pathValue: string | null): string | null {
  if (!pathValue || !pathValue.includes("utm_")) {
    return null;
  }

  const query = pathValue.split("?")[1];
  if (!query) {
    return null;
  }

  const params = new URLSearchParams(query);
  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  const campaign = params.get("utm_campaign");

  const value = [source, medium, campaign].filter(Boolean).join(" / ");
  return value || null;
}

function inferBrowser(userAgent: string | null): string {
  if (!userAgent) {
    return "Unknown";
  }

  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) {
    return "Edge";
  }
  if (ua.includes("opr/") || ua.includes("opera")) {
    return "Opera";
  }
  if (ua.includes("chrome/")) {
    return "Chrome";
  }
  if (ua.includes("firefox/")) {
    return "Firefox";
  }
  if (ua.includes("safari/") && !ua.includes("chrome/")) {
    return "Safari";
  }

  return "Unknown";
}

function inferOperatingSystem(userAgent: string | null): string {
  if (!userAgent) {
    return "Unknown";
  }

  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) {
    return "Windows";
  }
  if (ua.includes("android")) {
    return "Android";
  }
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) {
    return "iOS";
  }
  if (ua.includes("mac os") || ua.includes("macintosh")) {
    return "Mac";
  }
  if (ua.includes("linux")) {
    return "GNU/Linux";
  }

  return "Unknown";
}

function countryCodeToName(code: string | null): string {
  if (!code) {
    return "Unknown";
  }

  const upper = code.toUpperCase();
  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    return display.of(upper) ?? upper;
  } catch {
    return upper;
  }
}

function toBreakdown(entries: Array<[string, Set<string>]>, totalVisitors: number): BreakdownMetric[] {
  return entries
    .map(([name, visitors]) => ({
      name,
      visitors: visitors.size,
      percent: percentage(visitors.size, totalVisitors)
    }))
    .sort((left, right) => right.visitors - left.visitors);
}

function toTopList(entries: Array<[string, Set<string>]>): TopReferrerMetric[] {
  return entries
    .map(([name, visitors]) => ({
      name,
      visitors: visitors.size
    }))
    .sort((left, right) => right.visitors - left.visitors);
}

function mergeTopPages(
  baseline: TopPageMetric[],
  live: TopPageMetric[],
  limit: number
): TopPageMetric[] {
  const grouped = new Map<string, { views: number; visitors: number }>();

  for (const item of [...baseline, ...live]) {
    const current = grouped.get(item.path) ?? { views: 0, visitors: 0 };
    current.views += item.views;
    current.visitors += item.uniqueVisitors;
    grouped.set(item.path, current);
  }

  return [...grouped.entries()]
    .map(([path, values]) => ({
      path,
      views: values.views,
      uniqueVisitors: values.visitors
    }))
    .sort((left, right) => right.views - left.views)
    .slice(0, limit);
}

function mergeTopList(
  baseline: TopReferrerMetric[],
  live: TopReferrerMetric[],
  limit: number
): TopReferrerMetric[] {
  const grouped = new Map<string, number>();

  for (const item of [...baseline, ...live]) {
    grouped.set(item.name, (grouped.get(item.name) ?? 0) + item.visitors);
  }

  return [...grouped.entries()]
    .map(([name, visitors]) => ({ name, visitors }))
    .sort((left, right) => right.visitors - left.visitors)
    .slice(0, limit);
}

function mergeBreakdown(
  baseline: BreakdownMetric[],
  live: BreakdownMetric[],
  totalVisitors: number,
  limit: number
): BreakdownMetric[] {
  const grouped = new Map<string, number>();

  for (const item of [...baseline, ...live]) {
    grouped.set(item.name, (grouped.get(item.name) ?? 0) + item.visitors);
  }

  return [...grouped.entries()]
    .map(([name, visitors]) => ({
      name,
      visitors,
      percent: percentage(visitors, totalVisitors)
    }))
    .sort((left, right) => right.visitors - left.visitors)
    .slice(0, limit);
}

function mergeEvents(baseline: EventMetric[], live: EventMetric[], limit: number): EventMetric[] {
  const grouped = new Map<string, { visitors: number; total: number }>();

  for (const item of [...baseline, ...live]) {
    const current = grouped.get(item.eventName) ?? { visitors: 0, total: 0 };
    current.visitors += item.visitors;
    current.total += item.total;
    grouped.set(item.eventName, current);
  }

  return [...grouped.entries()]
    .map(([eventName, values]) => ({
      eventName,
      visitors: values.visitors,
      total: values.total
    }))
    .sort((left, right) => right.total - left.total)
    .slice(0, limit);
}

function mergePoints(
  range: TimeRange,
  baseline: ExplorerTimeseriesPoint[],
  live: ExplorerTimeseriesPoint[]
): ExplorerTimeseriesPoint[] {
  const grouped = new Map<string, { visitors: number; pageViews: number }>();

  for (const point of [...baseline, ...live]) {
    const current = grouped.get(point.date) ?? { visitors: 0, pageViews: 0 };
    current.visitors += point.visitors;
    current.pageViews += point.pageViews;
    grouped.set(point.date, current);
  }

  return enumerateUtcDays(range).map((date) => {
    const current = grouped.get(date);
    return {
      date,
      visitors: current?.visitors ?? 0,
      pageViews: current?.pageViews ?? 0
    };
  });
}

function emptyExplorer(range: TimeRange, activeUsersLast5Minutes = 0): ExplorerMetrics {
  return {
    visitors: 0,
    activeUsersLast5Minutes,
    pageViews: 0,
    bounceRate: 0,
    points: enumerateUtcDays(range).map((date) => ({ date, visitors: 0, pageViews: 0 })),
    pages: [],
    routes: [],
    hostnames: [],
    referrers: [],
    utmParameters: [],
    countries: [],
    devices: [],
    browsers: [],
    operatingSystems: [],
    events: [],
    isSynthetic: false
  };
}

function resolveBaselinePath(): string | null {
  const configured = process.env.VERCEL_BASELINE_PATH;
  if (configured) {
    const configuredPath = path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);

    if (fs.existsSync(configuredPath)) {
      return configuredPath;
    }
  }

  const candidates = [
    path.resolve(process.cwd(), "config", "vercel-baseline.json"),
    path.resolve(process.cwd(), "dashboard", "config", "vercel-baseline.json"),
    path.resolve(process.cwd(), "data", "vercel-baseline.json"),
    path.resolve(process.cwd(), "dashboard", "data", "vercel-baseline.json")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function readBaselineFile(): BaselineFile {
  const filePath = resolveBaselinePath();
  if (!filePath) {
    return DEFAULT_BASELINE_FILE;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as BaselineFile;
  } catch {
    return DEFAULT_BASELINE_FILE;
  }
}

function readBaseline(range: TimeRange, limit: number): BaselineSnapshot | null {
  const parsed = readBaselineFile();
  const days = new Set(enumerateUtcDays(range));

  return {
    capturedAt: parsed.capturedAt ?? null,
    metrics: {
      visitors: parsed.visitors ?? 0,
      activeUsersLast5Minutes: 0,
      pageViews: parsed.pageViews ?? 0,
      bounceRate: parsed.bounceRate ?? 0,
      points: (parsed.points ?? []).filter((point) => days.has(point.date)),
      pages: (parsed.pages ?? []).slice(0, limit),
      routes: (parsed.routes ?? []).slice(0, limit),
      hostnames: (parsed.hostnames ?? []).slice(0, limit),
      referrers: (parsed.referrers ?? []).slice(0, limit),
      utmParameters: (parsed.utmParameters ?? []).slice(0, limit),
      countries: (parsed.countries ?? []).slice(0, limit),
      devices: (parsed.devices ?? []).slice(0, limit),
      browsers: (parsed.browsers ?? []).slice(0, limit),
      operatingSystems: (parsed.operatingSystems ?? []).slice(0, limit),
      events: (parsed.events ?? []).slice(0, limit),
      isSynthetic: false
    }
  };
}

function buildLiveExplorer(
  inRange: AnalyticsEvent[],
  range: TimeRange,
  limit: number,
  activeUsersLast5Minutes: number
): ExplorerMetrics {
  if (inRange.length === 0) {
    return emptyExplorer(range, activeUsersLast5Minutes);
  }

  const pageViewEvents = inRange.filter((event) => event.eventName === "page_view");
  const visitors = new Set(inRange.map((event) => event.visitorId));

  const pageMap = new Map<string, { views: number; visitors: Set<string> }>();
  const routeMap = new Map<string, { views: number; visitors: Set<string> }>();
  const hostnameMap = new Map<string, Set<string>>();
  const referrerMap = new Map<string, Set<string>>();
  const utmMap = new Map<string, Set<string>>();
  const countryMap = new Map<string, Set<string>>();
  const deviceMap = new Map<string, Set<string>>();
  const browserMap = new Map<string, Set<string>>();
  const osMap = new Map<string, Set<string>>();
  const eventMap = new Map<string, { total: number; visitors: Set<string> }>();

  for (const event of inRange) {
    const eventCurrent = eventMap.get(event.eventName) ?? { total: 0, visitors: new Set<string>() };
    eventCurrent.total += 1;
    eventCurrent.visitors.add(event.visitorId);
    eventMap.set(event.eventName, eventCurrent);

    const country = countryCodeToName(event.country);
    const countrySet = countryMap.get(country) ?? new Set<string>();
    countrySet.add(event.visitorId);
    countryMap.set(country, countrySet);

    const device = event.deviceType === "unknown" ? "Unknown" : event.deviceType[0].toUpperCase() + event.deviceType.slice(1);
    const deviceSet = deviceMap.get(device) ?? new Set<string>();
    deviceSet.add(event.visitorId);
    deviceMap.set(device, deviceSet);

    const browser = inferBrowser(event.userAgent);
    const browserSet = browserMap.get(browser) ?? new Set<string>();
    browserSet.add(event.visitorId);
    browserMap.set(browser, browserSet);

    const operatingSystem = inferOperatingSystem(event.userAgent);
    const osSet = osMap.get(operatingSystem) ?? new Set<string>();
    osSet.add(event.visitorId);
    osMap.set(operatingSystem, osSet);

    const referrerHost = parseHostname(event.referrer) ?? "direct";
    const referrerSet = referrerMap.get(referrerHost) ?? new Set<string>();
    referrerSet.add(event.visitorId);
    referrerMap.set(referrerHost, referrerSet);

    const utmTag = extractUtmTag(event.path);
    if (utmTag) {
      const utmSet = utmMap.get(utmTag) ?? new Set<string>();
      utmSet.add(event.visitorId);
      utmMap.set(utmTag, utmSet);
    }

    const hostname = event.path?.startsWith("http") ? parseHostname(event.path) : "animecaos.vercel.app";
    const hostnameSet = hostnameMap.get(hostname ?? "animecaos.vercel.app") ?? new Set<string>();
    hostnameSet.add(event.visitorId);
    hostnameMap.set(hostname ?? "animecaos.vercel.app", hostnameSet);

    if (event.eventName === "page_view") {
      const cleanPath = parsePathname(event.path);

      const pageCurrent = pageMap.get(cleanPath) ?? { views: 0, visitors: new Set<string>() };
      pageCurrent.views += 1;
      pageCurrent.visitors.add(event.visitorId);
      pageMap.set(cleanPath, pageCurrent);

      const firstSegment = cleanPath.split("/").filter(Boolean)[0];
      const route = firstSegment ? `/${firstSegment}` : "/";
      const routeCurrent = routeMap.get(route) ?? { views: 0, visitors: new Set<string>() };
      routeCurrent.views += 1;
      routeCurrent.visitors.add(event.visitorId);
      routeMap.set(route, routeCurrent);
    }
  }

  const pageViews = pageViewEvents.length;
  const uniqueVisitors = visitors.size;

  const sessionsByVisitor = new Map<string, { pageViews: number; engaged: boolean }>();
  for (const event of inRange) {
    const session = sessionsByVisitor.get(event.visitorId) ?? { pageViews: 0, engaged: false };
    if (event.eventName === "page_view") {
      session.pageViews += 1;
    }
    if (event.eventName !== "page_view") {
      session.engaged = true;
    }
    sessionsByVisitor.set(event.visitorId, session);
  }

  const bouncedVisitors = [...sessionsByVisitor.values()].filter(
    (session) => session.pageViews <= 1 && !session.engaged
  ).length;

  const rawPoints = new Map<string, { visitors: Set<string>; pageViews: number }>();
  for (const event of inRange) {
    const key = dayKey(event.occurredAt);
    const current = rawPoints.get(key) ?? { visitors: new Set<string>(), pageViews: 0 };
    current.visitors.add(event.visitorId);
    if (event.eventName === "page_view") {
      current.pageViews += 1;
    }
    rawPoints.set(key, current);
  }

  const points: ExplorerTimeseriesPoint[] = enumerateUtcDays(range).map((date) => {
    const item = rawPoints.get(date);
    return {
      date,
      visitors: item?.visitors.size ?? 0,
      pageViews: item?.pageViews ?? 0
    };
  });

  const pages = [...pageMap.entries()]
    .map(([pathValue, values]) => ({ path: pathValue, views: values.views, uniqueVisitors: values.visitors.size }))
    .sort((left, right) => right.views - left.views)
    .slice(0, limit);

  const routes = [...routeMap.entries()]
    .map(([pathValue, values]) => ({ path: pathValue, views: values.views, uniqueVisitors: values.visitors.size }))
    .sort((left, right) => right.views - left.views)
    .slice(0, limit);

  const events: EventMetric[] = [...eventMap.entries()]
    .map(([eventName, values]) => ({
      eventName,
      visitors: values.visitors.size,
      total: values.total
    }))
    .sort((left, right) => right.total - left.total)
    .slice(0, limit);

  return {
    visitors: uniqueVisitors,
    activeUsersLast5Minutes,
    pageViews,
    bounceRate: percentage(bouncedVisitors, Math.max(uniqueVisitors, 1)),
    points,
    pages,
    routes,
    hostnames: toBreakdown([...hostnameMap.entries()], Math.max(uniqueVisitors, 1)).slice(0, limit),
    referrers: toTopList([...referrerMap.entries()]).slice(0, limit),
    utmParameters: toTopList([...utmMap.entries()]).slice(0, limit),
    countries: toBreakdown([...countryMap.entries()], Math.max(uniqueVisitors, 1)).slice(0, limit),
    devices: toBreakdown([...deviceMap.entries()], Math.max(uniqueVisitors, 1)).slice(0, limit),
    browsers: toBreakdown([...browserMap.entries()], Math.max(uniqueVisitors, 1)).slice(0, limit),
    operatingSystems: toBreakdown([...osMap.entries()], Math.max(uniqueVisitors, 1)).slice(0, limit),
    events,
    isSynthetic: false
  };
}

export class FileEventRepository implements EventRepository {
  private readonly store: EventFileStore;
  private cacheLoaded = false;
  private readonly events: AnalyticsEvent[] = [];
  private readonly eventIds = new Set<string>();
  private baselineCapturedAt: string | null | undefined;

  public constructor() {
    this.store = new EventFileStore();
  }

  public insertEvent(event: AnalyticsEvent): boolean {
    this.loadCache();
    if (this.eventIds.has(event.eventId)) {
      return false;
    }

    this.store.append(event);
    this.events.push(event);
    this.eventIds.add(event.eventId);
    return true;
  }

  public getOverview(range: TimeRange): DashboardOverview {
    this.loadCache();
    const inRange = this.getLiveEvents(range, this.getBaselineCapturedAt());

    const uniqueVisitors = new Set(inRange.map((event) => event.visitorId)).size;
    const totalEvents = inRange.length;
    const pageViews = inRange.filter((event) => event.eventName === "page_view").length;
    const downloadClicks = inRange.filter((event) => event.eventName === "download_click").length;
    const installs = inRange.filter((event) => isInstallEvent(event.eventName)).length;

    return {
      uniqueVisitors,
      totalEvents,
      pageViews,
      downloadClicks,
      installs,
      clickThroughRate: percentage(downloadClicks, pageViews),
      installRateFromClicks: percentage(installs, downloadClicks)
    };
  }

  public getTimeseries(range: TimeRange): DailyMetricPoint[] {
    this.loadCache();
    const inRange = this.getLiveEvents(range, this.getBaselineCapturedAt());
    const grouped = new Map<
      string,
      {
        pageViews: number;
        downloadClicks: number;
        installs: number;
        visitors: Set<string>;
      }
    >();

    for (const event of inRange) {
      const key = dayKey(event.occurredAt);
      const current = grouped.get(key) ?? {
        pageViews: 0,
        downloadClicks: 0,
        installs: 0,
        visitors: new Set<string>()
      };

      current.visitors.add(event.visitorId);
      if (event.eventName === "page_view") {
        current.pageViews += 1;
      }
      if (event.eventName === "download_click") {
        current.downloadClicks += 1;
      }
      if (isInstallEvent(event.eventName)) {
        current.installs += 1;
      }

      grouped.set(key, current);
    }

    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, values]) => {
        return {
          date,
          pageViews: values.pageViews,
          uniqueVisitors: values.visitors.size,
          downloadClicks: values.downloadClicks,
          installs: values.installs
        };
      });
  }

  public getFunnel(range: TimeRange): FunnelMetric[] {
    this.loadCache();
    const inRange = this.getLiveEvents(range, this.getBaselineCapturedAt());
    const visitVisitors = new Set(
      inRange.filter((event) => event.eventName === "page_view").map((event) => event.visitorId)
    );
    const clickVisitors = new Set(
      inRange
        .filter((event) => event.eventName === "download_click")
        .map((event) => event.visitorId)
    );
    const installVisitors = new Set(
      inRange.filter((event) => isInstallEvent(event.eventName)).map((event) => event.visitorId)
    );

    const visitCount = visitVisitors.size;
    const clickCount = clickVisitors.size;
    const installCount = installVisitors.size;

    return [
      {
        step: "visit",
        visitors: visitCount,
        conversionFromPreviousStep: 100
      },
      {
        step: "click",
        visitors: clickCount,
        conversionFromPreviousStep: percentage(clickCount, visitCount)
      },
      {
        step: "install",
        visitors: installCount,
        conversionFromPreviousStep: percentage(installCount, clickCount)
      }
    ];
  }

  public getDownloadAttribution(range: TimeRange, limit: number): DownloadAttributionMetric[] {
    this.loadCache();
    const inRange = this.getLiveEvents(range, this.getBaselineCapturedAt()).filter(
      (event) => event.eventName === "download_click"
    );
    const grouped = new Map<
      string,
      {
        path: string;
        channel: string;
        totalDownloads: number;
        visitors: Set<string>;
      }
    >();

    for (const event of inRange) {
      const pathValue = parsePathname(event.path);
      const channel = extractDownloadChannel(event.metadata);
      const key = `${pathValue}|${channel}`;

      const current = grouped.get(key) ?? {
        path: pathValue,
        channel,
        totalDownloads: 0,
        visitors: new Set<string>()
      };
      current.totalDownloads += 1;
      current.visitors.add(event.visitorId);
      grouped.set(key, current);
    }

    return [...grouped.entries()]
      .map(([, values]) => ({
        path: values.path,
        channel: values.channel,
        totalDownloads: values.totalDownloads,
        uniqueVisitors: values.visitors.size
      }))
      .sort((left, right) => {
        if (right.totalDownloads !== left.totalDownloads) {
          return right.totalDownloads - left.totalDownloads;
        }

        if (right.uniqueVisitors !== left.uniqueVisitors) {
          return right.uniqueVisitors - left.uniqueVisitors;
        }

        if (left.path !== right.path) {
          return left.path.localeCompare(right.path);
        }

        return left.channel.localeCompare(right.channel);
      })
      .slice(0, limit);
  }

  public getTopPages(range: TimeRange, limit: number): TopPageMetric[] {
    this.loadCache();
    const pageViews = this.getLiveEvents(range, this.getBaselineCapturedAt()).filter((event) => event.eventName === "page_view");

    const grouped = new Map<string, { views: number; visitors: Set<string> }>();
    for (const event of pageViews) {
      const pathValue = parsePathname(event.path);
      const current = grouped.get(pathValue) ?? { views: 0, visitors: new Set<string>() };
      current.views += 1;
      current.visitors.add(event.visitorId);
      grouped.set(pathValue, current);
    }

    return [...grouped.entries()]
      .map(([pathValue, values]) => ({
        path: pathValue,
        views: values.views,
        uniqueVisitors: values.visitors.size
      }))
      .sort((left, right) => right.views - left.views)
      .slice(0, limit);
  }

  public getExplorerMetrics(range: TimeRange, limit: number): ExplorerMetrics {
    this.loadCache();
    const baseline = readBaseline(range, limit);
    const cutoff = baseline?.capturedAt ?? null;
    const activeUsersLast5Minutes = this.getActiveUsersLastMinutes(5, cutoff);
    const inRange = this.getLiveEvents(range, cutoff);
    const live = buildLiveExplorer(inRange, range, limit, activeUsersLast5Minutes);

    if (!baseline) {
      return live;
    }

    const visitors = baseline.metrics.visitors + live.visitors;
    const pageViews = baseline.metrics.pageViews + live.pageViews;
    const bounceRate =
      visitors > 0
        ? Number(
            (
              (baseline.metrics.bounceRate * baseline.metrics.visitors + live.bounceRate * live.visitors) /
              visitors
            ).toFixed(2)
          )
        : 0;

    return {
      visitors,
      activeUsersLast5Minutes,
      pageViews,
      bounceRate,
      points: mergePoints(range, baseline.metrics.points, live.points),
      pages: mergeTopPages(baseline.metrics.pages, live.pages, limit),
      routes: mergeTopPages(baseline.metrics.routes, live.routes, limit),
      hostnames: mergeBreakdown(baseline.metrics.hostnames, live.hostnames, visitors, limit),
      referrers: mergeTopList(baseline.metrics.referrers, live.referrers, limit),
      utmParameters: mergeTopList(baseline.metrics.utmParameters, live.utmParameters, limit),
      countries: mergeBreakdown(baseline.metrics.countries, live.countries, visitors, limit),
      devices: mergeBreakdown(baseline.metrics.devices, live.devices, visitors, limit),
      browsers: mergeBreakdown(baseline.metrics.browsers, live.browsers, visitors, limit),
      operatingSystems: mergeBreakdown(
        baseline.metrics.operatingSystems,
        live.operatingSystems,
        visitors,
        limit
      ),
      events: mergeEvents(baseline.metrics.events, live.events, limit),
      isSynthetic: false
    };
  }

  private getLiveEvents(range: TimeRange, capturedAt: string | null = null): AnalyticsEvent[] {
    return this.events.filter((event) => {
      if (!isHumanEvent(event)) {
        return false;
      }

      if (!eventInRange(event, range)) {
        return false;
      }

      if (capturedAt && event.occurredAt <= capturedAt) {
        return false;
      }

      return true;
    });
  }

  private getActiveUsersLastMinutes(minutes: number, capturedAt: string | null = null): number {
    const threshold = Date.now() - minutes * 60 * 1000;
    const visitors = new Set<string>();

    for (const event of this.events) {
      if (!isHumanEvent(event)) {
        continue;
      }

      if (capturedAt && event.occurredAt <= capturedAt) {
        continue;
      }

      const timestamp = Date.parse(event.occurredAt);
      if (Number.isNaN(timestamp) || timestamp < threshold) {
        continue;
      }

      visitors.add(event.visitorId);
    }

    return visitors.size;
  }

  private getBaselineCapturedAt(): string | null {
    if (this.baselineCapturedAt !== undefined) {
      return this.baselineCapturedAt;
    }

    const parsed = readBaselineFile();
    this.baselineCapturedAt = parsed.capturedAt ?? null;

    return this.baselineCapturedAt;
  }

  private loadCache(): void {
    if (this.cacheLoaded) {
      return;
    }

    const events = this.store.readAll();
    for (const event of events) {
      if (!this.eventIds.has(event.eventId)) {
        this.eventIds.add(event.eventId);
        this.events.push({
          ...event,
          isBot: event.isBot ?? event.deviceType === "bot",
          metadata: event.metadata ?? {}
        });
      }
    }
    this.cacheLoaded = true;
  }
}
