import type { Job } from 'bullmq';
import { db } from '../lib/db.js';
import { matchListings } from '../lib/grok.js';
import { getCachedMatches, setCachedMatches } from '../lib/matching-cache.js';
import { getQueue, QUEUE_NAMES } from '../lib/queue.js';
import { NotificationType, NotificationChannel } from '@prisma/client';
import type { NotificationJobData } from './notification.worker.js';

export interface MatchingJobData {
  filterId: string;
  userId: string;
  tier: 'FREE' | 'PREMIUM';
}

const MAX_API_CALLS_PER_USER_PER_DAY = 50;
const TOP_MATCHES = 10;
const DEFAULT_MIN_MATCH_SCORE = 80;

async function enqueueMatchNotifications(
  userId: string,
  filterId: string,
  top10: Array<{ listingId: string; score: number; aiComment?: string }>,
  _allResults: typeof top10,
): Promise<void> {
  const prefs = await db.userPreference.findUnique({ where: { userId } });
  const minScore = prefs?.minMatchPercent ?? DEFAULT_MIN_MATCH_SCORE;

  const notifiableMatches = top10.filter((m) => m.score >= minScore);
  if (notifiableMatches.length === 0) return;

  const queue = getQueue(QUEUE_NAMES.NOTIFICATIONS);
  const topMatch = notifiableMatches[0];

  const property = await db.property.findUnique({
    where: { id: topMatch.listingId },
    select: { title: true, city: true, price: true },
  });

  if (!property) return;

  const matchRecord = await db.match.findFirst({
    where: { filterId, propertyId: topMatch.listingId },
    select: { id: true },
  });

  const job: NotificationJobData = {
    userId,
    type: NotificationType.NEW_MATCH,
    title: `${topMatch.score}% match found`,
    body: `${property.title} — ${property.city} | ${property.price.toLocaleString()} EUR`,
    data: {
      matchId: matchRecord?.id ?? '',
      propertyId: topMatch.listingId,
      matchPercent: topMatch.score,
      totalMatches: notifiableMatches.length,
    },
    channel: NotificationChannel.PUSH,
  };

  await queue.add('send-notification', job, {
    removeOnComplete: { count: 10 },
    removeOnFail: { count: 5 },
  });

  console.log(`[MatchingWorker] Enqueued notification for user ${userId}, top match score=${topMatch.score}`);
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const count = await db.apiUsage.count({
    where: {
      userId,
      endpoint: 'grok/matching',
      createdAt: { gte: since },
      cacheHit: false,
    },
  });

  return count < MAX_API_CALLS_PER_USER_PER_DAY;
}

async function fetchCandidateListings(filterId: string) {
  const filter = await db.filter.findUnique({ where: { id: filterId } });
  if (!filter) throw new Error(`Filter ${filterId} not found`);

  const where: Record<string, unknown> = { isActive: true };

  if (filter.city) where['city'] = { equals: filter.city, mode: 'insensitive' };
  if (filter.propertyType) where['propertyType'] = filter.propertyType;

  const priceFilter: Record<string, number> = {};
  if (filter.priceMin) priceFilter['gte'] = filter.priceMin;
  if (filter.priceMax) priceFilter['lte'] = filter.priceMax;
  if (Object.keys(priceFilter).length) where['price'] = priceFilter;

  const areaFilter: Record<string, number> = {};
  if (filter.areaMin) areaFilter['gte'] = filter.areaMin;
  if (filter.areaMax) areaFilter['lte'] = filter.areaMax;
  if (Object.keys(areaFilter).length) where['area'] = areaFilter;

  return { filter, listings: await db.property.findMany({ where, take: 200 }) };
}

export async function processMatchingJob(job: Job<MatchingJobData>): Promise<void> {
  const { filterId, userId, tier } = job.data;

  console.log(`[MatchingWorker] Processing job ${job.id} for filter ${filterId}`);

  const { filter, listings } = await fetchCandidateListings(filterId);

  if (listings.length === 0) {
    console.log(`[MatchingWorker] No candidate listings for filter ${filterId}`);
    return;
  }

  const listingIds = listings.map((l) => l.id);
  const cached = await getCachedMatches(filterId, listingIds);

  let matchResults;
  let cacheHit = false;

  if (cached) {
    matchResults = cached;
    cacheHit = true;
    console.log(`[MatchingWorker] Cache hit for filter ${filterId}`);
  } else {
    const withinLimit = await checkRateLimit(userId);
    if (!withinLimit) {
      console.warn(`[MatchingWorker] Rate limit reached for user ${userId}`);
      return;
    }

    const { matches, usage } = await matchListings(filter, listings);
    matchResults = matches;

    await db.apiUsage.create({
      data: {
        userId,
        endpoint: 'grok/matching',
        tokensInput: usage.tokensInput,
        tokensOutput: usage.tokensOutput,
        costUsd: usage.costUsd,
        durationMs: usage.durationMs,
        cacheHit: false,
      },
    });

    await setCachedMatches(filterId, listingIds, matchResults);
  }

  if (cacheHit) {
    await db.apiUsage.create({
      data: {
        userId,
        endpoint: 'grok/matching',
        tokensInput: 0,
        tokensOutput: 0,
        costUsd: 0,
        durationMs: 0,
        cacheHit: true,
      },
    });
  }

  const top10 = matchResults.slice(0, TOP_MATCHES);

  for (let i = 0; i < top10.length; i++) {
    const match = top10[i];
    await db.match.upsert({
      where: { filterId_propertyId: { filterId, propertyId: match.listingId } },
      create: {
        userId,
        filterId,
        propertyId: match.listingId,
        matchPercent: match.score,
        aiComment: match.aiComment,
        rank: i + 1,
        isNew: true,
        isSeen: false,
      },
      update: {
        matchPercent: match.score,
        aiComment: match.aiComment,
        rank: i + 1,
        isNew: true,
      },
    });
  }

  console.log(`[MatchingWorker] Saved ${top10.length} matches for filter ${filterId}`);

  await enqueueMatchNotifications(userId, filterId, top10, matchResults);
}
