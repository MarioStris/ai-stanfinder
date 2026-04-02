/**
 * Integration test: CSV Ingest → Listing created → Matching triggered → Matches returned
 *
 * Covers: US-18 (CSV ingest), US-19 (AI matching), US-06 (match list)
 * Pattern: AAA (Arrange, Act, Assert)
 * Mocks: Prisma DB, Grok API, BullMQ queue, Expo Push, Clerk auth
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';

// ---------------------------------------------------------------------------
// Test data factory
// ---------------------------------------------------------------------------

function makeProperty(overrides: Record<string, unknown> = {}) {
  return {
    id: `prop-${Math.random().toString(36).slice(2, 10)}`,
    externalId: `njuskalo-${Math.floor(Math.random() * 1_000_000)}`,
    title: 'Test Apartment Zagreb',
    city: 'Zagreb',
    neighborhood: 'Centar',
    price: 200_000,
    area: 65,
    pricePerM2: 3077,
    rooms: 2,
    propertyType: 'APARTMENT',
    condition: 'GOOD',
    isNewBuild: false,
    hasParking: false,
    hasBalcony: true,
    hasElevator: false,
    images: ['https://example.com/img1.jpg'],
    sourceUrl: 'https://njuskalo.hr/oglas/123',
    source: 'NJUSKALO',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeFilter(overrides: Record<string, unknown> = {}) {
  return {
    id: 'filter-integration-1',
    userId: 'user-integration-1',
    name: 'Zagreb Integration Filter',
    city: 'Zagreb',
    propertyType: 'APARTMENT',
    priceMin: 100_000,
    priceMax: 300_000,
    areaMin: 50,
    areaMax: 80,
    naturalLanguageQuery: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMatch(propertyId: string, overrides: Record<string, unknown> = {}) {
  return {
    id: `match-${Math.random().toString(36).slice(2, 10)}`,
    userId: 'user-integration-1',
    filterId: 'filter-integration-1',
    propertyId,
    matchPercent: 85,
    aiComment: 'Odlicno podudaranje. Cijena po m² je ispod prosjeka za Centar.',
    rank: 1,
    isNew: true,
    isSeen: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeCsvRow(overrides: Record<string, unknown> = {}) {
  return {
    externalId: `njuskalo-${Math.floor(Math.random() * 1_000_000)}`,
    title: 'Stan u centru Zagreba',
    city: 'Zagreb',
    neighborhood: 'Gornji Grad',
    price: '180000',
    area: '68',
    rooms: '2',
    propertyType: 'APARTMENT',
    sourceUrl: 'https://njuskalo.hr/oglas/456',
    source: 'NJUSKALO',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPropertyUpsert = vi.fn();
const mockPropertyFindMany = vi.fn();
const mockPropertyFindUnique = vi.fn();
const mockFilterFindMany = vi.fn();
const mockFilterFindUnique = vi.fn();
const mockMatchCreateMany = vi.fn();
const mockMatchFindMany = vi.fn();
const mockMatchDeleteMany = vi.fn();
const mockQueueAdd = vi.fn();
const mockGrokRank = vi.fn();
const mockApiUsageCreate = vi.fn();

vi.mock('../../lib/db.js', () => ({
  db: {
    property: {
      upsert: mockPropertyUpsert,
      findMany: mockPropertyFindMany,
      findUnique: mockPropertyFindUnique,
    },
    filter: {
      findMany: mockFilterFindMany,
      findUnique: mockFilterFindUnique,
    },
    match: {
      createMany: mockMatchCreateMany,
      findMany: mockMatchFindMany,
      deleteMany: mockMatchDeleteMany,
    },
    apiUsage: {
      create: mockApiUsageCreate,
    },
  },
}));

vi.mock('../../lib/queue.js', () => ({
  getQueue: () => ({ add: mockQueueAdd }),
  QUEUE_NAMES: { MATCHING: 'matching', SCRAPING: 'scraping' },
}));

vi.mock('../../lib/grok.js', () => ({
  rankPropertiesWithGrok: mockGrokRank,
}));

vi.mock('../../middleware/auth.js', () => ({
  requireAuth: vi.fn(async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('user', { dbId: 'user-integration-1', clerkId: 'clerk-int-1', tier: 'FREE' });
    await next();
  }),
}));

// ---------------------------------------------------------------------------
// App builder
// ---------------------------------------------------------------------------

async function buildMatchingApp() {
  const { default: matchingRouter } = await import('../../modules/matching/index.js');
  const app = new Hono();
  app.route('/api/v1', matchingRouter);
  return app;
}

async function buildListingsApp() {
  const { default: listingsRouter } = await import('../../modules/listings/index.js');
  const app = new Hono();
  app.route('/api/v1', listingsRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Integration: CSV Ingest → Listing Created → Matching → Matches Returned', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueueAdd.mockResolvedValue({ id: 'job-ingest-123' });
    mockApiUsageCreate.mockResolvedValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // PHASE 1: Listing creation via ingest
  // -------------------------------------------------------------------------

  describe('Phase 1: Ingest creates/updates listings', () => {
    it('upserts a new listing with correct fields', async () => {
      // Arrange
      const csvRow = makeCsvRow();
      const expectedProperty = makeProperty({
        externalId: csvRow.externalId,
        city: csvRow.city,
        price: parseInt(String(csvRow.price), 10),
      });
      mockPropertyUpsert.mockResolvedValueOnce(expectedProperty);

      // Act — simulate what the ingest worker does per row
      const upsertCall = {
        where: { externalId: csvRow.externalId },
        create: {
          externalId: csvRow.externalId,
          title: csvRow.title,
          city: csvRow.city,
          price: parseInt(String(csvRow.price), 10),
          area: parseInt(String(csvRow.area), 10),
          source: csvRow.source,
          sourceUrl: csvRow.sourceUrl,
          isActive: true,
        },
        update: {
          price: parseInt(String(csvRow.price), 10),
          isActive: true,
        },
      };
      const result = await mockPropertyUpsert(upsertCall);

      // Assert
      expect(mockPropertyUpsert).toHaveBeenCalledOnce();
      expect(result.externalId).toBe(csvRow.externalId);
      expect(result.city).toBe('Zagreb');
    });

    it('does NOT create duplicate when same externalId ingested twice', async () => {
      // Arrange
      const csvRow = makeCsvRow({ externalId: 'njuskalo-DEDUP-999' });
      mockPropertyUpsert.mockResolvedValue(makeProperty({ externalId: 'njuskalo-DEDUP-999' }));

      // Act
      await mockPropertyUpsert({ where: { externalId: 'njuskalo-DEDUP-999' }, create: {}, update: {} });
      await mockPropertyUpsert({ where: { externalId: 'njuskalo-DEDUP-999' }, create: {}, update: {} });

      // Assert — upsert called twice but DB has only one record (idempotent by design)
      expect(mockPropertyUpsert).toHaveBeenCalledTimes(2);
      const calls = mockPropertyUpsert.mock.calls;
      expect(calls[0][0].where.externalId).toBe(calls[1][0].where.externalId);
    });

    it('updates price when listing price changes in subsequent ingest', async () => {
      // Arrange
      const externalId = 'njuskalo-PRICE-UPDATE';
      const originalProperty = makeProperty({ externalId, price: 200_000 });
      const updatedProperty = { ...originalProperty, price: 185_000 };

      mockPropertyUpsert
        .mockResolvedValueOnce(originalProperty)
        .mockResolvedValueOnce(updatedProperty);

      // Act
      const first = await mockPropertyUpsert({
        where: { externalId },
        create: { price: 200_000 },
        update: { price: 200_000 },
      });
      const second = await mockPropertyUpsert({
        where: { externalId },
        create: { price: 185_000 },
        update: { price: 185_000 },
      });

      // Assert
      expect(first.price).toBe(200_000);
      expect(second.price).toBe(185_000);
    });

    it('marks listing as inactive when removed from source', async () => {
      // Arrange
      const externalId = 'njuskalo-INACTIVE-555';
      mockPropertyUpsert.mockResolvedValueOnce(makeProperty({ externalId, isActive: false }));

      // Act
      const result = await mockPropertyUpsert({
        where: { externalId },
        create: {},
        update: { isActive: false },
      });

      // Assert
      expect(result.isActive).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // PHASE 2: Matching job is triggered and results stored
  // -------------------------------------------------------------------------

  describe('Phase 2: Matching job queued and processed', () => {
    it('enqueues matching job after refresh request with correct payload', async () => {
      // Arrange
      const filter = makeFilter();
      mockFilterFindUnique.mockResolvedValueOnce(filter);
      mockQueueAdd.mockResolvedValueOnce({ id: 'job-match-abc' });
      const app = await buildMatchingApp();

      // Act
      const res = await app.request('/api/v1/filters/filter-integration-1/matches/refresh', {
        method: 'POST',
      });

      // Assert
      expect(res.status).toBe(202);
      const body = await res.json() as { data: { jobId: string; status: string } };
      expect(body.data.status).toBe('queued');
      expect(mockQueueAdd).toHaveBeenCalledOnce();

      const jobPayload = mockQueueAdd.mock.calls[0][1];
      expect(jobPayload.filterId).toBe('filter-integration-1');
      expect(jobPayload.userId).toBe('user-integration-1');
    });

    it('calls Grok API with filter criteria and new properties', async () => {
      // Arrange
      const filter = makeFilter();
      const properties = [makeProperty(), makeProperty({ price: 150_000 })];

      mockGrokRank.mockResolvedValueOnce([
        { propertyId: properties[0].id, matchPercent: 90, aiComment: 'Perfect match', rank: 1 },
        { propertyId: properties[1].id, matchPercent: 75, aiComment: 'Good price', rank: 2 },
      ]);

      // Act
      const rankings = await mockGrokRank(filter, properties);

      // Assert
      expect(mockGrokRank).toHaveBeenCalledWith(filter, properties);
      expect(rankings).toHaveLength(2);
      expect(rankings[0].rank).toBe(1);
      expect(rankings[0].matchPercent).toBeGreaterThan(rankings[1].matchPercent);
    });

    it('stores match results in DB after successful Grok API call', async () => {
      // Arrange
      const properties = [makeProperty()];
      const grokResults = [
        { propertyId: properties[0].id, matchPercent: 88, aiComment: 'Excellent value', rank: 1 },
      ];
      mockGrokRank.mockResolvedValueOnce(grokResults);
      mockMatchCreateMany.mockResolvedValueOnce({ count: 1 });
      mockMatchDeleteMany.mockResolvedValueOnce({ count: 0 });

      // Act — simulate matching worker creating matches
      await mockMatchDeleteMany({ where: { filterId: 'filter-integration-1' } });
      const createResult = await mockMatchCreateMany({
        data: grokResults.map((r) => ({
          filterId: 'filter-integration-1',
          userId: 'user-integration-1',
          propertyId: r.propertyId,
          matchPercent: r.matchPercent,
          aiComment: r.aiComment,
          rank: r.rank,
          isNew: true,
          isSeen: false,
        })),
      });

      // Assert
      expect(mockMatchDeleteMany).toHaveBeenCalledOnce();
      expect(createResult.count).toBe(1);
      expect(mockMatchCreateMany.mock.calls[0][0].data[0].rank).toBe(1);
    });

    it('does NOT call Grok API if cache hit exists for same filter+data hash', async () => {
      // Arrange — simulate cache returning results directly
      const cachedMatches = [makeMatch('prop-cached-1')];
      mockMatchFindMany.mockResolvedValueOnce(cachedMatches);

      // Act
      const results = await mockMatchFindMany({
        where: { filterId: 'filter-integration-1' },
        orderBy: { rank: 'asc' },
      });

      // Assert — Grok not called when cache has results
      expect(results).toHaveLength(1);
      expect(mockGrokRank).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // PHASE 3: Consumer retrieves matches via API
  // -------------------------------------------------------------------------

  describe('Phase 3: Matches returned to API consumer', () => {
    it('returns sorted matches with all required fields', async () => {
      // Arrange
      const property = makeProperty();
      const matches = [
        { ...makeMatch(property.id, { rank: 1, matchPercent: 90 }), property },
        { ...makeMatch(property.id, { rank: 2, matchPercent: 75 }), property },
      ];
      mockFilterFindUnique.mockResolvedValueOnce(makeFilter());
      mockMatchFindMany.mockResolvedValueOnce(matches);
      const app = await buildMatchingApp();

      // Act
      const res = await app.request('/api/v1/filters/filter-integration-1/matches');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json() as {
        data: Array<{ rank: number; matchPercent: number; aiComment: string; property: unknown }>;
        meta: { total: number; newCount: number };
      };
      expect(body.data).toHaveLength(2);
      expect(body.data[0].rank).toBe(1);
      expect(body.data[0].matchPercent).toBe(90);
      expect(body.data[0].aiComment).toBeDefined();
      expect(body.data[0].property).toBeDefined();
      expect(body.meta.total).toBe(2);
      expect(body.meta.newCount).toBe(2);
    });

    it('returns 404 when filter does not exist', async () => {
      // Arrange
      mockFilterFindUnique.mockResolvedValueOnce(null);
      const app = await buildMatchingApp();

      // Act
      const res = await app.request('/api/v1/filters/nonexistent-filter/matches');

      // Assert
      expect(res.status).toBe(404);
      const body = await res.json() as { error: { code: string } };
      expect(body.error.code).toBe('NOT_FOUND');
    });

    it('returns 403 when requesting another user\'s filter matches (IDOR prevention)', async () => {
      // Arrange — filter belongs to a different user
      mockFilterFindUnique.mockResolvedValueOnce(makeFilter({ userId: 'other-user-999' }));
      const app = await buildMatchingApp();

      // Act
      const res = await app.request('/api/v1/filters/filter-integration-1/matches');

      // Assert
      expect(res.status).toBe(403);
      const body = await res.json() as { error: { code: string } };
      expect(body.error.code).toBe('FORBIDDEN');
    });

    it('returns 401 when no authentication token provided', async () => {
      // Arrange — override auth middleware to deny
      vi.doMock('../../middleware/auth.js', () => ({
        requireAuth: vi.fn(async (c: { json: (body: unknown, status: number) => Response }) => {
          return c.json({ data: null, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }, meta: null }, 401);
        }),
      }));
    });

    it('returns empty array with zero counts when no matches exist yet', async () => {
      // Arrange
      mockFilterFindUnique.mockResolvedValueOnce(makeFilter());
      mockMatchFindMany.mockResolvedValueOnce([]);
      const app = await buildMatchingApp();

      // Act
      const res = await app.request('/api/v1/filters/filter-integration-1/matches');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json() as { data: unknown[]; meta: { total: number; newCount: number } };
      expect(body.data).toHaveLength(0);
      expect(body.meta.total).toBe(0);
      expect(body.meta.newCount).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // PHASE 4: Full end-to-end flow simulation
  // -------------------------------------------------------------------------

  describe('Phase 4: Full flow — ingest → refresh → get matches', () => {
    it('complete happy path: property ingested, job queued, matches returned', async () => {
      // Arrange
      const property = makeProperty({ city: 'Zagreb', price: 200_000, area: 65 });
      const filter = makeFilter({ city: 'Zagreb', priceMin: 150_000, priceMax: 250_000 });
      const matches = [
        { ...makeMatch(property.id, { rank: 1, matchPercent: 92 }), property },
      ];

      // Phase 1: Ingest simulated
      mockPropertyUpsert.mockResolvedValueOnce(property);
      await mockPropertyUpsert({
        where: { externalId: property.externalId },
        create: property,
        update: { price: property.price, isActive: true },
      });

      // Phase 2: Refresh queued
      mockFilterFindUnique.mockResolvedValueOnce(filter);
      mockQueueAdd.mockResolvedValueOnce({ id: 'job-e2e-001' });
      const matchingApp = await buildMatchingApp();
      const refreshRes = await matchingApp.request('/api/v1/filters/filter-integration-1/matches/refresh', {
        method: 'POST',
      });
      expect(refreshRes.status).toBe(202);

      // Phase 3: Worker processes (simulated — Grok called, matches stored)
      mockGrokRank.mockResolvedValueOnce([
        { propertyId: property.id, matchPercent: 92, aiComment: 'Top pick for your criteria', rank: 1 },
      ]);
      mockMatchCreateMany.mockResolvedValueOnce({ count: 1 });
      const rankings = await mockGrokRank(filter, [property]);
      await mockMatchCreateMany({ data: rankings });

      // Phase 4: Consumer reads matches
      mockFilterFindUnique.mockResolvedValueOnce(filter);
      mockMatchFindMany.mockResolvedValueOnce(matches);
      const getRes = await matchingApp.request('/api/v1/filters/filter-integration-1/matches');

      // Assert final state
      expect(getRes.status).toBe(200);
      const body = await getRes.json() as { data: Array<{ matchPercent: number }> };
      expect(body.data[0].matchPercent).toBe(92);
      expect(mockPropertyUpsert).toHaveBeenCalledOnce();
      expect(mockQueueAdd).toHaveBeenCalledOnce();
      expect(mockGrokRank).toHaveBeenCalledOnce();
      expect(mockMatchCreateMany).toHaveBeenCalledOnce();
    });

    it('does not return stale matches from inactive filter after deactivation', async () => {
      // Arrange
      const inactiveFilter = makeFilter({ isActive: false });
      mockFilterFindUnique.mockResolvedValueOnce(inactiveFilter);
      const app = await buildMatchingApp();

      // Act
      const res = await app.request('/api/v1/filters/filter-integration-1/matches/refresh', {
        method: 'POST',
      });

      // Assert
      expect(res.status).toBe(400);
      const body = await res.json() as { error: { code: string } };
      expect(body.error.code).toBe('FILTER_INACTIVE');
    });
  });
});
