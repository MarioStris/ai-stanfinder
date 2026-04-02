import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { AppError } from '../../middleware/error-handler.js';
import { ListingsQuerySchema } from './schemas.js';
import type { Prisma } from '@prisma/client';

const listingsRoutes = new Hono();

listingsRoutes.get('/', zValidator('query', ListingsQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const where = buildWhereClause(query);

  const take = query.limit + 1;
  const cursorArg = query.cursor ? { id: query.cursor } : undefined;

  const items = await db.property.findMany({
    where,
    take,
    skip: cursorArg ? 1 : 0,
    cursor: cursorArg,
    orderBy: { createdAt: 'desc' },
  });

  const hasNextPage = items.length > query.limit;
  const data = hasNextPage ? items.slice(0, query.limit) : items;
  const nextCursor = hasNextPage ? data[data.length - 1]?.id : undefined;

  return c.json({
    data,
    error: null,
    meta: { cursor: nextCursor ?? null, hasNextPage, limit: query.limit },
  });
});

listingsRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  const property = await db.property.findUnique({ where: { id } });

  if (!property) {
    throw new AppError(404, 'NOT_FOUND', 'Listing not found');
  }

  return c.json({ data: property, error: null, meta: null });
});

function buildWhereClause(query: z.infer<typeof ListingsQuerySchema>): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { isActive: true };

  if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
  if (query.propertyType) where.propertyType = query.propertyType;
  if (query.priceMin !== undefined || query.priceMax !== undefined) {
    where.price = {};
    if (query.priceMin !== undefined) where.price.gte = query.priceMin;
    if (query.priceMax !== undefined) where.price.lte = query.priceMax;
  }
  if (query.areaMin !== undefined || query.areaMax !== undefined) {
    where.area = {};
    if (query.areaMin !== undefined) where.area.gte = query.areaMin;
    if (query.areaMax !== undefined) where.area.lte = query.areaMax;
  }

  return where;
}

export default listingsRoutes;
