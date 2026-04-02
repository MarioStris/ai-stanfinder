import { createWorker, QUEUE_NAMES } from '../lib/queue.js';
import { processIngestJob, type IngestJobData } from './ingest.worker.js';
import { processMatchingJob, type MatchingJobData } from './matching.worker.js';
import type { Worker } from 'bullmq';

const workers: Worker[] = [];

export function startWorkers(): void {
  const ingestWorker = createWorker<IngestJobData>(QUEUE_NAMES.INGEST, processIngestJob);

  ingestWorker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed on queue "${QUEUE_NAMES.INGEST}"`);
  });

  ingestWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed on queue "${QUEUE_NAMES.INGEST}":`, err.message);
  });

  workers.push(ingestWorker);
  console.log('[Workers] Ingest worker registered');

  const matchingWorker = createWorker<MatchingJobData>(QUEUE_NAMES.MATCHING, processMatchingJob);

  matchingWorker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed on queue "${QUEUE_NAMES.MATCHING}"`);
  });

  matchingWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed on queue "${QUEUE_NAMES.MATCHING}":`, err.message);
  });

  workers.push(matchingWorker);
  console.log('[Workers] Matching worker registered');
}

export async function stopWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
  workers.length = 0;
  console.log('[Workers] All workers stopped');
}
