import { Hono } from 'hono';
import { createClerkClient } from '@clerk/backend';
import { db } from '../../lib/db.js';
import { requireAuth } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error-handler.js';

const gdprRoutes = new Hono();

function getClerk() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new AppError(500, 'CONFIG_ERROR', 'CLERK_SECRET_KEY not configured');
  return createClerkClient({ secretKey });
}

gdprRoutes.get('/me/data-export', requireAuth, async (c) => {
  const user = c.get('user' as never) as { dbId: string };

  const [dbUser, subscription, filters, matches, notifications, pushTokens, apiUsage, preferences] =
    await Promise.all([
      db.user.findUnique({ where: { id: user.dbId } }),
      db.subscription.findUnique({ where: { userId: user.dbId } }),
      db.filter.findMany({ where: { userId: user.dbId } }),
      db.match.findMany({
        where: { userId: user.dbId },
        include: { property: true },
        take: 500,
        orderBy: { createdAt: 'desc' },
      }),
      db.notification.findMany({
        where: { userId: user.dbId },
        take: 500,
        orderBy: { createdAt: 'desc' },
      }),
      db.pushToken.findMany({ where: { userId: user.dbId } }),
      db.apiUsage.findMany({ where: { userId: user.dbId }, take: 1000 }),
      db.userPreference.findUnique({ where: { userId: user.dbId } }),
    ]);

  if (!dbUser) {
    return c.json({ data: null, error: { code: 'NOT_FOUND', message: 'User not found' }, meta: null }, 404);
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: dbUser.id,
      email: dbUser.email,
      locale: dbUser.locale,
      createdAt: dbUser.createdAt,
    },
    subscription,
    preferences,
    filters,
    matches,
    notifications,
    pushTokens: pushTokens.map((pt) => ({ platform: pt.platform, createdAt: pt.createdAt })),
    apiUsageSummary: {
      totalCalls: apiUsage.length,
      cacheHits: apiUsage.filter((u) => u.cacheHit).length,
    },
  };

  c.header('Content-Type', 'application/json');
  c.header('Content-Disposition', `attachment; filename="data-export-${dbUser.id}.json"`);

  return c.json({ data: exportData, error: null, meta: null });
});

gdprRoutes.delete('/me', requireAuth, async (c) => {
  const confirmHeader = c.req.header('X-Confirm-Delete');

  if (confirmHeader !== 'true') {
    return c.json(
      {
        data: null,
        error: {
          code: 'CONFIRMATION_REQUIRED',
          message: 'Send header X-Confirm-Delete: true to confirm account deletion',
        },
        meta: null,
      },
      400,
    );
  }

  const user = c.get('user' as never) as { dbId: string; clerkId: string };

  const dbUser = await db.user.findUnique({ where: { id: user.dbId } });
  if (!dbUser) {
    return c.json({ data: null, error: { code: 'NOT_FOUND', message: 'User not found' }, meta: null }, 404);
  }

  await db.user.update({
    where: { id: user.dbId },
    data: { deletedAt: new Date() },
  });

  await db.user.delete({ where: { id: user.dbId } });

  try {
    const clerk = getClerk();
    await clerk.users.deleteUser(user.clerkId);
  } catch (err) {
    console.error('[GDPR] Failed to delete Clerk user:', err);
  }

  return c.json({ data: { deleted: true }, error: null, meta: null });
});

export default gdprRoutes;
