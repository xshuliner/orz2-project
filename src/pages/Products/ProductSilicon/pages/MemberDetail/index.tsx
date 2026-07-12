import {
  getAvatarBorderColor,
  ossAvatarUrl,
  type MemberInfo,
  type StoryItem,
} from '@/api';
import { getMemberInfo, getStoryList } from '@/api/orz2';
import { useI18n } from '@/hooks/useI18n';
import { LoadMoreSentinel } from '@/pages/Products/ProductSilicon/components/LoadMoreSentinel';
import { OrzTooltip } from '@/pages/Products/ProductSilicon/components/OrzTooltip';
import { getStoryTypeLabel } from '@/pages/Products/ProductSilicon/config';
import managerCache, { cacheKeys } from '@/utils/manager/cache';
import md5 from 'blueimp-md5';
import dayjs from 'dayjs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const STORY_PAGE_SIZE = 15;

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

const formatTime = (isoStr: string) => {
  const d = dayjs(isoStr);
  return `${d.format('YYYY-MM-DD HH:mm')} · ${getShichen(d.hour())}`;
};

const formatStoryTime = (isoStr: string) => {
  const d = dayjs(isoStr);
  return `${d.format('YYYY-MM-DD HH:mm')} · ${getShichen(d.hour())}`;
};

const formatLog = (content: string) =>
  content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

function getFriendlinessMeta(value: number) {
  if (value > 60) return { label: '生死与共', tone: 'positive' as const };
  if (value > 35) return { label: '肝胆相照', tone: 'positive' as const };
  if (value > 0) return { label: '意气相投', tone: 'positive' as const };
  if (value === 0) return { label: '江湖过客', tone: 'neutral' as const };
  if (value < -60) return { label: '势不两立', tone: 'negative' as const };
  if (value < -35) return { label: '反目成仇', tone: 'negative' as const };
  return { label: '心存芥蒂', tone: 'negative' as const };
}

function SectionReveal({
  children,
  className = '',
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
      }
    );
    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === ref.current) st.kill();
      });
    };
  }, [delay]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

export function MemberDetailPage() {
  const { localizePath } = useI18n();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const tokenFromParams = searchParams.get('token');
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [memberHash, setMemberHash] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [storyList, setStoryList] = useState<StoryItem[]>([]);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyLoadingMore, setStoryLoadingMore] = useState(false);
  const [storyHasMore, setStoryHasMore] = useState(false);
  const [storyPageNum, setStoryPageNum] = useState(0);
  const storyScrollToFirstNewRef = useRef<number | null>(null);
  const loadingMoreInFlightRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const persistTokenAndApply = (info: MemberInfo, token: string) => {
      if (cancelled) return;
      managerCache.setLocalStorage(cacheKeys.siliconMemberToken, token);
      setMemberHash(md5(token));
      setMember(info);
      setError(null);
    };

    const loadMember = async () => {
      try {
        if (tokenFromParams) {
          try {
            const info = await getMemberInfo({ token: tokenFromParams });
            if (info) {
              persistTokenAndApply(info, tokenFromParams);
              return;
            }
          } catch {
            // ignore
          }
        }

        const memberToken =
          managerCache.getLocalStorage<string>(cacheKeys.siliconMemberToken) ||
          '';
        if (memberToken) setMemberHash(md5(memberToken));

        if (id) {
          const info = await getMemberInfo({ id });
          if (!cancelled) {
            setMember(info ?? null);
            setError(info ? null : '未找到该侠客');
          }
          return;
        }

        if (!memberToken) {
          if (!cancelled) {
            setMember(null);
            setError('未找到侠客');
          }
          return;
        }

        try {
          const info = await getMemberInfo({ token: memberToken });
          if (!info)
            managerCache.removeLocalStorage(cacheKeys.siliconMemberToken);
          if (!cancelled) {
            setMember(info ?? null);
            setError(info ? null : '未找到侠客');
          }
        } catch {
          // ignore
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMember();
    return () => {
      cancelled = true;
    };
  }, [id, tokenFromParams]);

  const loadStoryPage = useCallback(
    async (page: number, pageSize: number, _append = false) => {
      if (!member?._id) return { list: [], totalCount: 0 };
      return getStoryList({ memberId: member._id, pageNum: page, pageSize });
    },
    [member?._id]
  );

  const loadMoreStories = useCallback(async () => {
    if (loadingMoreInFlightRef.current || !storyHasMore || !member?._id) return;
    loadingMoreInFlightRef.current = true;
    setStoryLoadingMore(true);
    const nextPage = storyPageNum + 1;
    try {
      const result = await loadStoryPage(nextPage, STORY_PAGE_SIZE, true);
      setStoryList(prev => {
        const existingIds = new Set(prev.map(s => s._id));
        const newItems = result.list.filter(s => !existingIds.has(s._id));
        const newList = [...prev, ...newItems];
        if (newItems.length > 0) {
          storyScrollToFirstNewRef.current = prev.length;
        }
        return newList;
      });
      setStoryPageNum(nextPage);
      setStoryHasMore(result.list.length >= STORY_PAGE_SIZE);
    } catch {
      // ignore
    } finally {
      loadingMoreInFlightRef.current = false;
      setStoryLoadingMore(false);
    }
  }, [loadStoryPage, storyHasMore, storyPageNum, member?._id]);

  useEffect(() => {
    if (!member?._id) return;
    let cancelled = false;
    setStoryLoading(true);
    setStoryList([]);
    setStoryPageNum(0);
    setStoryHasMore(false);

    const load = async () => {
      try {
        const result = await loadStoryPage(0, STORY_PAGE_SIZE);
        if (!cancelled) {
          setStoryList(result.list);
          setStoryHasMore(result.list.length >= STORY_PAGE_SIZE);
        }
      } catch {
        if (!cancelled) setStoryList([]);
      } finally {
        if (!cancelled) setStoryLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [loadStoryPage, member?._id]);

  if (loading) {
    return (
      <div className='relative min-h-screen overflow-x-clip bg-[var(--orz-paper)] antialiased'>
        <div
          className='fixed inset-0 -z-10'
          style={{
            background: 'var(--orz-aura-bg)',
          }}
        />
        <div className='grain-overlay' />
        <div className='relative mx-auto max-w-6xl px-5 py-20'>
          <p style={{ color: 'var(--orz-ink-faint)' }}>正在查阅名册…</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className='relative min-h-screen overflow-x-clip bg-[var(--orz-paper)] antialiased'>
        <div
          className='fixed inset-0 -z-10'
          style={{
            background: 'var(--orz-aura-bg)',
          }}
        />
        <div className='grain-overlay' />
        <div className='relative mx-auto max-w-6xl px-5 pt-16 pb-20 text-center'>
          <p className='mb-6' style={{ color: 'var(--orz-ink-faint)' }}>
            {error ?? '未找到该侠客'}
          </p>
        </div>
      </div>
    );
  }

  const isSelf =
    Boolean(memberHash) &&
    Boolean(member.identity_hash) &&
    memberHash === member.identity_hash;

  return (
    <div className='relative min-h-screen overflow-x-clip bg-[var(--orz-paper)] antialiased'>
      <div
        className='fixed inset-0 -z-10'
        style={{
          background: 'var(--orz-aura-bg)',
        }}
      />
      <div className='grain-overlay' />

      <div
        className='pointer-events-none fixed top-[10%] left-[15%] -z-[1] h-[400px] w-[400px] rounded-full opacity-30 blur-[120px]'
        style={{
          background: 'var(--orz-ink-glow)',
        }}
      />
      <div
        className='pointer-events-none fixed top-[20%] right-[10%] -z-[1] h-[350px] w-[350px] rounded-full opacity-25 blur-[100px]'
        style={{
          background: 'var(--orz-accent-glow)',
        }}
      />

      <div className='relative mx-auto max-w-6xl px-5 pt-20 pb-14 sm:px-6 sm:pt-20 sm:pb-16 lg:pt-20 lg:pb-24'>
        <div
          className='relative overflow-visible rounded-sm border p-6 sm:p-8'
          style={{
            borderColor: 'var(--orz-border)',
            backgroundColor: 'var(--orz-surface)',
            boxShadow: 'var(--orz-shadow-lg)',
          }}
        >
          <span className='ornament-corner ornament-corner-tl' />
          <span className='ornament-corner ornament-corner-br' />

          <div className='flex flex-col items-center gap-4 sm:flex-row sm:items-start'>
            <img
              src={ossAvatarUrl(member.user_avatarUrl, 80)}
              alt={
                member.user_nickName
                  ? `${member.user_nickName}的头像`
                  : '侠客头像'
              }
              className='size-20 shrink-0 rounded-full border-2 object-cover'
              style={{
                borderColor: getAvatarBorderColor(member.identity_mode),
              }}
            />
            <div className='min-w-0 flex-1 text-center sm:text-left'>
              <div className='flex flex-wrap items-center justify-center gap-2 sm:justify-start'>
                <h1 className='font-display-zh text-2xl font-semibold text-[var(--orz-ink)] sm:text-[1.75rem]'>
                  {member.user_nickName}
                </h1>
                {isSelf && (
                  <OrzTooltip title='名册与元神相契，此身即吾'>
                    <span
                      className='inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium tracking-wide'
                      style={{
                        borderColor: 'var(--orz-accent-border)',
                        color: 'var(--orz-accent)',
                        backgroundColor: 'var(--orz-accent-tint)',
                      }}
                    >
                      <span aria-hidden className='opacity-80'>
                        本尊契印
                      </span>
                    </span>
                  </OrzTooltip>
                )}
              </div>
              {member.user_personality && (
                <p
                  className='mt-1 text-sm'
                  style={{ color: 'var(--orz-accent)' }}
                >
                  {member.user_personality}
                </p>
              )}
            </div>
          </div>

          <div
            className='mt-8 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-5'
            style={{ borderColor: 'var(--orz-border)' }}
          >
            <InfoCell
              label='下山时辰'
              value={formatTime(member.sys_createTime)}
            />
            <InfoCell
              label='最近问剑'
              value={formatTime(member.sys_updateTime)}
            />
            <InfoCell label='修为境界' value={`第 ${member.user_level} 重`} />
            <InfoCell label='江湖阅历' value={String(member.user_exp)} />
            <InfoCell
              label='世俗所在'
              value={member.user_city?.trim() || '无名之地'}
            />
          </div>

          {member.user_introduction && (
            <Section
              title='生平简介'
              content={member.user_introduction}
              delay={0.1}
            />
          )}
          {member.user_soul && (
            <Section title='遵从道心' content={member.user_soul} delay={0.15} />
          )}
          {member.user_memory && (
            <Section
              title='过往因果'
              content={member.user_memory}
              delay={0.2}
            />
          )}

          {member.user_friendsList && (
            <SectionReveal
              className='mt-8 border-t pt-6'
              delay={0.22}
              style={{ borderColor: 'var(--orz-border)' } as CSSProperties}
            >
              <h3
                className='mb-3 text-xs font-medium tracking-[0.3em]'
                style={{ color: 'var(--orz-ink-faint)' }}
              >
                江湖同道
              </h3>
              {member.user_friendsList.length === 0 ? (
                <p
                  className='text-sm'
                  style={{ color: 'var(--orz-ink-faint)' }}
                >
                  尚无结交之人。
                </p>
              ) : (
                <ul className='space-y-3 text-xs'>
                  {member.user_friendsList.map(f => {
                    const meta = getFriendlinessMeta(f.friendliness);
                    const toneStyle =
                      meta.tone === 'positive'
                        ? {
                            borderColor: 'var(--orz-accent-border)',
                            color: 'var(--orz-accent)',
                            backgroundColor: 'var(--orz-accent-tint)',
                          }
                        : meta.tone === 'negative'
                          ? {
                              borderColor: 'var(--orz-positive-border)',
                              color: 'var(--orz-positive)',
                              backgroundColor: 'var(--orz-positive-tint)',
                            }
                          : {
                              borderColor: 'var(--orz-border)',
                              color: 'var(--orz-ink-muted)',
                              backgroundColor: 'transparent',
                            };
                    return (
                      <li
                        key={f.nickName}
                        className='rounded-sm border px-3 py-2.5'
                        style={{
                          borderColor: 'var(--orz-border)',
                          backgroundColor: 'var(--orz-paper-warm)',
                        }}
                      >
                        <div className='flex items-center justify-start gap-3'>
                          <span
                            className='truncate font-medium'
                            style={{ color: 'var(--orz-ink)' }}
                          >
                            {f.nickName}
                          </span>
                          <span
                            className='shrink-0 rounded-full border px-1.5 py-0.5 text-[0.65rem]'
                            style={toneStyle}
                          >
                            {meta.label}·{f.friendliness}
                          </span>
                        </div>
                        <p
                          className='mt-1.5 leading-relaxed'
                          style={{ color: 'var(--orz-ink-faint)' }}
                        >
                          {f.description || '江湖一面之缘'}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SectionReveal>
          )}

          {member.user_backpack && member.user_backpack.length > 0 && (
            <SectionReveal
              className='mt-8 border-t pt-6'
              delay={0.25}
              style={{ borderColor: 'var(--orz-border)' } as CSSProperties}
            >
              <h3
                className='mb-3 text-xs font-medium tracking-[0.3em]'
                style={{ color: 'var(--orz-ink-faint)' }}
              >
                随身行囊
              </h3>
              <div className='flex flex-wrap gap-2'>
                {Array.from(new Set(member.user_backpack))
                  .slice(0, 48)
                  .map((item, index) => {
                    if (typeof item === 'string') {
                      return (
                        <span
                          key={item}
                          className='rounded-sm border px-2.5 py-1 text-xs'
                          style={{
                            borderColor: 'var(--orz-border)',
                            color: 'var(--orz-ink-muted)',
                            backgroundColor: 'var(--orz-paper-warm)',
                          }}
                        >
                          {item}
                        </span>
                      );
                    }
                    const name =
                      item.name || item.title || item.label || '未名之物';
                    const description =
                      item.description || item.desc || '其来历自有因果';
                    const source =
                      item.source || item.origin || '江湖传闻，出处成谜';
                    const key =
                      name +
                      '-' +
                      (item.source || item.origin || index.toString());
                    return (
                      <OrzTooltip
                        key={key}
                        title={name}
                        description={description}
                        meta={source}
                      >
                        <button
                          type='button'
                          className='cursor-pointer rounded-sm border px-2.5 py-1 text-xs transition-colors'
                          style={{
                            borderColor: 'var(--orz-border)',
                            color: 'var(--orz-ink-muted)',
                            backgroundColor: 'var(--orz-paper-warm)',
                          }}
                        >
                          {name}
                        </button>
                      </OrzTooltip>
                    );
                  })}
                {member.user_backpack.length > 48 && (
                  <span
                    className='text-xs'
                    style={{ color: 'var(--orz-ink-faint)' }}
                  >
                    … 等共 {member.user_backpack.length} 件
                  </span>
                )}
              </div>
            </SectionReveal>
          )}

          <SectionReveal className='mt-8' delay={0.3}>
            <h3
              className='mb-4 text-xs font-medium tracking-[0.3em]'
              style={{ color: 'var(--orz-ink-faint)' }}
            >
              江湖纪事
            </h3>
            <MemberStoryLogSection
              localizePath={localizePath}
              storyList={storyList}
              storyLoading={storyLoading}
              storyLoadingMore={storyLoadingMore}
              hasMore={storyHasMore}
              onLoadMore={loadMoreStories}
              scrollToFirstNewRef={storyScrollToFirstNewRef}
            />
          </SectionReveal>
        </div>
      </div>
    </div>
  );
}

function MemberStoryLogSection({
  localizePath,
  storyList,
  storyLoading,
  storyLoadingMore,
  hasMore,
  onLoadMore,
  scrollToFirstNewRef,
}: {
  localizePath: (to: string) => string;
  storyList: StoryItem[];
  storyLoading: boolean;
  storyLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  scrollToFirstNewRef: MutableRefObject<number | null>;
}) {
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const scrollToElRef = useCallback(
    (el: HTMLLIElement | null, index: number) => {
      if (el && scrollToFirstNewRef.current === index) {
        el.scrollIntoView({ block: 'start' });
        scrollToFirstNewRef.current = null;
      }
    },
    [scrollToFirstNewRef]
  );

  useEffect(() => {
    if (storyLoading) return;
    storyList.forEach((item, index) => {
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
  }, [storyLoading, storyList]);

  return (
    <ul
      className='space-y-5 border-t pt-6'
      style={{ borderColor: 'var(--orz-border)' }}
    >
      {storyLoading ? (
        <li
          className='border-b pb-5'
          style={{
            borderColor: 'var(--orz-border)',
            color: 'var(--orz-ink-faint)',
          }}
        >
          <span className='text-sm'>江湖事多，稍候片刻…</span>
        </li>
      ) : storyList.length === 0 ? (
        <li
          className='border-b pb-5'
          style={{
            borderColor: 'var(--orz-border)',
            color: 'var(--orz-ink-faint)',
          }}
        >
          <span className='text-sm'>暂无纪事</span>
        </li>
      ) : (
        <>
          {storyList.map((item, index) => {
            const timeLabel = formatStoryTime(item.sys_createTime);
            const operator = item.sys_operatorMemberInfo;
            const opId = operator?._id ?? item.sys_operatorMemberId;
            const isFirstNewItem = scrollToFirstNewRef.current === index;
            const storyTypeLabel = getStoryTypeLabel(item.storyType);

            return (
              <li
                key={item._id}
                ref={el => {
                  if (el) {
                    itemRefs.current.set(item._id, el);
                    if (isFirstNewItem) scrollToElRef(el, index);
                  }
                }}
                className='grid gap-2 border-b pb-5'
                style={{ borderColor: 'var(--orz-border)' }}
              >
                <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                  <span
                    className='text-xs'
                    style={{ color: 'var(--orz-ink-faint)' }}
                  >
                    [{timeLabel}]
                  </span>
                </div>
                {opId && (
                  <div className='flex items-center gap-x-2'>
                    <Link
                      to={localizePath(
                        `/products/silicon/member-detail?id=${opId}`
                      )}
                      className='inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-xs font-bold transition-colors hover:underline'
                      style={{ color: 'var(--orz-ink-muted)' }}
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
                    </Link>
                  </div>
                )}
                <p className='text-sm leading-relaxed text-[var(--orz-ink)]'>
                  {storyTypeLabel && (
                    <span
                      className='mr-1.5 inline-flex items-center rounded-full border px-1.5 py-0 text-[0.65rem] leading-relaxed'
                      style={{
                        borderColor: 'var(--orz-accent-border)',
                        backgroundColor: 'var(--orz-accent-tint)',
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
          {hasMore && (
            <LoadMoreSentinel
              as='li'
              onVisible={onLoadMore}
              disabled={storyLoadingMore}
              className='flex min-h-16 items-center justify-center border-b pb-5'
              style={{ borderColor: 'var(--orz-border)' }}
            />
          )}
          {storyLoadingMore && (
            <li
              className='flex min-h-12 items-center justify-center border-b pb-5'
              style={{
                borderColor: 'var(--orz-border)',
                color: 'var(--orz-ink-faint)',
              }}
            >
              <span className='text-sm'>加载更多…</span>
            </li>
          )}
        </>
      )}
    </ul>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs' style={{ color: 'var(--orz-ink-faint)' }}>
        {label}
      </p>
      <p className='mt-0.5 text-sm font-medium text-[var(--orz-ink)]'>
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  content,
  delay,
}: {
  title: string;
  content: string;
  delay: number;
}) {
  return (
    <SectionReveal
      className='mt-8 border-t pt-6'
      delay={delay}
      style={{ borderColor: 'var(--orz-border)' } as CSSProperties}
    >
      <h3
        className='mb-3 text-xs font-medium tracking-[0.3em]'
        style={{ color: 'var(--orz-ink-faint)' }}
      >
        {title}
      </h3>
      <p
        className='text-sm leading-relaxed'
        style={{ color: 'var(--orz-ink)' }}
      >
        {content}
      </p>
    </SectionReveal>
  );
}
