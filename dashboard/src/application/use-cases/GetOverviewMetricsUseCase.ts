import type { EventRepository } from "@/domain/events/EventRepository";
import type { DashboardOverview, TimeRange } from "@/domain/events/types";

export class GetOverviewMetricsUseCase {
  public constructor(private readonly repository: EventRepository) {}

  public execute(range: TimeRange): DashboardOverview {
    return this.repository.getOverview(range);
  }
}

