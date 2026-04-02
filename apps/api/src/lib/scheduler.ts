import { getQueue, QUEUE_NAMES } from './queue.js';
import { db } from './db.js';
import type { MatchingJobData } from '../workers/matching.worker.js';

const FREE_REPEAT_MS = 12 * 60 * 60 * 1000; // 12 hours
const PREMIUM_REPEAT_MS = 15 * 60 * 1000;   // 15 minutes

function getRepeatInterval(tier: 'FREE' | 'PREMIUM'): number {
  return tier === 'PREMIUM' ? PREMIUM_REPEAT_MS : FREE_REPEAT_MS;
}

function buildJobId(filterId: string): string {
  return `matching:filter:${filterId}`;
}

export async function scheduleUserMatching(
  userId: string,
  filterId: string,
  tier: 'FREE' | 'PREMIUM',
): Promise<void> {
  const queue = getQueue(QUEUE_NAMES.MATCHING);
  const jobId = buildJobId(filterId);
  const every = getRepeatInterval(tier);

  await queue.add(
    'run-matching',
    { filterId, userId, tier } satisfies MatchingJobData,
    {
      jobId,
      repeat: { every },
      removeOnComplete: { count: 5 },
      removeOnFail: { count: 10 },
    },
  );

  console.log(`[Scheduler] Scheduled matching for filter ${filterId} every ${every / 60000} min`);
}

export async function removeUserSchedule(filterId: string): Promise<void> {
  const queue = getQueue(QUEUE_NAMES.MATCHING);
  const jobId = buildJobId(filterId);

  const repeatableJobs = await queue.getRepeatableJobs();
  const job = repeatableJobs.find((j) => j.id === jobId || j.key.includes(filterId));

  if (job) {
    await queue.removeRepeatableByKey(job.key);
    console.log(`[Scheduler] Removed schedule for filter ${filterId}`);
  }
}

export async function initScheduler(): Promise<void> {
  const activeFilters = await db.filter.findMany({
    where: { isActive: true },
    include: { user: { include: { subscription: true } } },
  });

  if (activeFilters.length === 0) {
    console.log('[Scheduler] No active filters to schedule');
    return;
  }

  const schedulePromises = activeFilters.map((filter) => {
    const tier = (filter.user.subscription?.tier ?? 'FREE') as 'FREE' | 'PREMIUM';
    return scheduleUserMatching(filter.userId, filter.id, tier);
  });

  await Promise.all(schedulePromises);
  console.log(`[Scheduler] Initialized ${activeFilters.length} filter schedules`);
}
