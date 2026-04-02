import type { Context, Next } from 'hono';
import { createClerkClient } from '@clerk/backend';
import { AppError } from './error-handler.js';
import { db } from '../lib/db.js';

let clerkClient: ReturnType<typeof createClerkClient> | null = null;

function getClerk() {
  if (!clerkClient) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) throw new AppError(500, 'CONFIG_ERROR', 'CLERK_SECRET_KEY not configured');
    clerkClient = createClerkClient({ secretKey });
  }
  return clerkClient;
}

function extractBearerToken(c: Context): string {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header');
  }
  return header.slice(7);
}

export async function requireAuth(c: Context, next: Next) {
  const token = extractBearerToken(c);

  let clerkUserId: string;
  try {
    const clerk = getClerk();
    const payload = await clerk.verifyToken(token);
    clerkUserId = payload.sub;
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Token verification failed');
  }

  const dbUser = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { subscription: true },
  });

  if (!dbUser) {
    throw new AppError(401, 'USER_NOT_FOUND', 'User not found — please sync account');
  }

  c.set('user' as never, {
    dbId: dbUser.id,
    clerkId: clerkUserId,
    email: dbUser.email,
    tier: dbUser.subscription?.tier ?? 'FREE',
  });

  await next();
}
