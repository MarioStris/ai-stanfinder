import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { db } from '../../lib/db.js';
import gdprRoutes from './gdpr.js';

const authRouter = new Hono();

// POST /api/v1/auth/sync — sync Clerk user to DB after sign-up
// POST /api/v1/auth/delete — handle Clerk user.deleted webhook

authRouter.get('/me', requireAuth, async (c) => {
  const user = c.get('user' as never) as { dbId: string; clerkId: string; email: string; tier: string };

  const dbUser = await db.user.findUnique({
    where: { id: user.dbId },
    include: { subscription: true, preferences: true },
  });

  if (!dbUser) {
    return c.json({ data: null, error: { code: 'NOT_FOUND', message: 'User not found' }, meta: null }, 404);
  }

  return c.json({
    data: {
      id: dbUser.id,
      email: dbUser.email,
      locale: dbUser.locale,
      tier: dbUser.subscription?.tier ?? 'FREE',
      subscriptionStatus: dbUser.subscription?.status ?? null,
      preferences: dbUser.preferences,
      createdAt: dbUser.createdAt,
    },
    error: null,
    meta: null,
  });
});

authRouter.route('/', gdprRoutes);

export default authRouter;
