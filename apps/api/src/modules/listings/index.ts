import { Hono } from 'hono';
import listingsRoutes from './routes.js';
import filtersRoutes from './filters.js';

const listingsRouter = new Hono();

// GET /api/v1/listings, GET /api/v1/listings/:id
listingsRouter.route('/listings', listingsRoutes);

// POST/GET/PUT/DELETE /api/v1/filters
listingsRouter.route('/filters', filtersRoutes);

export default listingsRouter;
