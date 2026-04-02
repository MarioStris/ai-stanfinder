import { Hono } from 'hono';
import matchingRoutes from './routes.js';

const matchingRouter = new Hono();

matchingRouter.route('/', matchingRoutes);

export default matchingRouter;
