function firstNonEmpty(values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (value && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function normalizeOrigin(input: string): string | null {
  try {
    return new URL(input).origin.toLowerCase();
  } catch {
    return null;
  }
}

function configuredAllowedOrigins(): Set<string> {
  const configured = process.env.DASHBOARD_AUTH_ALLOWED_ORIGINS;
  if (!configured || !configured.trim()) {
    return new Set<string>();
  }

  const normalized = configured
    .split(",")
    .map((item) => item.trim())
    .map((item) => normalizeOrigin(item))
    .filter((item): item is string => Boolean(item));

  return new Set<string>(normalized);
}

export function getRequestIp(headers: Headers): string {
  const fromForwardedFor = headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (fromForwardedFor) {
    return fromForwardedFor;
  }

  return (
    firstNonEmpty([
      headers.get("x-real-ip"),
      headers.get("cf-connecting-ip"),
      headers.get("x-vercel-forwarded-for")
    ]) ?? "0.0.0.0"
  );
}

export function isSameOriginRequest(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  if (!originHeader) {
    return true;
  }

  const origin = normalizeOrigin(originHeader);
  if (!origin) {
    return false;
  }

  const allowlist = configuredAllowedOrigins();
  if (allowlist.has(origin)) {
    return true;
  }

  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  if (!host) {
    return false;
  }

  const protocol =
    request.headers.get("x-forwarded-proto") ??
    new URL(request.url).protocol.replace(":", "");
  const expectedOrigin = normalizeOrigin(`${protocol}://${host}`);
  return expectedOrigin === origin;
}
