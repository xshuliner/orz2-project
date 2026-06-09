import type { CatalogItem } from '@/types';
import CacheManager from '@/utils/CacheManager';

export type CatalogRecentKind = 'product' | 'tool';

export interface CatalogRecentUsageRecord {
  id: string;
  type: CatalogRecentKind;
  usedAt: number;
}

interface CatalogRecentUsageStorage {
  items: CatalogRecentUsageRecord[];
  version: 1;
}

const storageKey = 'orz2:catalog-recent-usage';
const storageVersion = 1;
const maxRecentUsageRecords = 24;

export const catalogRecentUsageEventName = 'orz2:catalog-recent-usage-change';
export const catalogRecentUsageStorageEventKey = `CACHE_${storageKey}`;

function isCatalogRecentKind(value: unknown): value is CatalogRecentKind {
  return value === 'product' || value === 'tool';
}

function normalizeRecentUsageRecord(
  value: unknown
): CatalogRecentUsageRecord | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  if (!isCatalogRecentKind(record.type)) return null;
  if (typeof record.id !== 'string' || !record.id.trim()) return null;

  const usedAt =
    typeof record.usedAt === 'number' && Number.isFinite(record.usedAt)
      ? record.usedAt
      : 0;

  return {
    id: record.id,
    type: record.type,
    usedAt,
  };
}

function getStorageItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];

  const storage = value as Partial<CatalogRecentUsageStorage>;
  return Array.isArray(storage.items) ? storage.items : [];
}

function normalizeRecentUsageStorage(value: unknown) {
  const records = getStorageItems(value)
    .map(normalizeRecentUsageRecord)
    .filter((record): record is CatalogRecentUsageRecord => Boolean(record))
    .sort((a, b) => b.usedAt - a.usedAt);
  const deduped = new Map<string, CatalogRecentUsageRecord>();

  records.forEach(record => {
    const key = `${record.type}:${record.id}`;
    if (!deduped.has(key)) deduped.set(key, record);
  });

  return Array.from(deduped.values()).slice(0, maxRecentUsageRecords);
}

function persistRecentUsageRecords(records: CatalogRecentUsageRecord[]) {
  CacheManager.setLocalStorage(storageKey, {
    version: storageVersion,
    items: records,
  } satisfies CatalogRecentUsageStorage);
}

export function getCatalogRecentUsageRecords(type?: CatalogRecentKind) {
  const records = normalizeRecentUsageStorage(
    CacheManager.getLocalStorage<unknown>(storageKey)
  );

  return type ? records.filter(record => record.type === type) : records;
}

export function recordCatalogRecentUsage(type: CatalogRecentKind, id: string) {
  if (!id.trim()) return;

  const nextRecord: CatalogRecentUsageRecord = {
    id,
    type,
    usedAt: Date.now(),
  };
  const nextRecords = [
    nextRecord,
    ...getCatalogRecentUsageRecords().filter(
      record => record.type !== type || record.id !== id
    ),
  ].slice(0, maxRecentUsageRecords);

  persistRecentUsageRecords(nextRecords);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(catalogRecentUsageEventName));
  }
}

export function resolveRecentCatalogItems<T extends CatalogItem>(
  items: readonly T[],
  records: readonly CatalogRecentUsageRecord[],
  limit = 3
) {
  const itemsById = new Map(items.map(item => [item.id, item]));
  return records
    .map(record => itemsById.get(record.id))
    .filter((item): item is T => Boolean(item))
    .slice(0, limit);
}

export function mergeCatalogItemsWithRecent<T extends CatalogItem>(
  recentItems: readonly T[],
  baseItems: readonly T[]
) {
  const recentIds = new Set(recentItems.map(item => item.id));
  return [...recentItems, ...baseItems.filter(item => !recentIds.has(item.id))];
}
