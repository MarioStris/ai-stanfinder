import { Hono } from 'hono';

const billingRouter = new Hono();

// GET  /api/v1/subscription             — get current user subscription
// POST /api/v1/webhooks/revenuecat       — RevenueCat lifecycle webhook
// POST /api/v1/webhooks/clerk            — Clerk user lifecycle webhook

export default billingRouter;
