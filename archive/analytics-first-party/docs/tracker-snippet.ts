/**
 * Use this snippet in your landing project.
 * Change ANALYTICS_ENDPOINT and WRITE_KEY to your production values.
 */
const ANALYTICS_ENDPOINT = "https://SEU_DOMINIO_DASHBOARD/api/v1/events";
const WRITE_KEY = "change-me-in-production";

function getOrCreateStorageId(key: string, storage: Storage): string {
  const existing = storage.getItem(key);
  if (existing) {
    return existing;
  }

  const value = crypto.randomUUID();
  storage.setItem(key, value);
  return value;
}

export async function trackEvent(
  eventName: string,
  options: {
    path?: string;
    metadata?: Record<string, unknown>;
  } = {}
) {
  const visitorId = getOrCreateStorageId("afp_visitor_id", window.localStorage);
  const sessionId = getOrCreateStorageId("afp_session_id", window.sessionStorage);

  await fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Analytics-Key": WRITE_KEY
    },
    body: JSON.stringify({
      eventName,
      visitorId,
      sessionId,
      path: options.path ?? window.location.pathname,
      metadata: options.metadata ?? {}
    })
  });
}

export function trackPageView() {
  return trackEvent("page_view");
}

export function trackDownloadClick(channel: string) {
  return trackEvent("download_click", { metadata: { channel } });
}

export function trackInstall(platform: "pwa" | "desktop") {
  return trackEvent("first_open", { metadata: { platform } });
}

