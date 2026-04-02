import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { requireAuth } from '../../middleware/auth.js';

const notificationRoutes = new Hono();

const registerTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']),
});

const notificationSettingsSchema = z.object({
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  frequency: z.enum(['instant', 'hourly', 'daily']).optional(),
  minMatchScore: z.number().int().min(0).max(100).optional(),
});

notificationRoutes.post('/push-tokens', requireAuth, zValidator('json', registerTokenSchema), async (c) => {
  const user = c.get('user' as never) as { dbId: string };
  const { token, platform } = c.req.valid('json');

  await db.pushToken.upsert({
    where: { token },
    create: { userId: user.dbId, token, platform, isActive: true },
    update: { isActive: true, platform },
  });

  return c.json({ data: { registered: true }, error: null, meta: null }, 201);
});

notificationRoutes.delete('/push-tokens/:token', requireAuth, async (c) => {
  const user = c.get('user' as never) as { dbId: string };
  const token = c.req.param('token');

  await db.pushToken.updateMany({
    where: { token, userId: user.dbId },
    data: { isActive: false },
  });

  return c.json({ data: null, error: null, meta: null }, 204);
});

notificationRoutes.get('/notifications', requireAuth, async (c) => {
  const user = c.get('user' as never) as { dbId: string };
  const cursor = c.req.query('cursor');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20', 10), 100);

  const notifications = await db.notification.findMany({
    where: { userId: user.dbId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, limit) : notifications;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return c.json({
    data: items,
    error: null,
    meta: { cursor: nextCursor, limit, hasMore },
  });
});

notificationRoutes.patch('/notifications/:id/read', requireAuth, async (c) => {
  const user = c.get('user' as never) as { dbId: string };
  const id = c.req.param('id');

  const notification = await db.notification.findFirst({
    where: { id, userId: user.dbId },
  });

  if (!notification) {
    return c.json({ data: null, error: { code: 'NOT_FOUND', message: 'Notification not found' }, meta: null }, 404);
  }

  const updated = await db.notification.update({
    where: { id },
    data: { status: 'READ', readAt: new Date() },
  });

  return c.json({ data: updated, error: null, meta: null });
});

notificationRoutes.post('/notifications/read-all', requireAuth, async (c) => {
  const user = c.get('user' as never) as { dbId: string };

  const result = await db.notification.updateMany({
    where: { userId: user.dbId, status: { not: 'READ' } },
    data: { status: 'READ', readAt: new Date() },
  });

  return c.json({ data: { updated: result.count }, error: null, meta: null });
});

notificationRoutes.get('/notifications/settings', requireAuth, async (c) => {
  const user = c.get('user' as never) as { dbId: string };

  const prefs = await db.userPreference.findUnique({
    where: { userId: user.dbId },
  });

  if (!prefs) {
    return c.json({
      data: { pushEnabled: true, emailEnabled: false, frequency: 'instant', minMatchScore: 80 },
      error: null,
      meta: null,
    });
  }

  return c.json({
    data: {
      pushEnabled: prefs.pushEnabled,
      emailEnabled: prefs.emailEnabled,
      frequency: prefs.notificationFrequency,
      minMatchScore: prefs.minMatchPercent,
    },
    error: null,
    meta: null,
  });
});

notificationRoutes.put('/notifications/settings', requireAuth, zValidator('json', notificationSettingsSchema), async (c) => {
  const user = c.get('user' as never) as { dbId: string };
  const body = c.req.valid('json');

  const prefs = await db.userPreference.upsert({
    where: { userId: user.dbId },
    create: {
      userId: user.dbId,
      pushEnabled: body.pushEnabled ?? true,
      emailEnabled: body.emailEnabled ?? false,
      notificationFrequency: body.frequency ?? 'instant',
      minMatchPercent: body.minMatchScore ?? 80,
    },
    update: {
      ...(body.pushEnabled !== undefined && { pushEnabled: body.pushEnabled }),
      ...(body.emailEnabled !== undefined && { emailEnabled: body.emailEnabled }),
      ...(body.frequency !== undefined && { notificationFrequency: body.frequency }),
      ...(body.minMatchScore !== undefined && { minMatchPercent: body.minMatchScore }),
    },
  });

  return c.json({ data: prefs, error: null, meta: null });
});

export default notificationRoutes;
