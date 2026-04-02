import { Hono } from 'hono';
import ingestRoutes from './ingest.js';

const scrapingRouter = new Hono();

scrapingRouter.route('/ingest', ingestRoutes);

export default scrapingRouter;
