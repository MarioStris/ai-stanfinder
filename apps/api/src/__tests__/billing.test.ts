import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testClient } from 'hono/testing';
import { Hono } from 'hono';

vi.mock('../lib/db.js', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    subscription: {
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../lib/scheduler.js', () => ({
  updateSchedulerInterval: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../middleware/auth.js', () => ({
  requireAuth: vi.fn(async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('user', { dbId: 'user-db-1', clerkId: 'clerk-1', email: 'test@test.com', tier: 'FREE' });
    await next();
  }),
}));

import billingRoutes from '../modules/billing/routes.js';
import { db } from '../lib/db.js';
import { updateSchedulerInterval } from '../lib/scheduler.js';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

const app = new Hono();
app.route('/', billingRoutes);
const client = testClient(app);

const WEBHOOK_SECRET = 'test-webhook-secret';

beforeEach(() => {
  vi.clearAllMocks();
  process.env.REVENUECAT_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

function makeWebhookBody(type: string, overrides: Record<string, unknown> = {}) {
  return {
    event: {
      type,
      app_user_id: 'clerk-1',
      product_id: 'premium_monthly',
      purchased_at_ms: Date.now(),
      expiration_at_ms: Date.now() + 30 * 24 * 60 * 60 * 1000,
      ...overrides,
    },
  };
}

describe('POST /billing/webhook', () => {
  it('returns 401 if Authorization header is missing', async () => {
    const res = await client['/billing/webhook'].$post({
      json: makeWebhookBody('INITIAL_PURCHASE'),
    });
    expect(res.status).toBe(401);
  });

  it('returns 404 if user not found', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null);

    const res = await fetch('http://localhost/billing/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify(makeWebhookBody('INITIAL_PURCHASE')),
    });

    expect(res.status).toBe(404);
  });

  it('upgrades user to PREMIUM on INITIAL_PURCHASE', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: 'user-db-1',
      clerkId: 'clerk-1',
      email: 'test@test.com',
      subscription: null,
    } as unknown as Awaited<ReturnType<typeof db.user.findUnique>>);

    await app.request('/billing/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify(makeWebhookBody('INITIAL_PURCHASE')),
    });

    expect(db.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ tier: SubscriptionTier.PREMIUM }),
      }),
    );
    expect(updateSchedulerInterval).toHaveBeenCalledWith('user-db-1', 15);
  });

  it('downgrades user to FREE on EXPIRATION', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: 'user-db-1',
      clerkId: 'clerk-1',
      subscription: { tier: 'PREMIUM' },
    } as unknown as Awaited<ReturnType<typeof db.user.findUnique>>);

    await app.request('/billing/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify(makeWebhookBody('EXPIRATION')),
    });

    expect(db.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tier: SubscriptionTier.FREE, status: SubscriptionStatus.EXPIRED }),
      }),
    );
    expect(updateSchedulerInterval).toHaveBeenCalledWith('user-db-1', 720);
  });

  it('sets status to CANCELLED on CANCELLATION event', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: 'user-db-1',
      clerkId: 'clerk-1',
      subscription: { tier: 'PREMIUM' },
    } as unknown as Awaited<ReturnType<typeof db.user.findUnique>>);

    await app.request('/billing/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify(makeWebhookBody('CANCELLATION')),
    });

    expect(db.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: SubscriptionStatus.CANCELLED }),
      }),
    );
  });
});

describe('GET /billing/status', () => {
  it('returns FREE tier when no subscription exists', async () => {
    vi.mocked(db.subscription.findUnique).mockResolvedValueOnce(null);

    const res = await app.request('/billing/status', {
      headers: { Authorization: 'Bearer test-token' },
    });
    const body = await res.json() as { data: { tier: string } };

    expect(body.data.tier).toBe(SubscriptionTier.FREE);
  });

  it('returns PREMIUM tier for active subscription', async () => {
    vi.mocked(db.subscription.findUnique).mockResolvedValueOnce({
      tier: SubscriptionTier.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(),
      cancelledAt: null,
    } as unknown as Awaited<ReturnType<typeof db.subscription.findUnique>>);

    const res = await app.request('/billing/status', {
      headers: { Authorization: 'Bearer test-token' },
    });
    const body = await res.json() as { data: { tier: string } };

    expect(body.data.tier).toBe(SubscriptionTier.PREMIUM);
  });
});
