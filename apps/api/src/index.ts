import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/error-handler.js';
import { rateLimitMiddleware } from './middleware/rate-limit.js';
import { startWorkers } from './workers/index.js';
import { initScheduler } from './lib/scheduler.js';
import authRouter from './modules/auth/index.js';
import listingsRouter from './modules/listings/index.js';
import scrapingRouter from './modules/scraping/index.js';
import matchingRouter from './modules/matching/index.js';
import billingRouter from './modules/billing/index.js';
import notificationsRouter from './modules/notifications/index.js';

const app = new Hono();

app.use('*', corsMiddleware);
app.use('*', rateLimitMiddleware);

app.get('/api/health', (c) => {
  return c.json({
    data: {
      status: 'ok',
      version: process.env.npm_package_version ?? '0.0.1',
      timestamp: new Date().toISOString(),
    },
    error: null,
    meta: null,
  });
});

app.route('/api/v1', authRouter);
app.route('/api/v1', listingsRouter);
app.route('/api/v1', scrapingRouter);
app.route('/api/v1', matchingRouter);
app.route('/api/v1', billingRouter);
app.route('/api/v1', notificationsRouter);

app.onError(errorHandler);

app.notFound((c) => {
  return c.json(
    { data: null, error: { code: 'NOT_FOUND', message: 'Route not found' }, meta: null },
    404,
  );
});

const port = parseInt(process.env.PORT ?? '3001', 10);

serve({ fetch: app.fetch, port }, async (info) => {
  console.log(`API server running on http://localhost:${info.port}`);
  startWorkers();
  await initScheduler();
});

export default app;
