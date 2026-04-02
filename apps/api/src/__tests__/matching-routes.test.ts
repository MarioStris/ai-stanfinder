import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

const mockFilterFindUnique = vi.fn();
const mockMatchFindMany = vi.fn();
const mockMatchUpdate = vi.fn();
const mockMatchFindUnique = vi.fn();
const mockQueueAdd = vi.fn();

vi.mock('../lib/db.js', () => ({
  db: {
    filter: { findUnique: mockFilterFindUnique },
    match: {
      findMany: mockMatchFindMany,
      update: mockMatchUpdate,
      findUnique: mockMatchFindUnique,
    },
  },
}));

vi.mock('../lib/queue.js', () => ({
  getQueue: () => ({ add: mockQueueAdd }),
  QUEUE_NAMES: { MATCHING: 'matching' },
}));

vi.mock('../middleware/auth.js', () => ({
  requireAuth: vi.fn(async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('user', { dbId: 'user-1', clerkId: 'clerk-1', email: 'test@test.com', tier: 'FREE' });
    await next();
  }),
}));

async function buildApp() {
  const { default: matchingRouter } = await import('../modules/matching/index.js');
  const app = new Hono();
  app.route('/api/v1', matchingRouter);
  return app;
}

const sampleFilter = {
  id: 'filter-1',
  userId: 'user-1',
  isActive: true,
  city: 'Zagreb',
};

const sampleMatch = {
  id: 'match-1',
  userId: 'user-1',
  filterId: 'filter-1',
  propertyId: 'prop-1',
  matchPercent: 90,
  aiComment: 'Odlično podudaranje.',
  rank: 1,
  isNew: true,
  isSeen: false,
  property: {
    id: 'prop-1',
    title: 'Stan u centru',
    city: 'Zagreb',
    price: 200000,
    area: 65,
  },
};

describe('GET /api/v1/filters/:filterId/matches', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns matches for owned filter', async () => {
    mockFilterFindUnique.mockResolvedValue(sampleFilter);
    mockMatchFindMany.mockResolvedValue([sampleMatch]);
    const app = await buildApp();

    const res = await app.request('/api/v1/filters/filter-1/matches');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.meta.total).toBe(1);
    expect(body.meta.newCount).toBe(1);
  });

  it('returns 404 when filter not found', async () => {
    mockFilterFindUnique.mockResolvedValue(null);
    const app = await buildApp();

    const res = await app.request('/api/v1/filters/nonexistent/matches');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('returns 403 when user does not own filter', async () => {
    mockFilterFindUnique.mockResolvedValue({ ...sampleFilter, userId: 'other-user' });
    const app = await buildApp();

    const res = await app.request('/api/v1/filters/filter-1/matches');
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('returns empty array with correct meta when no matches', async () => {
    mockFilterFindUnique.mockResolvedValue(sampleFilter);
    mockMatchFindMany.mockResolvedValue([]);
    const app = await buildApp();

    const res = await app.request('/api/v1/filters/filter-1/matches');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(0);
    expect(body.meta.newCount).toBe(0);
  });
});

describe('POST /api/v1/filters/:filterId/matches/refresh', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enqueues matching job and returns 202', async () => {
    mockFilterFindUnique.mockResolvedValue(sampleFilter);
    mockQueueAdd.mockResolvedValue({ id: 'job-123' });
    const app = await buildApp();

    const res = await app.request('/api/v1/filters/filter-1/matches/refresh', {
      method: 'POST',
    });
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.data.jobId).toBe('job-123');
    expect(body.data.status).toBe('queued');
    expect(mockQueueAdd).toHaveBeenCalledOnce();
  });

  it('returns 400 when filter is inactive', async () => {
    mockFilterFindUnique.mockResolvedValue({ ...sampleFilter, isActive: false });
    const app = await buildApp();

    const res = await app.request('/api/v1/filters/filter-1/matches/refresh', {
      method: 'POST',
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('FILTER_INACTIVE');
  });

  it('returns 404 when filter not found', async () => {
    mockFilterFindUnique.mockResolvedValue(null);
    const app = await buildApp();

    const res = await app.request('/api/v1/filters/nonexistent/matches/refresh', {
      method: 'POST',
    });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/matches/:matchId/read', () => {
  beforeEach(() => vi.clearAllMocks());

  it('marks match as read and returns updated match', async () => {
    mockMatchFindUnique.mockResolvedValue(sampleMatch);
    mockMatchUpdate.mockResolvedValue({ ...sampleMatch, isNew: false, isSeen: true });
    const app = await buildApp();

    const res = await app.request('/api/v1/matches/match-1/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.isNew).toBe(false);
    expect(body.data.isSeen).toBe(true);
    expect(mockMatchUpdate).toHaveBeenCalledWith({
      where: { id: 'match-1' },
      data: { isNew: false, isSeen: true },
    });
  });

  it('returns 404 when match not found', async () => {
    mockMatchFindUnique.mockResolvedValue(null);
    const app = await buildApp();

    const res = await app.request('/api/v1/matches/nonexistent/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(404);
  });

  it('returns 403 when user does not own match', async () => {
    mockMatchFindUnique.mockResolvedValue({ ...sampleMatch, userId: 'other-user' });
    const app = await buildApp();

    const res = await app.request('/api/v1/matches/match-1/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(403);
  });
});
