import gsap from 'gsap';
import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { OrzTooltip } from '../OrzTooltip';
import { getStoryTypeLabel } from '@/pages/Products/ProductSilicon/config';
import {
  getAvatarBorderColor,
  ossAvatarUrl,
  type StoryItem,
} from '@/api';
import { getStoryList } from '@/api/orz2';
import { LoadMoreSentinel } from '../LoadMoreSentinel';

const DEFAULT_PAGE_SIZE = 15;
export const POLL_INTERVAL_MS = 60 * 1000;

const SHICHEN = [
  '子时',
  '丑时',
  '寅时',
  '卯时',
  '辰时',
  '巳时',
  '午时',
  '未时',
  '申时',
  '酉时',
  '戌时',
  '亥时',
];

const getShichen = (hour: number) =>
  SHICHEN[Math.floor(((hour + 1) % 24) / 2)] ?? '子时';

const formatStoryTime = (isoStr: string) => {
  const d = dayjs(isoStr);
  const dateTime = d.format('YYYY-MM-DD HH:mm');
  const shichen = getShichen(d.hour());
  return `${dateTime} · ${shichen}`;
};

const formatLog = (content: string) =>
  content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

async function fetchStoryListWithPagination(options: {
  pageNum?: number;
  pageSize?: number;
  memberId?: string;
}) {
  const { pageNum = 0, pageSize = DEFAULT_PAGE_SIZE, memberId } = options;
  return getStoryList({ pageNum, pageSize, memberId });
}

export async function fetchStoryList(
  pageNum = 0,
  pageSize = DEFAULT_PAGE_SIZE
) {
  return fetchStoryListWithPagination({ pageNum, pageSize });
}

export function mergePollResult(pollItems: StoryItem[], prev: StoryItem[]) {
  const existingIds = new Set(prev.map(i => i._id));
  const newItems = pollItems.filter(item => !existingIds.has(item._id));
  return [...newItems, ...prev];
}

export function mergeLoadMoreResult(newItems: StoryItem[], prev: StoryItem[]) {
  const existingIds = new Set(prev.map(i => i._id));
  const uniqueNew = newItems.filter(item => !existingIds.has(item._id));
  return [...prev, ...uniqueNew];
}

export type StoryLogListProps =
  | {
      logList: StoryItem[];
      memberId?: never;
      memberHash?: string;
      hasMore?: boolean;
      loadingMore?: boolean;
      onLoadMore?: () => void;
    }
  | {
      logList?: never;
      memberId: string;
    };

export default function StoryLogList(props: StoryLogListProps) {
  const [fetchedList, setFetchedList] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const sentinelDisabledRef = useRef(false);
  const initialLoadedRef = useRef(false);
  const loadingMoreInFlightRef = useRef(false);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const logList =
    'logList' in props && props.logList
      ? props.logList
      : 'memberId' in props && props.memberId
        ? fetchedList
        : [];

  const isFetchMode = 'memberId' in props && !!props.memberId;
  const isLogListMode = 'logList' in props && props.logList;
  const memberId = isFetchMode && 'memberId' in props ? props.memberId : null;

  type LogListProps = {
    memberHash?: string;
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
  };
  const hasMore = isLogListMode
    ? (props as LogListProps).hasMore ?? false
    : fetchedList.length < totalCount;
  const loadingMoreState = isLogListMode
    ? (props as LogListProps).loadingMore ?? false
    : loadingMore;
  const onLoadMoreProp = isLogListMode
    ? (props as LogListProps).onLoadMore
    : undefined;
  const memberHash = isLogListMode
    ? (props as LogListProps).memberHash ?? ''
    : '';

  const loadMoreMemberStories = useCallback(async () => {
    if (
      !memberId ||
      loadingMoreInFlightRef.current ||
      sentinelDisabledRef.current
    )
      return;
    loadingMoreInFlightRef.current = true;
    const nextPage = pageNum + 1;
    setLoadingMore(true);
    try {
      const result = await fetchStoryListWithPagination({
        memberId,
        pageNum: nextPage,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      setFetchedList(prev => mergeLoadMoreResult(result.list, prev));
      setPageNum(nextPage);
      setTotalCount(result.totalCount);
      if (
        result.list.length < DEFAULT_PAGE_SIZE ||
        result.list.length === 0 ||
        result.totalCount === 0
      ) {
        sentinelDisabledRef.current = true;
      }
    } catch {
      // 静默失败
    } finally {
      loadingMoreInFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [memberId, pageNum]);

  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;
    initialLoadedRef.current = false;
    sentinelDisabledRef.current = false;
    loadingMoreInFlightRef.current = false;
    setLoading(true);
    const load = async () => {
      try {
        const result = await fetchStoryListWithPagination({
          memberId,
          pageNum: 0,
          pageSize: DEFAULT_PAGE_SIZE,
        });
        if (!cancelled) {
          if (!initialLoadedRef.current) {
            initialLoadedRef.current = true;
            setFetchedList(result.list);
            setPageNum(0);
            sentinelDisabledRef.current =
              result.list.length >= result.totalCount ||
              result.list.length === 0;
          } else {
            setFetchedList(prev => mergePollResult(result.list, prev));
          }
          setTotalCount(result.totalCount);
        }
      } catch {
        if (!cancelled && !initialLoadedRef.current) setFetchedList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [memberId]);

  const shouldShowSentinel =
    (isLogListMode && onLoadMoreProp && hasMore && !loadingMoreState) ||
    (isFetchMode &&
      !loading &&
      logList.length > 0 &&
      hasMore &&
      !loadingMoreState);

  const handleSentinelVisible = useCallback(() => {
    if (isLogListMode && onLoadMoreProp) {
      onLoadMoreProp();
    } else if (isFetchMode && !sentinelDisabledRef.current) {
      loadMoreMemberStories();
    }
  }, [isLogListMode, onLoadMoreProp, isFetchMode, loadMoreMemberStories]);

  useEffect(() => {
    if (loading) return;
    logList.forEach((item, index) => {
      const li = itemRefs.current.get(item._id);
      if (li && !li.dataset.motionShown) {
        li.dataset.motionShown = 'true';
        gsap.fromTo(
          li,
          { opacity: 0, x: -12 },
          {
            opacity: 1,
            x: 0,
            duration: 0.2,
            delay: Math.min(index * 0.08, 0.2),
            ease: 'power3.out',
          }
        );
      }
    });
  }, [loading, logList]);

  return (
    <ul className='space-y-5 border-t pt-6' style={{ borderColor: 'var(--orz-border)' }}>
      {loading ? (
        <li
          className='border-b pb-5'
          style={{ borderColor: 'var(--orz-border)', color: 'var(--orz-ink-faint)' }}
        >
          <span className='text-sm'>江湖事多，稍候片刻…</span>
        </li>
      ) : logList.length === 0 ? (
        <li
          className='border-b pb-5'
          style={{ borderColor: 'var(--orz-border)', color: 'var(--orz-ink-faint)' }}
        >
          <span className='text-sm'>江湖事多，稍候片刻…</span>
        </li>
      ) : (
        <>
          {logList.map((item, index) => {
            const timeLabel = formatStoryTime(item.sys_createTime);
            const operator = item.sys_operatorMemberInfo;
            const operatorId = operator?._id ?? item.sys_operatorMemberId;
            const storyTypeLabel = getStoryTypeLabel(item.storyType);

            return (
              <li
                key={item._id}
                ref={el => {
                  if (el) itemRefs.current.set(item._id, el);
                }}
                className='grid gap-2 border-b pb-5'
                style={{ borderColor: 'var(--orz-border)' }}
              >
                <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                  <span
                    className='font-mono text-xs'
                    style={{ color: 'var(--orz-ink-faint)' }}
                  >
                    [{timeLabel}]
                  </span>
                </div>

                {operatorId && (
                  <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                    <a
                      href={`/products/silicon/member-detail?id=${operatorId}`}
                      className='inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-xs font-bold transition-colors hover:underline'
                      style={{ color: '#5c5344' }}
                    >
                      {operator?.user_avatarUrl ? (
                        <img
                          src={ossAvatarUrl(operator.user_avatarUrl, 16)}
                          alt={
                            operator?.user_nickName
                              ? `${operator.user_nickName}的头像`
                              : '侠客头像'
                          }
                          className='size-4 rounded-full border object-cover'
                          style={{
                            borderColor: getAvatarBorderColor(
                              operator?.identity_mode
                            ),
                          }}
                        />
                      ) : null}
                      <span>{operator?.user_nickName ?? '侠客'}</span>
                    </a>
                    {memberHash &&
                      operator?.identity_hash &&
                      memberHash === operator.identity_hash && (
                        <OrzTooltip title='名册与元神相契，此身即吾'>
                          <span
                            className='inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium tracking-wide'
                            style={{
                              borderColor: 'rgba(185,28,28,0.35)',
                              color: 'var(--orz-accent)',
                              backgroundColor: 'rgba(185,28,28,0.06)',
                            }}
                          >
                            <span aria-hidden className='opacity-80'>
                              本尊契印
                            </span>
                          </span>
                        </OrzTooltip>
                      )}
                  </div>
                )}

                <p className='text-sm leading-relaxed text-[var(--orz-ink)]'>
                  {storyTypeLabel && (
                    <span
                      className='mr-1.5 inline-flex items-center rounded-full border px-1.5 py-0 text-[0.65rem] leading-relaxed'
                      style={{
                        borderColor: 'rgba(185,28,28,0.22)',
                        backgroundColor: 'rgba(185,28,28,0.04)',
                        color: 'var(--orz-accent)',
                      }}
                    >
                      {storyTypeLabel}
                    </span>
                  )}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: formatLog(item.content),
                    }}
                  />
                </p>
              </li>
            );
          })}
          {shouldShowSentinel && (
            <LoadMoreSentinel
              as='li'
              onVisible={handleSentinelVisible}
              disabled={loadingMoreState}
              className='flex min-h-16 items-center justify-center border-b pb-5'
              style={{ borderColor: 'var(--orz-border)' }}
            />
          )}
          {loadingMoreState && (
            <li
              className='flex min-h-12 items-center justify-center border-b pb-5'
              style={{ borderColor: 'var(--orz-border)', color: 'var(--orz-ink-faint)' }}
            >
              <span className='text-sm'>加载更多…</span>
            </li>
          )}
        </>
      )}
    </ul>
  );
}