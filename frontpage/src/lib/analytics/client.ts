"use client";

type TrackMetadata = Record<string, unknown>;

interface TrackEventInput {
  eventName: string;
  path?: string;
  metadata?: TrackMetadata;
}

const VISITOR_ID_KEY = "afp_visitor_id";
const SESSION_ID_KEY = "afp_session_id";
const FIRST_OPEN_SENT_KEY = "afp_first_open_sent";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function safeStorageGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // ignore storage errors (private mode/quota/etc.)
  }
}

function createRandomId(): string {
  if (hasWindow() && typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreateId(storage: Storage, key: string): string {
  const existing = safeStorageGet(storage, key);
  if (existing) {
    return existing;
  }

  const generated = createRandomId();
  safeStorageSet(storage, key, generated);
  return generated;
}

function getTrackingContext(): { visitorId: string; sessionId: string } {
  const visitorId = getOrCreateId(window.localStorage, VISITOR_ID_KEY);
  const sessionId = getOrCreateId(window.sessionStorage, SESSION_ID_KEY);

  return { visitorId, sessionId };
}

function sendBeaconJson(url: string, payload: object): boolean {
  if (!hasWindow() || typeof navigator.sendBeacon !== "function") {
    return false;
  }

  try {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    return navigator.sendBeacon(url, blob);
  } catch {
    return false;
  }
}

export async function trackEvent(input: TrackEventInput): Promise<void> {
  if (!hasWindow()) {
    return;
  }

  const { visitorId, sessionId } = getTrackingContext();
  const payload = {
    eventName: input.eventName,
    visitorId,
    sessionId,
    path: input.path ?? `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || undefined,
    metadata: input.metadata ?? {}
  };

  const usedBeacon = sendBeaconJson("/api/track", payload);
  if (usedBeacon) {
    return;
  }

  await fetch("/api/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    keepalive: true,
    cache: "no-store"
  }).catch(() => {
    // best effort tracking: no throw
  });
}

export async function trackPageView(path: string): Promise<void> {
  await trackEvent({
    eventName: "page_view",
    path
  });
}

export async function trackDownloadClick(channel: string, href: string): Promise<void> {
  await trackEvent({
    eventName: "download_click",
    metadata: {
      channel,
      href
    }
  });
}

export async function trackFirstOpen(): Promise<void> {
  if (!hasWindow()) {
    return;
  }

  const alreadySent = safeStorageGet(window.localStorage, FIRST_OPEN_SENT_KEY);
  if (alreadySent) {
    return;
  }

  await trackEvent({
    eventName: "first_open",
    metadata: {
      source: "landing"
    }
  });
  safeStorageSet(window.localStorage, FIRST_OPEN_SENT_KEY, new Date().toISOString());
}

