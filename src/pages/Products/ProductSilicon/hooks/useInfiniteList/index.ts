import type { StoryItem, StoryListResult } from '@/api';
import { getStoryList } from '@/api/orz2';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_PAGE_SIZE = 15;

export function useInfiniteList({
  pageSize = DEFAULT_PAGE_SIZE,
  getItemId = item => item._id,
  fetchPage: customFetchPage,
  enablePoll: _enablePoll = false,
  pollIntervalMs: _pollIntervalMs = 60 * 1000,
  mergeNewToFrontOnPoll: _mergeNewToFrontOnPoll = true,
}: {
  pageSize?: number;
  getItemId?: (item: StoryItem) => string;
  fetchPage?: (page: number, pageSize: number) => Promise<StoryListResult>;
  enablePoll?: boolean;
  pollIntervalMs?: number;
  mergeNewToFrontOnPoll?: boolean;
} = {}) {
  const [items, setItems] = useState<StoryItem[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const pageNumRef = useRef(0);
  const loadingInFlightRef = useRef(false);
  const initialLoadedRef = useRef(false);

  const defaultFetchPage = useCallback(async (page: number, size: number) => {
    return getStoryList({ pageNum: page, pageSize: size });
  }, []);

  const fetchPage = customFetchPage ?? defaultFetchPage;

  const loadMore = useCallback(async () => {
    if (loadingInFlightRef.current || !hasMore) return;
    loadingInFlightRef.current = true;
    setLoadingMore(true);
    pageNumRef.current += 1;
    try {
      const result = await fetchPage(pageNumRef.current, pageSize);
      setItems(prev => {
        const existingIds = new Set(prev.map(getItemId));
        const newItems = result.list.filter(
          item => !existingIds.has(getItemId(item))
        );
        return [...prev, ...newItems];
      });
      setHasMore(result.list.length >= pageSize);
    } catch {
      pageNumRef.current -= 1;
    } finally {
      loadingInFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage, getItemId, hasMore, pageSize]);

  const initialLoad = useCallback(async () => {
    if (initialLoadedRef.current) return;
    initialLoadedRef.current = true;
    setLoading(true);
    pageNumRef.current = 0;
    try {
      const result = await fetchPage(0, pageSize);
      setItems(result.list);
      setHasMore(result.list.length >= pageSize);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, pageSize]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  return {
    items,
    loadingMore,
    hasMore,
    loading,
    loadMore,
    initialLoad,
  };
}
