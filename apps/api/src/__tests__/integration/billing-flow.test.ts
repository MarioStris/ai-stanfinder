/**
 * Integration test: Billing webhook → Tier change → Scheduler interval updated → Tier downgrade
 *
 * Covers: US-13 (FREE/PREMIUM gating), US-14 (billing), US-19 (scheduler)
 * Pattern: AAA (Arrange, Act, Assert)
 * Mocks: Prisma DB, scheduler, Clerk auth middleware
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

// ---------------------------------------------------------------------------
// Test data factory
// ---------------------------------------------------------------------------

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-billing-1',
    clerkId: 'clerk-billing-1',
    email: 'billing-test@example.com',
    locale: 'hr',
    createdAt: new Date('2026-01-01'),
    subscription: null,
    ...overrides,
  };
}

function makeSubscription(overrides: Record<string, unknown> = {}) {
  const now = Date.now();
  return {
    id: 'sub-1',
    userId: 'user-billing-1',
    tier: SubscriptionTier.PREMIUM,
    status: SubscriptionStatus.ACTIVE,
    currentPeriodStart: new Date(now),
    currentPeriodEnd: new Date(now + 30 * 24 * 60 * 60 * 1_000),
    cancelledAt: null,
    createdAt: new Date(now),
    updatedAt: new Date(now),
    ...overrides,
  };
}

function makeWebhookPayload(
  type: string,
  clerkId: string = 'clerk-billing-1',
  extras: Record<string, unknown> = {},
) {
  const now = Date.now();
  return {
    event: {
      type,
      app_user_id: clerkId,
      product_id: 'premium_monthly',
      purchased_at_ms: now,
      expiration_at_ms: now + 30 * 24 * 60 * 60 * 1_000,
      ...extras,
    },
  };
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockUserFindUnique = vi.fn();
const mockSubscriptionUpsert = vi.fn();
const mockSubscriptionUpdate = vi.fn();
const mockSubscriptionFindUnique = vi.fn();
const mockUpdateSchedulerInterval = vi.fn();
const mockFilterCount = vi.fn();
const mockFilterCreate = vi.fn();

vi.mock('../../lib/db.js', () => ({
  db: {
    user: { findUnique: mockUserFindUnique },
    subscription: {
      upsert: mockSubscriptionUpsert,
      update: mockSubscriptionUpdate,
      findUnique: mockSubscriptionFindUnique,
    },
    filter: {
      count: mockFilterCount,
      create: mockFilterCreate,
    },
  },
}));

vi.mock('../../lib/scheduler.js', () => ({
  updateSchedulerInterval: mockUpdateSchedulerInterval,
}));

vi.mock('../../middleware/auth.js', () => ({
  requireAuth: vi.fn(async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('user', { dbId: 'user-billing-1', clerkId: 'clerk-billing-1', tier: 'FREE' });
    await next();
  }),
}));

// ---------------------------------------------------------------------------
// App builder
// ---------------------------------------------------------------------------

async function buildBillingApp() {
  const { default: billingRoutes } = await import('../../modules/billing/routes.js');
  const app = new Hono();
  app.route('/', billingRoutes);
  return app;
}

async function buildFiltersApp() {
  const { default: filtersRoute } = await import('../../modules/listings/filters.js');
  const app = new Hono();
  app.route('/api/v1/filters', filtersRoute);
  return app;
}

const WEBHOOK_SECRET = 'test-webhook-secret-billing';

function webhookHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${WEBHOOK_SECRET}`,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Integration: Billing Webhook → Tier Change → Scheduler Update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REVENUECAT_WEBHOOK_SECRET = WEBHOOK_SECRET;
    mockSubscriptionUpsert.mockResolvedValue(makeSubscription());
    mockSubscriptionUpdate.mockResolvedValue(makeSubscription());
    mockUpdateSchedulerInterval.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // PHASE 1: INITIAL_PURCHASE — upgrade to PREMIUM
  // -------------------------------------------------------------------------

  describe('Phase 1: INITIAL_PURCHASE → upgrade to PREMIUM', () => {
    it('upgrades user to PREMIUM and sets scheduler to 15 minutes', async () => {
      // Arrange
      mockUserFindUnique.mockResolvedValueOnce(makeUser());
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify(makeWebhookPayload('INITIAL_PURCHASE')),
      });

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json() as { data: { received: boolean } };
      expect(body.data.received).toBe(true);

      expect(mockSubscriptionUpsert).toHaveBeenCalledOnce();
      const upsertCall = mockSubscriptionUpsert.mock.calls[0][0];
      expect(upsertCall.create.tier).toBe(SubscriptionTier.PREMIUM);
      expect(upsertCall.create.status).toBe(SubscriptionStatus.ACTIVE);

      expect(mockUpdateSchedulerInterval).toHaveBeenCalledWith('user-billing-1', 15);
    });

    it('sets correct currentPeriodStart and currentPeriodEnd from webhook timestamps', async () => {
      // Arrange
      const purchasedAt = 1_743_465_600_000;
      const expiresAt = 1_746_057_600_000;
      mockUserFindUnique.mockResolvedValueOnce(makeUser());
      const app = await buildBillingApp();

      // Act
      await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify(makeWebhookPayload('INITIAL_PURCHASE', 'clerk-billing-1', {
          purchased_at_ms: purchasedAt,
          expiration_at_ms: expiresAt,
        })),
      });

      // Assert
      const upsertCall = mockSubscriptionUpsert.mock.calls[0][0];
      expect(upsertCall.create.currentPeriodStart).toEqual(new Date(purchasedAt));
      expect(upsertCall.create.currentPeriodEnd).toEqual(new Date(expiresAt));
    });

    it('returns 401 when webhook secret is missing', async () => {
      // Arrange
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(makeWebhookPayload('INITIAL_PURCHASE')),
      });

      // Assert
      expect(res.status).toBe(401);
      expect(mockSubscriptionUpsert).not.toHaveBeenCalled();
      expect(mockUpdateSchedulerInterval).not.toHaveBeenCalled();
    });

    it('returns 401 when webhook secret is wrong', async () => {
      // Arrange
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer WRONG-SECRET' },
        body: JSON.stringify(makeWebhookPayload('INITIAL_PURCHASE')),
      });

      // Assert
      expect(res.status).toBe(401);
    });

    it('returns 404 when clerk user ID does not match any DB user', async () => {
      // Arrange
      mockUserFindUnique.mockResolvedValueOnce(null);
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify(makeWebhookPayload('INITIAL_PURCHASE', 'clerk-nonexistent')),
      });

      // Assert
      expect(res.status).toBe(404);
      expect(mockSubscriptionUpsert).not.toHaveBeenCalled();
    });

    it('returns 400 when event body is missing required fields', async () => {
      // Arrange
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify({ event: { app_user_id: 'clerk-billing-1' } }),
      });

      // Assert
      expect(res.status).toBe(400);
    });
  });

  // -------------------------------------------------------------------------
  // PHASE 2: RENEWAL — extend subscription period
  // -------------------------------------------------------------------------

  describe('Phase 2: RENEWAL → extend period', () => {
    it('renews subscription and updates scheduler to 15 minutes', async () => {
      // Arrange
      mockUserFindUnique.mockResolvedValueOnce(makeUser({
        subscription: makeSubscription(),
      }));
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify(makeWebhookPayload('RENEWAL')),
      });

      // Assert
      expect(res.status).toBe(200);
      expect(mockSubscriptionUpsert).toHaveBeenCalledOnce();
      const upsertCall = mockSubscriptionUpsert.mock.calls[0][0];
      expect(upsertCall.update.tier).toBe(SubscriptionTier.PREMIUM);
      expect(upsertCall.update.status).toBe(SubscriptionStatus.ACTIVE);
      expect(upsertCall.update.cancelledAt).toBeNull();
      expect(mockUpdateSchedulerInterval).toHaveBeenCalledWith('user-billing-1', 15);
    });
  });

  // -------------------------------------------------------------------------
  // PHASE 3: CANCELLATION — mark as cancelled (still active until expiry)
  // -------------------------------------------------------------------------

  describe('Phase 3: CANCELLATION → mark as cancelled', () => {
    it('sets status to CANCELLED without changing tier', async () => {
      // Arrange
      mockUserFindUnique.mockResolvedValueOnce(makeUser({
        subscription: makeSubscription(),
      }));
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify(makeWebhookPayload('CANCELLATION')),
      });

      // Assert
      expect(res.status).toBe(200);
      expect(mockSubscriptionUpdate).toHaveBeenCalledOnce();
      const updateCall = mockSubscriptionUpdate.mock.calls[0][0];
      expect(updateCall.data.status).toBe(SubscriptionStatus.CANCELLED);
      expect(updateCall.data.cancelledAt).toBeInstanceOf(Date);
      // Scheduler NOT updated on cancellation — access continues until expiry
      expect(mockUpdateSchedulerInterval).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // PHASE 4: EXPIRATION → downgrade to FREE
  // -------------------------------------------------------------------------

  describe('Phase 4: EXPIRATION → downgrade to FREE + scheduler update', () => {
    it('downgrades to FREE tier and sets scheduler to 12h (720 min)', async () => {
      // Arrange
      mockUserFindUnique.mockResolvedValueOnce(makeUser({
        subscription: makeSubscription({ tier: SubscriptionTier.PREMIUM }),
      }));
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify(makeWebhookPayload('EXPIRATION')),
      });

      // Assert
      expect(res.status).toBe(200);
      expect(mockSubscriptionUpdate).toHaveBeenCalledOnce();
      const updateCall = mockSubscriptionUpdate.mock.calls[0][0];
      expect(updateCall.data.tier).toBe(SubscriptionTier.FREE);
      expect(updateCall.data.status).toBe(SubscriptionStatus.EXPIRED);

      expect(mockUpdateSchedulerInterval).toHaveBeenCalledWith('user-billing-1', 720);
    });

    it('FREE user is now subject to filter limit after downgrade', async () => {
      // Arrange — simulate state after expiration: user is FREE with 1 filter
      mockFilterCount.mockResolvedValueOnce(1);
      const app = await buildFiltersApp();

      // Act — attempt to create a second filter as FREE user
      const res = await app.request('/api/v1/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Second Filter After Downgrade' }),
      });

      // Assert
      expect(res.status).toBe(403);
      const body = await res.json() as { error: { code: string } };
      expect(body.error.code).toBe('FILTER_LIMIT_REACHED');
    });
  });

  // -------------------------------------------------------------------------
  // PHASE 5: Billing status endpoint
  // -------------------------------------------------------------------------

  describe('Phase 5: GET /billing/status reflects current state', () => {
    it('returns FREE tier when no subscription record exists', async () => {
      // Arrange
      mockSubscriptionFindUnique.mockResolvedValueOnce(null);
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/status', {
        headers: { Authorization: 'Bearer test-token' },
      });

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json() as { data: { tier: string; status: string } };
      expect(body.data.tier).toBe(SubscriptionTier.FREE);
      expect(body.data.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it('returns PREMIUM tier with period end for active subscription', async () => {
      // Arrange
      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000);
      mockSubscriptionFindUnique.mockResolvedValueOnce(makeSubscription({ currentPeriodEnd: periodEnd }));
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/status', {
        headers: { Authorization: 'Bearer test-token' },
      });

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json() as { data: { tier: string; currentPeriodEnd: string | null } };
      expect(body.data.tier).toBe(SubscriptionTier.PREMIUM);
      expect(body.data.currentPeriodEnd).not.toBeNull();
    });

    it('returns CANCELLED status with cancelledAt date', async () => {
      // Arrange
      const cancelDate = new Date();
      mockSubscriptionFindUnique.mockResolvedValueOnce(
        makeSubscription({ status: SubscriptionStatus.CANCELLED, cancelledAt: cancelDate }),
      );
      const app = await buildBillingApp();

      // Act
      const res = await app.request('/billing/status', {
        headers: { Authorization: 'Bearer test-token' },
      });

      // Assert
      const body = await res.json() as { data: { status: string; cancelledAt: string | null } };
      expect(body.data.status).toBe(SubscriptionStatus.CANCELLED);
      expect(body.data.cancelledAt).not.toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // PHASE 6: Full lifecycle
  // -------------------------------------------------------------------------

  describe('Phase 6: Full subscription lifecycle', () => {
    it('complete lifecycle: purchase → renew → cancel → expire → FREE', async () => {
      const app = await buildBillingApp();

      // Step 1: INITIAL_PURCHASE
      mockUserFindUnique.mockResolvedValueOnce(makeUser());
      const purchaseRes = await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify(makeWebhookPayload('INITIAL_PURCHASE')),
      });
      expect(purchaseRes.status).toBe(200);
      expect(mockSubscriptionUpsert.mock.calls[0][0].create.tier).toBe(SubscriptionTier.PREMIUM);
      expect(mockUpdateSchedulerInterval).toHaveBeenLastCalledWith('user-billing-1', 15);

      vi.clearAllMocks();
      process.env.REVENUECAT_WEBHOOK_SECRET = WEBHOOK_SECRET;
      mockSubscriptionUpsert.mockResolvedValue(makeSubscription());
      mockSubscriptionUpdate.mockResolvedValue(makeSubscription());
      mockUpdateSchedulerInterval.mockResolvedValue(undefined);

      // Step 2: RENEWAL
      mockUserFindUnique.mockResolvedValueOnce(makeUser());
      const renewRes = await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify(makeWebhookPayload('RENEWAL')),
      });
      expect(renewRes.status).toBe(200);
      expect(mockUpdateSchedulerInterval).toHaveBeenLastCalledWith('user-billing-1', 15);

      vi.clearAllMocks();
      process.env.REVENUECAT_WEBHOOK_SECRET = WEBHOOK_SECRET;
      mockSubscriptionUpdate.mockResolvedValue(makeSubscription({ status: SubscriptionStatus.CANCELLED }));
      mockUpdateSchedulerInterval.mockResolvedValue(undefined);

      // Step 3: CANCELLATION
      mockUserFindUnique.mockResolvedValueOnce(makeUser());
      const cancelRes = await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify(makeWebhookPayload('CANCELLATION')),
      });
      expect(cancelRes.status).toBe(200);
      const cancelUpdate = mockSubscriptionUpdate.mock.calls[0][0];
      expect(cancelUpdate.data.status).toBe(SubscriptionStatus.CANCELLED);
      expect(mockUpdateSchedulerInterval).not.toHaveBeenCalled();

      vi.clearAllMocks();
      process.env.REVENUECAT_WEBHOOK_SECRET = WEBHOOK_SECRET;
      mockSubscriptionUpdate.mockResolvedValue(makeSubscription({ tier: SubscriptionTier.FREE, status: SubscriptionStatus.EXPIRED }));
      mockUpdateSchedulerInterval.mockResolvedValue(undefined);

      // Step 4: EXPIRATION
      mockUserFindUnique.mockResolvedValueOnce(makeUser());
      const expireRes = await app.request('/billing/webhook', {
        method: 'POST',
        headers: webhookHeaders(),
        body: JSON.stringify(makeWebhookPayload('EXPIRATION')),
      });
      expect(expireRes.status).toBe(200);
      const expireUpdate = mockSubscriptionUpdate.mock.calls[0][0];
      expect(expireUpdate.data.tier).toBe(SubscriptionTier.FREE);
      expect(expireUpdate.data.status).toBe(SubscriptionStatus.EXPIRED);
      expect(mockUpdateSchedulerInterval).toHaveBeenLastCalledWith('user-billing-1', 720);
    });
  });
});
