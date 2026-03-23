import type { EventRepository } from "@/domain/events/EventRepository";
import type { ExplorerMetrics, TimeRange } from "@/domain/events/types";

export class GetExplorerMetricsUseCase {
  public constructor(private readonly repository: EventRepository) {}

  public execute(range: TimeRange, limit: number): ExplorerMetrics {
    return this.repository.getExplorerMetrics(range, limit);
  }
}
