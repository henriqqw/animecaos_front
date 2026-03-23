import type { EventRepository } from "@/domain/events/EventRepository";
import type { DownloadAttributionMetric, TimeRange } from "@/domain/events/types";

export class GetDownloadAttributionMetricsUseCase {
  public constructor(private readonly repository: EventRepository) {}

  public execute(range: TimeRange, limit: number): DownloadAttributionMetric[] {
    return this.repository.getDownloadAttribution(range, limit);
  }
}
