import { Hono } from 'hono';
import billingRoutes from './routes.js';

const billingRouter = new Hono();

billingRouter.route('/', billingRoutes);

export default billingRouter;
