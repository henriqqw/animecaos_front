import { randomUUID } from "node:crypto";

import type { EventRepository } from "@/domain/events/EventRepository";
import type { AnalyticsEvent, DeviceType } from "@/domain/events/types";

export interface TrackEventInput {
  eventId?: string;
  eventName: string;
  occurredAt?: string;
  visitorId: string;
  sessionId?: string | null;
  path?: string | null;
  referrer?: string | null;
  country?: string | null;
  userAgent?: string | null;
  deviceType?: DeviceType;
  isBot?: boolean;
  metadata?: Record<string, unknown>;
}

export interface TrackEventResult {
  accepted: boolean;
  eventId: string;
}

export class TrackEventUseCase {
  public constructor(private readonly repository: EventRepository) {}

  public execute(input: TrackEventInput): TrackEventResult {
    const event: AnalyticsEvent = {
      eventId: input.eventId ?? randomUUID(),
      eventName: input.eventName,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      visitorId: input.visitorId,
      sessionId: input.sessionId ?? null,
      path: input.path ?? null,
      referrer: input.referrer ?? null,
      country: input.country ?? null,
      userAgent: input.userAgent ?? null,
      deviceType: input.deviceType ?? "unknown",
      isBot: input.isBot ?? false,
      metadata: input.metadata ?? {}
    };

    const accepted = this.repository.insertEvent(event);
    return {
      accepted,
      eventId: event.eventId
    };
  }
}
