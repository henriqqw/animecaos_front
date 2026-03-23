import type { EventRepository } from "@/domain/events/EventRepository";
import type { FunnelMetric, TimeRange } from "@/domain/events/types";

export class GetFunnelMetricsUseCase {
  public constructor(private readonly repository: EventRepository) {}

  public execute(range: TimeRange): FunnelMetric[] {
    return this.repository.getFunnel(range);
  }
}

