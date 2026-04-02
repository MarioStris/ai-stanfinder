import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

const mockFilterCreate = vi.fn();
const mockFilterFindMany = vi.fn();
const mockFilterFindUnique = vi.fn();
const mockFilterUpdate = vi.fn();
const mockFilterDelete = vi.fn();
const mockFilterCount = vi.fn();

vi.mock('../lib/db.js', () => ({
  db: {
    filter: {
      create: mockFilterCreate,
      findMany: mockFilterFindMany,
      findUnique: mockFilterFindUnique,
      update: mockFilterUpdate,
      delete: mockFilterDelete,
      count: mockFilterCount,
    },
  },
}));

vi.mock('../middleware/auth.js', () => ({
  requireAuth: vi.fn(async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('user', { dbId: 'user-1', clerkId: 'clerk-1', email: 'test@test.com', tier: 'FREE' });
    await next();
  }),
}));

async function buildApp() {
  const { default: filters } = await import('../modules/listings/filters.js');
  const app = new Hono();
  app.route('/api/v1/filters', filters);
  return app;
}

const sampleFilter = {
  id: 'filter-1',
  userId: 'user-1',
  name: 'Zagreb Filter',
  city: 'Zagreb',
  propertyType: 'APARTMENT',
  priceMin: 100000,
  priceMax: 300000,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('POST /api/v1/filters', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates filter and returns 201', async () => {
    mockFilterCount.mockResolvedValue(0);
    mockFilterCreate.mockResolvedValue(sampleFilter);
    const app = await buildApp();

    const res = await app.request('/api/v1/filters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Zagreb Filter', city: 'Zagreb' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe('Zagreb Filter');
  });

  it('returns 403 when FREE tier user already has 1 filter', async () => {
    mockFilterCount.mockResolvedValue(1);
    const app = await buildApp();

    const res = await app.request('/api/v1/filters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Second Filter' }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FILTER_LIMIT_REACHED');
  });

  it('returns 400 on missing name', async () => {
    const app = await buildApp();

    const res = await app.request('/api/v1/filters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/filters', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns list of filters', async () => {
    mockFilterFindMany.mockResolvedValue([sampleFilter]);
    const app = await buildApp();

    const res = await app.request('/api/v1/filters');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.meta.total).toBe(1);
  });
});

describe('DELETE /api/v1/filters/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 204 on successful delete', async () => {
    mockFilterFindUnique.mockResolvedValue(sampleFilter);
    mockFilterDelete.mockResolvedValue(sampleFilter);
    const app = await buildApp();

    const res = await app.request('/api/v1/filters/filter-1', { method: 'DELETE' });
    expect(res.status).toBe(204);
  });

  it('returns 403 when user does not own the filter', async () => {
    mockFilterFindUnique.mockResolvedValue({ ...sampleFilter, userId: 'other-user' });
    const app = await buildApp();

    const res = await app.request('/api/v1/filters/filter-1', { method: 'DELETE' });
    expect(res.status).toBe(403);
  });

  it('returns 404 when filter does not exist', async () => {
    mockFilterFindUnique.mockResolvedValue(null);
    const app = await buildApp();

    const res = await app.request('/api/v1/filters/nonexistent', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});
