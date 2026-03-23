import { container } from "@/infrastructure/container";
import { errorJson, okJson, optionsResponse } from "@/interface/http/http";
import {
  deriveCountry,
  deriveBotSignal,
  deriveDeviceTypeFromHeaders,
  deriveSessionId,
  deriveUserAgent,
  deriveVisitorId,
  extractClientIp,
  validateWriteKey
} from "@/interface/http/requestMeta";
import { consumeRateLimit } from "@/security/rateLimit";
import { trackEventSchema } from "@/interface/http/validators";

const HUMAN_EVENT_RATE_LIMIT = { limit: 800, windowMs: 5 * 60 * 1000 };
const BOT_EVENT_RATE_LIMIT = { limit: 120, windowMs: 5 * 60 * 1000 };

export async function OPTIONS(request: Request) {
  return optionsResponse(request.headers.get("origin"));
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get("origin");

  if (!validateWriteKey(request.headers)) {
    return errorJson(401, "Invalid analytics write key.", requestOrigin);
  }

  const body = await request.json().catch(() => null);
  const parsed = trackEventSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, "Invalid event payload.", requestOrigin, parsed.error.flatten());
  }

  const input = parsed.data;
  const botSignal = deriveBotSignal(request.headers, input.metadata);
  const ip = extractClientIp(request.headers) ?? "0.0.0.0";
  const limiter = consumeRateLimit(
    `events:${ip}:${botSignal ? "bot" : "human"}`,
    botSignal ? BOT_EVENT_RATE_LIMIT : HUMAN_EVENT_RATE_LIMIT
  );

  if (!limiter.allowed) {
    return errorJson(429, "Too many events from this source.", requestOrigin);
  }

  const result = container.trackEventUseCase.execute({
    eventId: input.eventId,
    eventName: input.eventName,
    occurredAt: input.occurredAt,
    visitorId: deriveVisitorId(request.headers, input.visitorId),
    sessionId: deriveSessionId(input.sessionId),
    path: input.path ?? null,
    referrer: input.referrer ?? request.headers.get("referer"),
    country: deriveCountry(request.headers),
    userAgent: deriveUserAgent(request.headers),
    deviceType: deriveDeviceTypeFromHeaders(request.headers, input.metadata),
    isBot: botSignal,
    metadata: input.metadata ?? {}
  });

  return okJson(
    {
      accepted: result.accepted,
      eventId: result.eventId
    },
    requestOrigin
  );
}
