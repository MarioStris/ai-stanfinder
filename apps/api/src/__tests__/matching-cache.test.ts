import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockSetex = vi.fn();
const mockKeys = vi.fn();
const mockPipeline = vi.fn();
const mockPipelineDel = vi.fn();
const mockPipelineExec = vi.fn();

vi.mock('../lib/redis.js', () => ({
  getRedis: () => ({
    get: mockGet,
    setex: mockSetex,
    keys: mockKeys,
    pipeline: mockPipeline,
  }),
}));

mockPipeline.mockReturnValue({
  del: mockPipelineDel,
  exec: mockPipelineExec,
});
mockPipelineDel.mockReturnThis();
mockPipelineExec.mockResolvedValue([]);

import { getCachedMatches, setCachedMatches, invalidateCachedMatches } from '../lib/matching-cache.js';
import type { GrokMatchResult } from '../lib/grok.js';

const sampleMatches: GrokMatchResult[] = [
  { listingId: 'prop-1', score: 92, aiComment: 'Odlično podudaranje s traženim kritrijima.' },
  { listingId: 'prop-2', score: 75, aiComment: 'Dobra opcija, nešto viša cijena.' },
];

describe('getCachedMatches', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null on cache miss', async () => {
    mockGet.mockResolvedValue(null);
    const result = await getCachedMatches('filter-1', ['prop-1', 'prop-2']);
    expect(result).toBeNull();
    expect(mockGet).toHaveBeenCalledOnce();
  });

  it('returns parsed matches on cache hit', async () => {
    mockGet.mockResolvedValue(JSON.stringify(sampleMatches));
    const result = await getCachedMatches('filter-1', ['prop-1', 'prop-2']);
    expect(result).toEqual(sampleMatches);
  });

  it('returns null on invalid JSON in cache', async () => {
    mockGet.mockResolvedValue('{ invalid json }');
    const result = await getCachedMatches('filter-1', ['prop-1']);
    expect(result).toBeNull();
  });

  it('generates same cache key regardless of listing order', async () => {
    mockGet.mockResolvedValue(JSON.stringify(sampleMatches));
    await getCachedMatches('filter-1', ['prop-2', 'prop-1']);
    await getCachedMatches('filter-1', ['prop-1', 'prop-2']);
    const calls = mockGet.mock.calls;
    expect(calls[0][0]).toBe(calls[1][0]);
  });

  it('generates different cache key for different filters', async () => {
    mockGet.mockResolvedValue(null);
    await getCachedMatches('filter-1', ['prop-1']);
    await getCachedMatches('filter-2', ['prop-1']);
    const calls = mockGet.mock.calls;
    expect(calls[0][0]).not.toBe(calls[1][0]);
  });
});

describe('setCachedMatches', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls setex with 900 second TTL', async () => {
    mockSetex.mockResolvedValue('OK');
    await setCachedMatches('filter-1', ['prop-1'], sampleMatches);
    expect(mockSetex).toHaveBeenCalledOnce();
    const [, ttl, value] = mockSetex.mock.calls[0];
    expect(ttl).toBe(900);
    expect(JSON.parse(value)).toEqual(sampleMatches);
  });
});

describe('invalidateCachedMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPipeline.mockReturnValue({
      del: mockPipelineDel.mockReturnThis(),
      exec: mockPipelineExec.mockResolvedValue([]),
    });
  });

  it('does nothing when no keys found', async () => {
    mockKeys.mockResolvedValue([]);
    await invalidateCachedMatches('filter-1');
    expect(mockPipeline).not.toHaveBeenCalled();
  });

  it('deletes all matching keys', async () => {
    mockKeys.mockResolvedValue(['matching:v1:abc123', 'matching:v1:def456']);
    await invalidateCachedMatches('filter-1');
    expect(mockPipelineDel).toHaveBeenCalledTimes(2);
    expect(mockPipelineExec).toHaveBeenCalledOnce();
  });
});
