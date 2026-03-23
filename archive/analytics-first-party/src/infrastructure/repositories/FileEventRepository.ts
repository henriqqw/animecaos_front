import type { EventRepository } from "@/domain/events/EventRepository";
import type {
  AnalyticsEvent,
  DailyMetricPoint,
  DashboardOverview,
  FunnelMetric,
  TimeRange,
  TopPageMetric
} from "@/domain/events/types";
import { EventFileStore } from "@/infrastructure/db/fileStore";

function percentage(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(2));
}

function eventInRange(event: AnalyticsEvent, range: TimeRange): boolean {
  return event.occurredAt >= range.from && event.occurredAt <= range.to;
}

function dayKey(value: string): string {
  return value.slice(0, 10);
}

export class FileEventRepository implements EventRepository {
  private readonly store: EventFileStore;
  private cacheLoaded = false;
  private readonly events: AnalyticsEvent[] = [];
  private readonly eventIds = new Set<string>();

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
    const inRange = this.events.filter((event) => eventInRange(event, range));

    const uniqueVisitors = new Set(inRange.map((event) => event.visitorId)).size;
    const totalEvents = inRange.length;
    const pageViews = inRange.filter((event) => event.eventName === "page_view").length;
    const downloadClicks = inRange.filter((event) => event.eventName === "download_click").length;
    const installs = inRange.filter(
      (event) => event.eventName === "pwa_installed" || event.eventName === "first_open"
    ).length;

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
    const inRange = this.events.filter((event) => eventInRange(event, range));
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
      if (event.eventName === "pwa_installed" || event.eventName === "first_open") {
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
    const inRange = this.events.filter((event) => eventInRange(event, range));
    const visitVisitors = new Set(
      inRange.filter((event) => event.eventName === "page_view").map((event) => event.visitorId)
    );
    const clickVisitors = new Set(
      inRange
        .filter((event) => event.eventName === "download_click")
        .map((event) => event.visitorId)
    );
    const installVisitors = new Set(
      inRange
        .filter((event) => event.eventName === "pwa_installed" || event.eventName === "first_open")
        .map((event) => event.visitorId)
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

  public getTopPages(range: TimeRange, limit: number): TopPageMetric[] {
    this.loadCache();
    const pageViews = this.events.filter(
      (event) => event.eventName === "page_view" && eventInRange(event, range)
    );

    const grouped = new Map<string, { views: number; visitors: Set<string> }>();
    for (const event of pageViews) {
      const path = event.path ?? "/";
      const current = grouped.get(path) ?? { views: 0, visitors: new Set<string>() };
      current.views += 1;
      current.visitors.add(event.visitorId);
      grouped.set(path, current);
    }

    return [...grouped.entries()]
      .map(([path, values]) => ({
        path,
        views: values.views,
        uniqueVisitors: values.visitors.size
      }))
      .sort((left, right) => right.views - left.views)
      .slice(0, limit);
  }

  private loadCache(): void {
    if (this.cacheLoaded) {
      return;
    }

    const events = this.store.readAll();
    for (const event of events) {
      if (!this.eventIds.has(event.eventId)) {
        this.eventIds.add(event.eventId);
        this.events.push(event);
      }
    }
    this.cacheLoaded = true;
  }
}

