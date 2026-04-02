import { createHash } from 'crypto';
import { getRedis } from './redis.js';
import type { GrokMatchResult } from './grok.js';

const CACHE_TTL_SECONDS = 15 * 60; // 15 minutes
const CACHE_PREFIX = 'matching:v1:';

function buildCacheKey(filterId: string, listingIds: string[]): string {
  const sortedIds = [...listingIds].sort().join(',');
  const hash = createHash('sha256').update(`${filterId}:${sortedIds}`).digest('hex').substring(0, 16);
  return `${CACHE_PREFIX}${hash}`;
}

export async function getCachedMatches(
  filterId: string,
  listingIds: string[],
): Promise<GrokMatchResult[] | null> {
  const key = buildCacheKey(filterId, listingIds);
  const redis = getRedis();

  const cached = await redis.get(key);
  if (!cached) return null;

  try {
    return JSON.parse(cached) as GrokMatchResult[];
  } catch {
    return null;
  }
}

export async function setCachedMatches(
  filterId: string,
  listingIds: string[],
  matches: GrokMatchResult[],
): Promise<void> {
  const key = buildCacheKey(filterId, listingIds);
  const redis = getRedis();

  await redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(matches));
}

export async function invalidateCachedMatches(filterId: string): Promise<void> {
  const redis = getRedis();
  const pattern = `${CACHE_PREFIX}*`;
  const keys = await redis.keys(pattern);

  if (keys.length === 0) return;

  const pipeline = redis.pipeline();
  keys.forEach((key) => pipeline.del(key));
  await pipeline.exec();
}
