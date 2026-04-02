import { cors } from 'hono/cors';

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin) => {
    if (process.env.NODE_ENV === 'development') return origin;
    if (allowedOrigins.includes(origin)) return origin;
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['X-Request-Id'],
  maxAge: 86400,
  credentials: true,
});
