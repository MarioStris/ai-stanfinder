import { Redis } from 'ioredis';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  redisClient = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redisClient.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected');
  });

  return redisClient;
}

// BullMQ workers require maxRetriesPerRequest: null
export function getBullMQConnection(): Redis {
  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  return new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
  });
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
