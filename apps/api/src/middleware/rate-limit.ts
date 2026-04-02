import type { Context, Next } from 'hono';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10);

function getClientKey(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? 'unknown';
}

function getEntry(key: string): RateLimitEntry {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const entry: RateLimitEntry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
    return entry;
  }

  return existing;
}

export async function rateLimitMiddleware(c: Context, next: Next) {
  const key = getClientKey(c);
  const entry = getEntry(key);

  entry.count += 1;

  c.header('X-RateLimit-Limit', String(MAX_REQUESTS));
  c.header('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - entry.count)));
  c.header('X-RateLimit-Reset', String(entry.resetAt));

  if (entry.count > MAX_REQUESTS) {
    return c.json(
      { data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests' }, meta: null },
      429,
    );
  }

  await next();
}
