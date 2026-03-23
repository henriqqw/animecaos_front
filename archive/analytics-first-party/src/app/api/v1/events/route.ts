import { container } from "@/infrastructure/container";
import { errorJson, okJson, optionsResponse } from "@/interface/http/http";
import {
  deriveCountry,
  deriveDeviceTypeFromHeaders,
  deriveSessionId,
  deriveUserAgent,
  deriveVisitorId,
  validateWriteKey
} from "@/interface/http/requestMeta";
import { trackEventSchema } from "@/interface/http/validators";

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
    deviceType: deriveDeviceTypeFromHeaders(request.headers),
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

