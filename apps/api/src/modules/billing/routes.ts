import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../../lib/db.js';
import { requireAuth } from '../../middleware/auth.js';
import { updateSchedulerInterval } from '../../lib/scheduler.js';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

const billingRoutes = new Hono();

const PREMIUM_INTERVAL_MINUTES = 15;
const FREE_INTERVAL_HOURS = 12;

const webhookSchema = z.object({
  event: z.object({
    type: z.string(),
    app_user_id: z.string(),
    product_id: z.string().optional(),
    expiration_at_ms: z.number().optional(),
    purchased_at_ms: z.number().optional(),
  }),
});

async function verifyRevenueCatWebhook(c: { req: { header: (k: string) => string | undefined } }): Promise<boolean> {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret) return false;
  const authHeader = c.req.header('Authorization');
  return authHeader === `Bearer ${secret}`;
}

billingRoutes.post('/billing/webhook', zValidator('json', webhookSchema), async (c) => {
  const authorized = await verifyRevenueCatWebhook(c);
  if (!authorized) {
    return c.json({ data: null, error: { code: 'UNAUTHORIZED', message: 'Invalid webhook secret' }, meta: null }, 401);
  }

  const { event } = c.req.valid('json');
  const { type, app_user_id: clerkId, expiration_at_ms, purchased_at_ms } = event;

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { subscription: true },
  });

  if (!user) {
    return c.json({ data: null, error: { code: 'NOT_FOUND', message: 'User not found' }, meta: null }, 404);
  }

  const periodStart = purchased_at_ms ? new Date(purchased_at_ms) : new Date();
  const periodEnd = expiration_at_ms ? new Date(expiration_at_ms) : null;

  if (type === 'INITIAL_PURCHASE' || type === 'RENEWAL') {
    await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier: SubscriptionTier.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      update: {
        tier: SubscriptionTier.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
      },
    });

    await updateSchedulerInterval(user.id, PREMIUM_INTERVAL_MINUTES);
    console.log(`[Billing] User ${user.id} upgraded to PREMIUM`);
  } else if (type === 'CANCELLATION') {
    await db.subscription.update({
      where: { userId: user.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
    console.log(`[Billing] User ${user.id} subscription cancelled`);
  } else if (type === 'EXPIRATION') {
    await db.subscription.update({
      where: { userId: user.id },
      data: {
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.EXPIRED,
      },
    });

    await updateSchedulerInterval(user.id, FREE_INTERVAL_HOURS * 60);
    console.log(`[Billing] User ${user.id} downgraded to FREE`);
  }

  return c.json({ data: { received: true }, error: null, meta: null });
});

billingRoutes.get('/billing/status', requireAuth, async (c) => {
  const user = c.get('user' as never) as { dbId: string };

  const subscription = await db.subscription.findUnique({
    where: { userId: user.dbId },
  });

  return c.json({
    data: {
      tier: subscription?.tier ?? SubscriptionTier.FREE,
      status: subscription?.status ?? SubscriptionStatus.ACTIVE,
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      cancelledAt: subscription?.cancelledAt ?? null,
    },
    error: null,
    meta: null,
  });
});

export default billingRoutes;
