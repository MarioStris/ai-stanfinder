import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('../lib/db.js', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    subscription: { findUnique: vi.fn().mockResolvedValue(null) },
    filter: { findMany: vi.fn().mockResolvedValue([]) },
    match: { findMany: vi.fn().mockResolvedValue([]) },
    notification: { findMany: vi.fn().mockResolvedValue([]) },
    pushToken: { findMany: vi.fn().mockResolvedValue([]) },
    apiUsage: { findMany: vi.fn().mockResolvedValue([]) },
    userPreference: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}));

vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn().mockReturnValue({
    users: { deleteUser: vi.fn().mockResolvedValue({}) },
  }),
}));

vi.mock('../middleware/auth.js', () => ({
  requireAuth: vi.fn(async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('user', { dbId: 'user-db-1', clerkId: 'clerk-1', email: 'test@test.com', tier: 'FREE' });
    await next();
  }),
}));

import gdprRoutes from '../modules/auth/gdpr.js';
import { db } from '../lib/db.js';

const app = new Hono();
app.route('/', gdprRoutes);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CLERK_SECRET_KEY = 'test-clerk-key';
});

describe('GET /me/data-export', () => {
  it('returns 404 when user not found in DB', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null);

    const res = await app.request('/me/data-export', {
      headers: { Authorization: 'Bearer token' },
    });

    expect(res.status).toBe(404);
  });

  it('returns full data export for existing user', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: 'user-db-1',
      email: 'test@test.com',
      locale: 'hr',
      createdAt: new Date('2024-01-01'),
    } as unknown as Awaited<ReturnType<typeof db.user.findUnique>>);

    const res = await app.request('/me/data-export', {
      headers: { Authorization: 'Bearer token' },
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { data: { exportedAt: string; user: { email: string } } };
    expect(body.data).toBeDefined();
    expect(body.data.exportedAt).toBeDefined();
    expect(body.data.user.email).toBe('test@test.com');
  });

  it('includes all data sections in export', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: 'user-db-1',
      email: 'test@test.com',
      locale: 'hr',
      createdAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof db.user.findUnique>>);

    vi.mocked(db.filter.findMany).mockResolvedValueOnce([
      { id: 'f-1', name: 'Test filter' } as never,
    ]);

    const res = await app.request('/me/data-export', {
      headers: { Authorization: 'Bearer token' },
    });

    const body = await res.json() as { data: Record<string, unknown> };
    expect(body.data).toHaveProperty('filters');
    expect(body.data).toHaveProperty('matches');
    expect(body.data).toHaveProperty('notifications');
    expect(body.data).toHaveProperty('apiUsageSummary');
  });
});

describe('DELETE /me', () => {
  it('returns 400 when X-Confirm-Delete header is missing', async () => {
    const res = await app.request('/me', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token' },
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe('CONFIRMATION_REQUIRED');
  });

  it('returns 404 when user not found', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null);

    const res = await app.request('/me', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer token',
        'X-Confirm-Delete': 'true',
      },
    });

    expect(res.status).toBe(404);
  });

  it('deletes user from DB and Clerk when confirmed', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: 'user-db-1',
      clerkId: 'clerk-1',
      email: 'test@test.com',
    } as unknown as Awaited<ReturnType<typeof db.user.findUnique>>);

    const res = await app.request('/me', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer token',
        'X-Confirm-Delete': 'true',
      },
    });

    expect(res.status).toBe(200);
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: 'user-db-1' } });

    const body = await res.json() as { data: { deleted: boolean } };
    expect(body.data.deleted).toBe(true);
  });
});
