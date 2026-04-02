import { Hono } from 'hono';
import { AppError } from '../../middleware/error-handler.js';
import { getQueue, QUEUE_NAMES } from '../../lib/queue.js';
import { parseCsv } from '../../lib/csv-parser.js';

const ingestRoutes = new Hono();

function validateApiKey(c: { req: { header: (name: string) => string | undefined } }): void {
  const key = c.req.header('X-API-Key');
  const expected = process.env.INGEST_API_KEY;

  if (!expected) throw new AppError(500, 'CONFIG_ERROR', 'INGEST_API_KEY not configured');
  if (!key || key !== expected) throw new AppError(401, 'UNAUTHORIZED', 'Invalid API key');
}

ingestRoutes.post('/', async (c) => {
  validateApiKey(c);

  const contentType = c.req.header('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    throw new AppError(400, 'INVALID_CONTENT_TYPE', 'Expected multipart/form-data');
  }

  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    throw new AppError(400, 'MISSING_FILE', 'CSV file is required in "file" field');
  }

  const source = (formData.get('source') as string) ?? 'NJUSKALO';
  const csvText = await (file as File).text();
  const rows = parseCsv(csvText);

  if (rows.length === 0) {
    throw new AppError(400, 'EMPTY_CSV', 'CSV file contains no data rows');
  }

  const queue = getQueue(QUEUE_NAMES.INGEST);
  const job = await queue.add('process-csv', { rows, source, ingestedAt: new Date().toISOString() });

  return c.json(
    { data: { jobId: job.id, rowCount: rows.length, source }, error: null, meta: null },
    202,
  );
});

export default ingestRoutes;
