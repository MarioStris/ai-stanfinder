import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { AppError } from '../../middleware/error-handler.js';
import { requireAuth } from '../../middleware/auth.js';
import { getQueue, QUEUE_NAMES } from '../../lib/queue.js';
import type { MatchingJobData } from '../../workers/matching.worker.js';

const matchingRoutes = new Hono();

matchingRoutes.use('*', requireAuth);

type AuthUser = { dbId: string; tier: 'FREE' | 'PREMIUM' };

matchingRoutes.get('/filters/:filterId/matches', async (c) => {
  const user = c.get('user' as never) as AuthUser;
  const filterId = c.req.param('filterId');

  const filter = await db.filter.findUnique({ where: { id: filterId } });
  if (!filter) throw new AppError(404, 'NOT_FOUND', 'Filter not found');
  if (filter.userId !== user.dbId) throw new AppError(403, 'FORBIDDEN', 'Access denied');

  const matches = await db.match.findMany({
    where: { filterId },
    orderBy: { rank: 'asc' },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          city: true,
          neighborhood: true,
          price: true,
          area: true,
          pricePerM2: true,
          rooms: true,
          propertyType: true,
          condition: true,
          isNewBuild: true,
          hasParking: true,
          hasBalcony: true,
          hasElevator: true,
          images: true,
          sourceUrl: true,
          source: true,
        },
      },
    },
  });

  return c.json({
    data: matches,
    error: null,
    meta: {
      total: matches.length,
      newCount: matches.filter((m) => m.isNew).length,
    },
  });
});

matchingRoutes.post('/filters/:filterId/matches/refresh', async (c) => {
  const user = c.get('user' as never) as AuthUser;
  const filterId = c.req.param('filterId');

  const filter = await db.filter.findUnique({ where: { id: filterId } });
  if (!filter) throw new AppError(404, 'NOT_FOUND', 'Filter not found');
  if (filter.userId !== user.dbId) throw new AppError(403, 'FORBIDDEN', 'Access denied');
  if (!filter.isActive) throw new AppError(400, 'FILTER_INACTIVE', 'Filter is not active');

  const queue = getQueue(QUEUE_NAMES.MATCHING);
  const job = await queue.add(
    'run-matching',
    { filterId, userId: user.dbId, tier: user.tier } satisfies MatchingJobData,
    {
      removeOnComplete: { count: 5 },
      removeOnFail: { count: 10 },
    },
  );

  return c.json({
    data: { jobId: job.id, status: 'queued' },
    error: null,
    meta: null,
  }, 202);
});

const ReadMatchSchema = z.object({});

matchingRoutes.patch('/matches/:matchId/read', zValidator('json', ReadMatchSchema), async (c) => {
  const user = c.get('user' as never) as AuthUser;
  const matchId = c.req.param('matchId');

  const match = await db.match.findUnique({ where: { id: matchId } });
  if (!match) throw new AppError(404, 'NOT_FOUND', 'Match not found');
  if (match.userId !== user.dbId) throw new AppError(403, 'FORBIDDEN', 'Access denied');

  const updated = await db.match.update({
    where: { id: matchId },
    data: { isNew: false, isSeen: true },
  });

  return c.json({ data: updated, error: null, meta: null });
});

export default matchingRoutes;
