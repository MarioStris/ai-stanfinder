import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpsert = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdateMany = vi.fn();

vi.mock('../lib/db.js', () => ({
  db: {
    property: {
      upsert: mockUpsert,
      findUnique: mockFindUnique,
      updateMany: mockUpdateMany,
    },
  },
}));

import { processIngestJob } from '../workers/ingest.worker.js';
import type { Job } from 'bullmq';
import type { IngestJobData } from '../workers/ingest.worker.js';

function makeJob(data: IngestJobData): Job<IngestJobData> {
  return { data, id: 'test-job' } as unknown as Job<IngestJobData>;
}

describe('processIngestJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateMany.mockResolvedValue({ count: 0 });
  });

  it('creates new property when not existing', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockUpsert.mockResolvedValue({ id: 'prop-1' });

    const job = makeJob({
      rows: [{ id: '123', title: 'Test', city: 'Zagreb', price: '100000', area: '60', propertyType: 'APARTMENT' }],
      source: 'NJUSKALO',
      ingestedAt: new Date().toISOString(),
    });

    const stats = await processIngestJob(job);

    expect(stats.processed).toBe(1);
    expect(stats.created).toBe(1);
    expect(stats.updated).toBe(0);
    expect(mockUpsert).toHaveBeenCalledOnce();
  });

  it('increments updated count when property exists', async () => {
    mockFindUnique.mockResolvedValue({ id: 'existing-prop' });
    mockUpsert.mockResolvedValue({ id: 'existing-prop' });

    const job = makeJob({
      rows: [{ id: '123', title: 'Test', city: 'Zagreb', price: '100000', area: '60' }],
      source: 'NJUSKALO',
      ingestedAt: new Date().toISOString(),
    });

    const stats = await processIngestJob(job);

    expect(stats.updated).toBe(1);
    expect(stats.created).toBe(0);
  });

  it('counts deactivated stale properties', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockUpsert.mockResolvedValue({ id: 'prop-1' });
    mockUpdateMany.mockResolvedValue({ count: 3 });

    const job = makeJob({
      rows: [{ id: '999', title: 'New', city: 'Split', price: '50000', area: '40' }],
      source: 'CROZILLA',
      ingestedAt: new Date().toISOString(),
    });

    const stats = await processIngestJob(job);

    expect(stats.deactivated).toBe(3);
  });

  it('increments errors on bad rows without throwing', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockUpsert.mockRejectedValue(new Error('DB error'));

    const job = makeJob({
      rows: [{ id: '1', title: 'OK', city: 'Zagreb', price: '100', area: '50' }],
      source: 'NJUSKALO',
      ingestedAt: new Date().toISOString(),
    });

    const stats = await processIngestJob(job);

    expect(stats.errors).toBe(1);
    expect(stats.processed).toBe(0);
  });

  it('skips row with missing id field', async () => {
    const job = makeJob({
      rows: [{ title: 'No ID', city: 'Zagreb', price: '100', area: '50' }],
      source: 'NJUSKALO',
      ingestedAt: new Date().toISOString(),
    });

    const stats = await processIngestJob(job);

    expect(stats.errors).toBe(1);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('builds compound externalId from source and originalId', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockUpsert.mockResolvedValue({ id: 'p' });

    const job = makeJob({
      rows: [{ id: 'abc-123', title: 'T', city: 'Zagreb', price: '1', area: '1' }],
      source: 'CROZILLA',
      ingestedAt: new Date().toISOString(),
    });

    await processIngestJob(job);

    const upsertArgs = mockUpsert.mock.calls[0][0];
    expect(upsertArgs.where.externalId).toBe('CROZILLA::abc-123');
  });
});
