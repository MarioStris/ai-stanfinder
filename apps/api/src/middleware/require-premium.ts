import type { Context, Next } from 'hono';
import { AppError } from './error-handler.js';

export async function requirePremium(c: Context, next: Next): Promise<void> {
  const user = c.get('user' as never) as { dbId: string; tier: string } | undefined;

  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  if (user.tier !== 'PREMIUM') {
    throw new AppError(
      403,
      'PREMIUM_REQUIRED',
      'This feature requires a Premium subscription',
    );
  }

  await next();
}
