import { z } from "zod";

const eventNamePattern = /^[a-z0-9_:.\\/-]{2,64}$/i;

export const trackEventSchema = z.object({
  eventId: z.string().uuid().optional(),
  eventName: z.string().regex(eventNamePattern),
  occurredAt: z.string().datetime().optional(),
  visitorId: z.string().min(8).max(128).optional(),
  sessionId: z.string().min(8).max(128).optional(),
  path: z.string().min(1).max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  metadata: z.record(z.unknown()).optional()
});

