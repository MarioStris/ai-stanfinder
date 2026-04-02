import { describe, it, expect } from 'vitest';
import { buildMatchingPrompt, toListingSummary } from '../lib/matching-prompt.js';
import type { Filter, Property } from '@prisma/client';

const baseFilter: Filter = {
  id: 'filter-1',
  userId: 'user-1',
  name: 'Zagreb stan',
  city: 'Zagreb',
  propertyType: 'APARTMENT',
  priceMin: 100000,
  priceMax: 300000,
  areaMin: 50,
  areaMax: 100,
  rooms: 2,
  freeText: 'blizina centra, mirna ulica',
  isNewBuild: false,
  isActive: true,
  filterHash: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseProperty: Property = {
  id: 'prop-1',
  externalId: 'ext-1',
  source: 'NJUSKALO',
  sourceUrl: 'https://njuskalo.hr/1',
  title: 'Stan u centru',
  description: 'Lijepi stan blizu centra',
  propertyType: 'APARTMENT',
  city: 'Zagreb',
  neighborhood: 'Gornji Grad',
  address: null,
  price: 200000,
  area: 65,
  pricePerM2: 3077,
  rooms: 2,
  floor: 3,
  totalFloors: 5,
  yearBuilt: 2005,
  isNewBuild: false,
  condition: 'excellent',
  hasParking: true,
  hasBalcony: true,
  hasElevator: false,
  images: [],
  agentName: null,
  agentPhone: null,
  agentEmail: null,
  isActive: true,
  firstSeenAt: new Date(),
  lastSeenAt: new Date(),
  deactivatedAt: null,
  rawData: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('buildMatchingPrompt', () => {
  it('includes filter city in prompt', () => {
    const prompt = buildMatchingPrompt(baseFilter, [toListingSummary(baseProperty)]);
    expect(prompt).toContain('Zagreb');
  });

  it('includes price range in prompt', () => {
    const prompt = buildMatchingPrompt(baseFilter, [toListingSummary(baseProperty)]);
    expect(prompt).toContain('100000');
    expect(prompt).toContain('300000');
  });

  it('includes free text in prompt', () => {
    const prompt = buildMatchingPrompt(baseFilter, [toListingSummary(baseProperty)]);
    expect(prompt).toContain('blizina centra');
  });

  it('includes listing id in prompt', () => {
    const prompt = buildMatchingPrompt(baseFilter, [toListingSummary(baseProperty)]);
    expect(prompt).toContain('prop-1');
  });

  it('includes JSON output format instruction', () => {
    const prompt = buildMatchingPrompt(baseFilter, [toListingSummary(baseProperty)]);
    expect(prompt).toContain('listingId');
    expect(prompt).toContain('score');
    expect(prompt).toContain('comment');
  });

  it('handles multiple listings', () => {
    const listings = [1, 2, 3].map((i) => toListingSummary({ ...baseProperty, id: `prop-${i}` }));
    const prompt = buildMatchingPrompt(baseFilter, listings);
    expect(prompt).toContain('prop-1');
    expect(prompt).toContain('prop-2');
    expect(prompt).toContain('prop-3');
    expect(prompt).toContain('3 oglasa');
  });

  it('handles filter with no city', () => {
    const filterNoCity: Filter = { ...baseFilter, city: null };
    const prompt = buildMatchingPrompt(filterNoCity, [toListingSummary(baseProperty)]);
    expect(prompt).not.toContain('Grad:');
  });

  it('handles filter with no price range', () => {
    const filterNoPrice: Filter = { ...baseFilter, priceMin: null, priceMax: null };
    const prompt = buildMatchingPrompt(filterNoPrice, [toListingSummary(baseProperty)]);
    expect(prompt).not.toContain('Raspon cijene');
  });

  it('truncates long descriptions to 300 chars', () => {
    const longDesc = 'A'.repeat(500);
    const listing = toListingSummary({ ...baseProperty, description: longDesc });
    const prompt = buildMatchingPrompt(baseFilter, [listing]);
    const descInPrompt = prompt.indexOf('A'.repeat(300));
    expect(descInPrompt).toBeGreaterThan(-1);
    expect(prompt).not.toContain('A'.repeat(301));
  });
});

describe('toListingSummary', () => {
  it('maps all required fields', () => {
    const summary = toListingSummary(baseProperty);
    expect(summary.id).toBe('prop-1');
    expect(summary.title).toBe('Stan u centru');
    expect(summary.city).toBe('Zagreb');
    expect(summary.price).toBe(200000);
    expect(summary.area).toBe(65);
    expect(summary.hasParking).toBe(true);
  });
});
