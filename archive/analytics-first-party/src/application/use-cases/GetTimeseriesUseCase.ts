import type { EventRepository } from "@/domain/events/EventRepository";
import type { DailyMetricPoint, TimeRange } from "@/domain/events/types";
import { enumerateUtcDays } from "@/shared/timeRange";

export class GetTimeseriesUseCase {
  public constructor(private readonly repository: EventRepository) {}

  public execute(range: TimeRange): DailyMetricPoint[] {
    const points = this.repository.getTimeseries(range);
    const byDate = new Map(points.map((point) => [point.date, point]));

    return enumerateUtcDays(range).map((date) => {
      return (
        byDate.get(date) ?? {
          date,
          pageViews: 0,
          uniqueVisitors: 0,
          downloadClicks: 0,
          installs: 0
        }
      );
    });
  }
}

