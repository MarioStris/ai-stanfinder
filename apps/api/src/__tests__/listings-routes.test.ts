import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();

vi.mock('../lib/db.js', () => ({
  db: {
    property: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
    },
  },
}));

async function buildApp() {
  const { default: routes } = await import('../modules/listings/routes.js');
  const app = new Hono();
  app.route('/api/v1/listings', routes);
  return app;
}

const sampleProperty = {
  id: 'prop-1',
  title: 'Nice Apartment',
  city: 'Zagreb',
  price: 150000,
  area: 70,
  isActive: true,
  propertyType: 'APARTMENT',
  createdAt: new Date(),
};

describe('GET /api/v1/listings', () => {
  beforeEach(() => {
    mockFindMany.mockClear();
    mockFindUnique.mockClear();
  });

  it('returns 200 with data array', async () => {
    mockFindMany.mockResolvedValue([sampleProperty]);
    const app = await buildApp();

    const res = await app.request('/api/v1/listings');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.meta).toMatchObject({ hasNextPage: false, limit: 20 });
  });

  it('indicates hasNextPage when more results exist', async () => {
    const items = Array.from({ length: 21 }, (_, i) => ({ ...sampleProperty, id: `prop-${i}` }));
    mockFindMany.mockResolvedValue(items);
    const app = await buildApp();

    const res = await app.request('/api/v1/listings?limit=20');
    const body = await res.json();
    expect(body.meta.hasNextPage).toBe(true);
    expect(body.data).toHaveLength(20);
  });

  it('returns 400 on invalid propertyType query param', async () => {
    const app = await buildApp();
    const res = await app.request('/api/v1/listings?propertyType=VILLA');
    expect(res.status).toBe(400);
  });

  it('passes city filter to db query', async () => {
    mockFindMany.mockResolvedValue([]);
    const app = await buildApp();

    await app.request('/api/v1/listings?city=Zagreb');
    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.city).toMatchObject({ contains: 'Zagreb', mode: 'insensitive' });
  });
});

describe('GET /api/v1/listings/:id', () => {
  beforeEach(() => {
    mockFindUnique.mockClear();
  });

  it('returns 200 with property data', async () => {
    mockFindUnique.mockResolvedValue(sampleProperty);
    const app = await buildApp();

    const res = await app.request('/api/v1/listings/prop-1');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe('prop-1');
  });

  it('returns 404 when property not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    const app = await buildApp();

    const res = await app.request('/api/v1/listings/nonexistent');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
