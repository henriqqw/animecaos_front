interface RateLimitState {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

declare global {
  var __frontpageRateLimitStore: Map<string, RateLimitState> | undefined;
}

function getStore(): Map<string, RateLimitState> {
  if (!global.__frontpageRateLimitStore) {
    global.__frontpageRateLimitStore = new Map<string, RateLimitState>();
  }

  return global.__frontpageRateLimitStore;
}

function cleanup(store: Map<string, RateLimitState>, now: number): void {
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function consumeRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  cleanup(store, now);

  const current = store.get(key);
  if (!current) {
    store.set(key, {
      count: 1,
      resetAt: now + options.windowMs
    });
    return {
      allowed: true,
      retryAfterMs: 0
    };
  }

  current.count += 1;
  store.set(key, current);

  if (current.count > options.limit) {
    return {
      allowed: false,
      retryAfterMs: Math.max(current.resetAt - now, 0)
    };
  }

  return {
    allowed: true,
    retryAfterMs: 0
  };
}
