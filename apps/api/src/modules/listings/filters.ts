import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../../lib/db.js';
import { AppError } from '../../middleware/error-handler.js';
import { requireAuth } from '../../middleware/auth.js';
import { CreateFilterSchema, UpdateFilterSchema } from './schemas.js';

const filtersRoutes = new Hono();

filtersRoutes.use('*', requireAuth);

const FREE_FILTER_LIMIT = 1;

filtersRoutes.post('/', zValidator('json', CreateFilterSchema), async (c) => {
  const user = c.get('user' as never) as { dbId: string; tier: string };
  const body = c.req.valid('json');

  if (user.tier === 'FREE') {
    const count = await db.filter.count({ where: { userId: user.dbId, isActive: true } });
    if (count >= FREE_FILTER_LIMIT) {
      throw new AppError(403, 'FILTER_LIMIT_REACHED', 'Free tier allows only 1 active filter');
    }
  }

  const filter = await db.filter.create({
    data: {
      userId: user.dbId,
      name: body.name,
      city: body.city,
      propertyType: body.propertyType,
      priceMin: body.priceMin,
      priceMax: body.priceMax,
      areaMin: body.areaMin,
      areaMax: body.areaMax,
      freeText: body.description,
    },
  });

  return c.json({ data: filter, error: null, meta: null }, 201);
});

filtersRoutes.get('/', async (c) => {
  const user = c.get('user' as never) as { dbId: string };

  const filters = await db.filter.findMany({
    where: { userId: user.dbId },
    orderBy: { createdAt: 'desc' },
  });

  return c.json({ data: filters, error: null, meta: { total: filters.length } });
});

filtersRoutes.get('/:id', async (c) => {
  const user = c.get('user' as never) as { dbId: string };
  const id = c.req.param('id');

  const filter = await db.filter.findUnique({ where: { id } });

  if (!filter) throw new AppError(404, 'NOT_FOUND', 'Filter not found');
  if (filter.userId !== user.dbId) throw new AppError(403, 'FORBIDDEN', 'Access denied');

  return c.json({ data: filter, error: null, meta: null });
});

filtersRoutes.put('/:id', zValidator('json', UpdateFilterSchema), async (c) => {
  const user = c.get('user' as never) as { dbId: string };
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await db.filter.findUnique({ where: { id } });

  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Filter not found');
  if (existing.userId !== user.dbId) throw new AppError(403, 'FORBIDDEN', 'Access denied');

  const updated = await db.filter.update({
    where: { id },
    data: {
      name: body.name,
      city: body.city,
      propertyType: body.propertyType,
      priceMin: body.priceMin,
      priceMax: body.priceMax,
      areaMin: body.areaMin,
      areaMax: body.areaMax,
      freeText: body.description,
    },
  });

  return c.json({ data: updated, error: null, meta: null });
});

filtersRoutes.delete('/:id', async (c) => {
  const user = c.get('user' as never) as { dbId: string };
  const id = c.req.param('id');

  const existing = await db.filter.findUnique({ where: { id } });

  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Filter not found');
  if (existing.userId !== user.dbId) throw new AppError(403, 'FORBIDDEN', 'Access denied');

  await db.filter.delete({ where: { id } });

  return c.body(null, 204);
});

export default filtersRoutes;
