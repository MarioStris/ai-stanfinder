import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

const mockAdd = vi.fn().mockResolvedValue({ id: 'job-123' });

vi.mock('../lib/queue.js', () => ({
  getQueue: vi.fn(() => ({ add: mockAdd })),
  QUEUE_NAMES: { INGEST: 'ingest', MATCHING: 'matching', NOTIFICATIONS: 'notifications' },
}));

vi.mock('../lib/csv-parser.js', () => ({
  parseCsv: vi.fn(() => [
    { id: '1', title: 'Apt Zagreb', city: 'Zagreb', price: '100000', area: '60', propertyType: 'APARTMENT' },
    { id: '2', title: 'House Split', city: 'Split', price: '200000', area: '120', propertyType: 'HOUSE' },
  ]),
}));

process.env.INGEST_API_KEY = 'test-api-key-123';

async function buildApp() {
  const { default: ingestRoutes } = await import('../modules/scraping/ingest.js');
  const app = new Hono();
  app.route('/api/v1/ingest', ingestRoutes);
  return app;
}

describe('POST /api/v1/ingest', () => {
  beforeEach(() => {
    mockAdd.mockClear();
  });

  it('returns 401 when API key is missing', async () => {
    const app = await buildApp();
    const formData = new FormData();
    formData.append('file', new Blob(['id,title\n1,test'], { type: 'text/csv' }), 'test.csv');

    const res = await app.request('/api/v1/ingest', { method: 'POST', body: formData });
    expect(res.status).toBe(401);
  });

  it('returns 401 when API key is wrong', async () => {
    const app = await buildApp();
    const formData = new FormData();
    formData.append('file', new Blob(['id,title\n1,test'], { type: 'text/csv' }), 'test.csv');

    const res = await app.request('/api/v1/ingest', {
      method: 'POST',
      body: formData,
      headers: { 'X-API-Key': 'wrong-key' },
    });
    expect(res.status).toBe(401);
  });

  it('returns 202 with job ID on valid request', async () => {
    const app = await buildApp();
    const formData = new FormData();
    formData.append('file', new Blob(['id,title\n1,test'], { type: 'text/csv' }), 'test.csv');

    const res = await app.request('/api/v1/ingest', {
      method: 'POST',
      body: formData,
      headers: { 'X-API-Key': 'test-api-key-123' },
    });

    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.data.jobId).toBe('job-123');
    expect(body.data.rowCount).toBe(2);
    expect(mockAdd).toHaveBeenCalledOnce();
  });

  it('enqueues job with correct data shape', async () => {
    const app = await buildApp();
    const formData = new FormData();
    formData.append('file', new Blob(['id,title\n1,test'], { type: 'text/csv' }), 'test.csv');
    formData.append('source', 'CROZILLA');

    await app.request('/api/v1/ingest', {
      method: 'POST',
      body: formData,
      headers: { 'X-API-Key': 'test-api-key-123' },
    });

    const callArgs = mockAdd.mock.calls[0];
    expect(callArgs?.[1]).toMatchObject({ source: 'CROZILLA', rows: expect.any(Array) });
  });
});
