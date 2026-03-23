import type { EventRepository } from "@/domain/events/EventRepository";
import type { TimeRange, TopPageMetric } from "@/domain/events/types";

export class GetTopPagesUseCase {
  public constructor(private readonly repository: EventRepository) {}

  public execute(range: TimeRange, limit: number): TopPageMetric[] {
    return this.repository.getTopPages(range, limit);
  }
}

