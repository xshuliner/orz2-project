import type { CatalogItem } from '@/types';
import {
  catalogRecentUsageEventName,
  catalogRecentUsageStorageEventKey,
  getCatalogRecentUsageRecords,
  resolveRecentCatalogItems,
  type CatalogRecentKind,
} from '@/utils/catalogRecentUsage';
import { useEffect, useMemo, useState } from 'react';

export function useCatalogRecentItems<T extends CatalogItem>(
  type: CatalogRecentKind,
  items: readonly T[],
  limit = 3
) {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const refresh = () => setRevision(value => value + 1);
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== catalogRecentUsageStorageEventKey)
        return;
      refresh();
    };

    window.addEventListener(catalogRecentUsageEventName, refresh);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(catalogRecentUsageEventName, refresh);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const recentRecords = useMemo(
    () => getCatalogRecentUsageRecords(type),
    [revision, type]
  );

  return useMemo(
    () => resolveRecentCatalogItems(items, recentRecords, limit),
    [items, limit, recentRecords]
  );
}
