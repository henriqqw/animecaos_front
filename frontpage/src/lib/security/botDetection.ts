const HIGH_CONFIDENCE_BOT_UA_REGEX =
  /bot|crawler|spider|slurp|bingpreview|headless|phantomjs|selenium|playwright|puppeteer|facebookexternalhit|discordbot|telegrambot|linkedinbot|python-requests|curl|wget|postmanruntime|insomnia|axios|go-http-client|okhttp|apache-httpclient|libwww-perl|java\//i;

function hasHeadlessClientHints(headers: Headers): boolean {
  const secChUa = headers.get("sec-ch-ua")?.toLowerCase() ?? "";
  if (secChUa.includes("headless")) {
    return true;
  }

  return Boolean(headers.get("x-playwright") || headers.get("x-puppeteer"));
}

function hasBrowserNavigationHeaders(headers: Headers): boolean {
  return Boolean(headers.get("sec-fetch-mode") && headers.get("sec-fetch-site"));
}

export function isLikelyBotRequest(headers: Headers): boolean {
  const userAgent = headers.get("user-agent");
  let score = 0;

  if (!userAgent) {
    score += 3;
  }

  if (userAgent && HIGH_CONFIDENCE_BOT_UA_REGEX.test(userAgent)) {
    score += 5;
  }

  if (hasHeadlessClientHints(headers)) {
    score += 4;
  }

  if (!hasBrowserNavigationHeaders(headers) && !headers.get("accept-language")) {
    score += 2;
  }

  return score >= 5;
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-vercel-forwarded-for") ??
    "0.0.0.0"
  );
}
