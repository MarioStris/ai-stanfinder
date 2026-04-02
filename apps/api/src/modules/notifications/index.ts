import { Hono } from 'hono';

const notificationsRouter = new Hono();

// GET   /api/v1/notifications         — list user notifications (paginated)
// PATCH /api/v1/notifications/:id/read — mark as read
// POST  /api/v1/push-tokens           — register Expo push token
// DELETE /api/v1/push-tokens/:token   — remove push token

export default notificationsRouter;
