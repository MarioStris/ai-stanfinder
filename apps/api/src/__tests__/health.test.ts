import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';

function buildApp() {
  const app = new Hono();

  app.get('/api/health', (c) => {
    return c.json({
      data: {
        status: 'ok',
        version: '0.0.1',
        timestamp: new Date().toISOString(),
      },
      error: null,
      meta: null,
    });
  });

  return app;
}

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const app = buildApp();
    const res = await app.request('/api/health');

    expect(res.status).toBe(200);
  });

  it('returns correct response shape', async () => {
    const app = buildApp();
    const res = await app.request('/api/health');
    const body = await res.json();

    expect(body).toMatchObject({
      data: {
        status: 'ok',
        version: expect.any(String),
        timestamp: expect.any(String),
      },
      error: null,
      meta: null,
    });
  });

  it('timestamp is a valid ISO string', async () => {
    const app = buildApp();
    const res = await app.request('/api/health');
    const body = await res.json();
    const parsed = new Date(body.data.timestamp);

    expect(parsed).toBeInstanceOf(Date);
    expect(isNaN(parsed.getTime())).toBe(false);
  });
});
