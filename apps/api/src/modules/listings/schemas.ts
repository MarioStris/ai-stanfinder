import { z } from 'zod';
import { PropertyType } from '@prisma/client';

export const ListingsQuerySchema = z.object({
  city: z.string().min(1).optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().nonnegative().optional(),
  areaMin: z.coerce.number().int().nonnegative().optional(),
  areaMax: z.coerce.number().int().nonnegative().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const CreateFilterSchema = z.object({
  name: z.string().min(1).max(100),
  city: z.string().min(1).max(100).optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().nonnegative().optional(),
  areaMin: z.number().int().nonnegative().optional(),
  areaMax: z.number().int().nonnegative().optional(),
  description: z.string().max(500).optional(),
});

export const UpdateFilterSchema = CreateFilterSchema.partial();

export type ListingsQuery = z.infer<typeof ListingsQuerySchema>;
export type CreateFilterInput = z.infer<typeof CreateFilterSchema>;
export type UpdateFilterInput = z.infer<typeof UpdateFilterSchema>;
