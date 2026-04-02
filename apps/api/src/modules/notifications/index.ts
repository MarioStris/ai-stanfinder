import { Hono } from 'hono';
import notificationRoutes from './routes.js';

const notificationsRouter = new Hono();

notificationsRouter.route('/', notificationRoutes);

export default notificationsRouter;
