import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('../lib/db.js', () => ({
  db: {
    pushToken: {
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 5 }),
    },
    userPreference: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock('../middleware/auth.js', () => ({
  requireAuth: vi.fn(async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('user', { dbId: 'user-db-1', clerkId: 'clerk-1', email: 'test@test.com', tier: 'FREE' });
    await next();
  }),
}));

import notificationRoutes from '../modules/notifications/routes.js';
import { db } from '../lib/db.js';

const app = new Hono();
app.route('/', notificationRoutes);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /push-tokens', () => {
  it('registers a valid push token', async () => {
    const res = await app.request('/push-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      body: JSON.stringify({ token: 'ExponentPushToken[abc123]', platform: 'ios' }),
    });

    expect(res.status).toBe(201);
    expect(db.pushToken.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { token: 'ExponentPushToken[abc123]' },
        create: expect.objectContaining({ platform: 'ios' }),
      }),
    );
  });

  it('returns 400 for invalid body', async () => {
    const res = await app.request('/push-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      body: JSON.stringify({ token: '' }),
    });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /push-tokens/:token', () => {
  it('deactivates a push token', async () => {
    const res = await app.request('/push-tokens/ExponentPushToken[abc123]', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token' },
    });

    expect(res.status).toBe(204);
    expect(db.pushToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isActive: false },
      }),
    );
  });
});

describe('GET /notifications', () => {
  it('returns paginated notifications', async () => {
    vi.mocked(db.notification.findMany).mockResolvedValueOnce([
      { id: 'n-1', title: 'Test', body: 'Body', createdAt: new Date() } as never,
      { id: 'n-2', title: 'Test 2', body: 'Body 2', createdAt: new Date() } as never,
    ]);

    const res = await app.request('/notifications', {
      headers: { Authorization: 'Bearer token' },
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: unknown[]; meta: { hasMore: boolean } };
    expect(body.data).toHaveLength(2);
    expect(body.meta.hasMore).toBe(false);
  });

  it('returns next cursor when more items exist', async () => {
    const items = Array.from({ length: 21 }, (_, i) => ({
      id: `n-${i}`,
      title: `Notification ${i}`,
      createdAt: new Date(),
    }));
    vi.mocked(db.notification.findMany).mockResolvedValueOnce(items as never[]);

    const res = await app.request('/notifications?limit=20', {
      headers: { Authorization: 'Bearer token' },
    });

    const body = await res.json() as { meta: { hasMore: boolean; cursor: string | null } };
    expect(body.meta.hasMore).toBe(true);
    expect(body.meta.cursor).toBe('n-19');
  });
});

describe('PATCH /notifications/:id/read', () => {
  it('returns 404 when notification does not exist', async () => {
    vi.mocked(db.notification.findFirst).mockResolvedValueOnce(null);

    const res = await app.request('/notifications/nonexistent/read', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer token' },
    });

    expect(res.status).toBe(404);
  });

  it('marks notification as read', async () => {
    vi.mocked(db.notification.findFirst).mockResolvedValueOnce({
      id: 'n-1',
      userId: 'user-db-1',
    } as never);
    vi.mocked(db.notification.update).mockResolvedValueOnce({
      id: 'n-1',
      status: 'READ',
    } as never);

    const res = await app.request('/notifications/n-1/read', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer token' },
    });

    expect(res.status).toBe(200);
    expect(db.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'READ' }) }),
    );
  });
});

describe('POST /notifications/read-all', () => {
  it('marks all unread notifications as read', async () => {
    const res = await app.request('/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: { updated: number } };
    expect(body.data.updated).toBe(5);
  });
});

describe('GET /notifications/settings', () => {
  it('returns defaults when no preferences exist', async () => {
    vi.mocked(db.userPreference.findUnique).mockResolvedValueOnce(null);

    const res = await app.request('/notifications/settings', {
      headers: { Authorization: 'Bearer token' },
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: { pushEnabled: boolean; minMatchScore: number } };
    expect(body.data.pushEnabled).toBe(true);
    expect(body.data.minMatchScore).toBe(80);
  });

  it('returns user preferences when they exist', async () => {
    vi.mocked(db.userPreference.findUnique).mockResolvedValueOnce({
      pushEnabled: false,
      emailEnabled: true,
      notificationFrequency: 'daily',
      minMatchPercent: 90,
    } as never);

    const res = await app.request('/notifications/settings', {
      headers: { Authorization: 'Bearer token' },
    });

    const body = await res.json() as { data: { pushEnabled: boolean; frequency: string } };
    expect(body.data.pushEnabled).toBe(false);
    expect(body.data.frequency).toBe('daily');
  });
});

describe('PUT /notifications/settings', () => {
  it('updates notification preferences', async () => {
    vi.mocked(db.userPreference.upsert).mockResolvedValueOnce({
      pushEnabled: false,
      notificationFrequency: 'daily',
      minMatchPercent: 85,
    } as never);

    const res = await app.request('/notifications/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      body: JSON.stringify({ pushEnabled: false, frequency: 'daily', minMatchScore: 85 }),
    });

    expect(res.status).toBe(200);
    expect(db.userPreference.upsert).toHaveBeenCalled();
  });

  it('returns 400 for invalid minMatchScore value', async () => {
    const res = await app.request('/notifications/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      body: JSON.stringify({ minMatchScore: 150 }),
    });

    expect(res.status).toBe(400);
  });
});
