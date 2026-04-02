import { Queue, Worker, type Job } from 'bullmq';
import { getRedis, getBullMQConnection } from './redis.js';

const connection = {
  get client() {
    return getRedis();
  },
};

export const QUEUE_NAMES = {
  MATCHING: 'matching',
  NOTIFICATIONS: 'notifications',
  INGEST: 'ingest',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const queues = new Map<string, Queue>();

export function getQueue(name: QueueName): Queue {
  if (queues.has(name)) return queues.get(name)!;

  const queue = new Queue(name, { connection: getRedis() });
  queues.set(name, queue);
  return queue;
}

export function createWorker<T>(
  name: QueueName,
  processor: (job: Job<T>) => Promise<void>,
): Worker<T> {
  return new Worker<T>(name, processor, {
    connection: getBullMQConnection(),
    concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '5', 10),
  });
}

export async function closeQueues(): Promise<void> {
  const closePromises = Array.from(queues.values()).map((q) => q.close());
  await Promise.all(closePromises);
  queues.clear();
}
