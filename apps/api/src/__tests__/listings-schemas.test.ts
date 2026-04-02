import { describe, it, expect } from 'vitest';
import { ListingsQuerySchema, CreateFilterSchema, UpdateFilterSchema } from '../modules/listings/schemas.js';

describe('ListingsQuerySchema', () => {
  it('parses valid query with all optional fields omitted', () => {
    const result = ListingsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(20);
  });

  it('coerces string numbers for priceMin/priceMax', () => {
    const result = ListingsQuerySchema.safeParse({ priceMin: '100000', priceMax: '300000' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priceMin).toBe(100000);
      expect(result.data.priceMax).toBe(300000);
    }
  });

  it('rejects invalid propertyType', () => {
    const result = ListingsQuerySchema.safeParse({ propertyType: 'VILLA' });
    expect(result.success).toBe(false);
  });

  it('rejects limit exceeding 100', () => {
    const result = ListingsQuerySchema.safeParse({ limit: '200' });
    expect(result.success).toBe(false);
  });

  it('rejects negative priceMin', () => {
    const result = ListingsQuerySchema.safeParse({ priceMin: '-1' });
    expect(result.success).toBe(false);
  });

  it('accepts valid propertyType APARTMENT', () => {
    const result = ListingsQuerySchema.safeParse({ propertyType: 'APARTMENT' });
    expect(result.success).toBe(true);
  });
});

describe('CreateFilterSchema', () => {
  it('requires name field', () => {
    const result = CreateFilterSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts minimal valid input', () => {
    const result = CreateFilterSchema.safeParse({ name: 'My Filter' });
    expect(result.success).toBe(true);
  });

  it('accepts full valid input', () => {
    const result = CreateFilterSchema.safeParse({
      name: 'Zagreb Apartments',
      city: 'Zagreb',
      propertyType: 'APARTMENT',
      priceMin: 100000,
      priceMax: 300000,
      areaMin: 50,
      areaMax: 100,
      description: 'Looking for a 2-room apartment',
    });
    expect(result.success).toBe(true);
  });

  it('rejects name longer than 100 characters', () => {
    const result = CreateFilterSchema.safeParse({ name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects negative priceMin', () => {
    const result = CreateFilterSchema.safeParse({ name: 'test', priceMin: -100 });
    expect(result.success).toBe(false);
  });
});

describe('UpdateFilterSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = UpdateFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update', () => {
    const result = UpdateFilterSchema.safeParse({ priceMax: 200000 });
    expect(result.success).toBe(true);
  });

  it('rejects invalid propertyType in partial update', () => {
    const result = UpdateFilterSchema.safeParse({ propertyType: 'CABIN' });
    expect(result.success).toBe(false);
  });
});
