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
  remaining: number;
  retryAfterMs: number;
  resetAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __dashboardRateLimitStore: Map<string, RateLimitState> | undefined;
}

function getStore(): Map<string, RateLimitState> {
  if (!global.__dashboardRateLimitStore) {
    global.__dashboardRateLimitStore = new Map<string, RateLimitState>();
  }

  return global.__dashboardRateLimitStore;
}

function cleanupExpired(store: Map<string, RateLimitState>, now: number): void {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function consumeRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  cleanupExpired(store, now);

  const current = store.get(key);
  if (!current) {
    const state: RateLimitState = {
      count: 1,
      resetAt: now + options.windowMs
    };
    store.set(key, state);
    return {
      allowed: true,
      remaining: Math.max(options.limit - state.count, 0),
      retryAfterMs: 0,
      resetAt: state.resetAt
    };
  }

  current.count += 1;
  store.set(key, current);

  if (current.count > options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(current.resetAt - now, 0),
      resetAt: current.resetAt
    };
  }

  return {
    allowed: true,
    remaining: Math.max(options.limit - current.count, 0),
    retryAfterMs: 0,
    resetAt: current.resetAt
  };
}

export function resetRateLimit(key: string): void {
  getStore().delete(key);
}
