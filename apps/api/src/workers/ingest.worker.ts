import type { Job } from 'bullmq';
import { PropertyType, PropertySource } from '@prisma/client';
import { db } from '../lib/db.js';
import type { CsvRow } from '../lib/csv-parser.js';

export interface IngestJobData {
  rows: CsvRow[];
  source: string;
  ingestedAt: string;
}

export interface IngestStats {
  processed: number;
  created: number;
  updated: number;
  deactivated: number;
  errors: number;
}

function resolvePropertyType(value: string): PropertyType {
  const normalized = value.toUpperCase();
  if (normalized in PropertyType) return normalized as PropertyType;
  return PropertyType.APARTMENT;
}

function resolveSource(value: string): PropertySource {
  const normalized = value.toUpperCase();
  if (normalized in PropertySource) return normalized as PropertySource;
  return PropertySource.NJUSKALO;
}

function buildExternalId(source: string, originalId: string): string {
  return `${source.toUpperCase()}::${originalId}`;
}

function mapRowToProperty(row: CsvRow, source: string) {
  const originalId = row['id'] ?? row['originalId'] ?? row['externalId'] ?? '';
  if (!originalId) throw new Error('Missing id field in CSV row');

  return {
    externalId: buildExternalId(source, originalId),
    source: resolveSource(source),
    sourceUrl: row['sourceUrl'] ?? row['url'] ?? null,
    title: row['title'] ?? '',
    description: row['description'] ?? null,
    propertyType: resolvePropertyType(row['propertyType'] ?? row['type'] ?? 'APARTMENT'),
    city: row['city'] ?? '',
    neighborhood: row['neighborhood'] ?? null,
    address: row['address'] ?? null,
    price: parseInt(row['price'] ?? '0', 10),
    area: parseInt(row['area'] ?? row['areaSqm'] ?? '0', 10),
    pricePerM2: row['pricePerM2'] ? parseInt(row['pricePerM2'], 10) : null,
    rooms: row['rooms'] ? parseInt(row['rooms'], 10) : null,
    floor: row['floor'] ? parseInt(row['floor'], 10) : null,
    totalFloors: row['totalFloors'] ? parseInt(row['totalFloors'], 10) : null,
    yearBuilt: row['yearBuilt'] ? parseInt(row['yearBuilt'], 10) : null,
    isNewBuild: row['isNewBuild'] === 'true' || row['isNewBuild'] === '1',
    hasParking: row['hasParking'] === 'true' || row['hasParking'] === '1',
    hasBalcony: row['hasBalcony'] === 'true' || row['hasBalcony'] === '1',
    hasElevator: row['hasElevator'] === 'true' || row['hasElevator'] === '1',
    agentName: row['agentName'] ?? null,
    agentPhone: row['agentPhone'] ?? null,
    agentEmail: row['agentEmail'] ?? null,
    lastSeenAt: new Date(),
    isActive: true,
  };
}

async function deactivateStale(activeIds: string[], source: string): Promise<number> {
  const result = await db.property.updateMany({
    where: {
      source: resolveSource(source),
      isActive: true,
      externalId: { notIn: activeIds },
    },
    data: { isActive: false, deactivatedAt: new Date() },
  });
  return result.count;
}

export async function processIngestJob(job: Job<IngestJobData>): Promise<IngestStats> {
  const { rows, source } = job.data;
  const stats: IngestStats = { processed: 0, created: 0, updated: 0, deactivated: 0, errors: 0 };
  const activeExternalIds: string[] = [];

  for (const row of rows) {
    try {
      const data = mapRowToProperty(row, source);
      activeExternalIds.push(data.externalId);

      const existing = await db.property.findUnique({ where: { externalId: data.externalId } });

      await db.property.upsert({
        where: { externalId: data.externalId },
        create: data,
        update: {
          price: data.price,
          title: data.title,
          description: data.description,
          isActive: true,
          lastSeenAt: new Date(),
          sourceUrl: data.sourceUrl,
        },
      });

      stats.processed++;
      if (existing) {
        stats.updated++;
      } else {
        stats.created++;
      }
    } catch (err) {
      stats.errors++;
      console.error('[IngestWorker] Row error:', err instanceof Error ? err.message : err);
    }
  }

  stats.deactivated = await deactivateStale(activeExternalIds, source);

  console.log('[IngestWorker] Stats:', stats);
  return stats;
}
