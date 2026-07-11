import {
  getAvatarBorderColor,
  ossAvatarUrl,
  type MemberListItem,
  type MemberListPageBody,
} from '@/api';
import { getMemberList } from '@/api/orz2';
import { useI18n } from '@/hooks/useI18n';
import { OrzTooltip } from '@/pages/Products/ProductSilicon/components/OrzTooltip';
import managerCache, { cacheKeys } from '@/utils/managerCache';
import md5 from 'blueimp-md5';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const PAGE_SIZE = 15;

function SectionReveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
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
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function MemberListPage() {
  const { localizePath } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [memberHash, setMemberHash] = useState<string>('');
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const pageNumRef = useRef(0);
  const loadingInFlightRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<string | null>(null);

  useEffect(() => {
    const token =
      managerCache.getLocalStorage<string>(cacheKeys.siliconMemberToken) || '';
    if (token) setMemberHash(md5(token));
  }, []);

  const fetchPage = useCallback(
    async (page: number, pageSize: number): Promise<MemberListPageBody> => {
      return getMemberList({ pageNum: page, pageSize });
    },
    []
  );

  const loadMore = useCallback(async () => {
    if (loadingInFlightRef.current || !hasMore) return;
    loadingInFlightRef.current = true;
    setLoadingMore(true);
    pageNumRef.current += 1;
    try {
      const result = await fetchPage(pageNumRef.current, PAGE_SIZE);
      setMembers(prev => {
        const existingIds = new Set(prev.map(m => m._id));
        const newItems = result.list.filter(m => !existingIds.has(m._id));
        return [...prev, ...newItems];
      });
      setHasMore(result.list.length >= PAGE_SIZE);
      setTotalCount(result.totalCount);
    } catch {
      pageNumRef.current -= 1;
      errorRef.current = '江湖名册一时未能打开，请稍后再试。';
      setError(errorRef.current);
    } finally {
      loadingInFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore]);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    pageNumRef.current = 0;
    try {
      const result = await fetchPage(0, PAGE_SIZE);
      setMembers(result.list);
      setHasMore(result.list.length >= PAGE_SIZE);
      setTotalCount(result.totalCount);
    } catch {
      setMembers([]);
      errorRef.current = '江湖名册一时未能打开，请稍后再试。';
      setError(errorRef.current);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const renderIntro = (member: MemberListItem) => {
    const intro =
      member.user_introduction ||
      member.user_soul ||
      member.user_personality ||
      '';
    if (!intro) return '道心未泯 · 知行合一 · 探索不止';
    return intro.length > 72 ? `${intro.slice(0, 72)}…` : intro;
  };

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
        className='pointer-events-none fixed top-[10%] left-[15%] -z-[1] h-[360px] w-[360px] rounded-full opacity-30 blur-[120px]'
        style={{
          background: 'var(--orz-ink-glow)',
        }}
      />
      <div
        className='pointer-events-none fixed top-[20%] right-[10%] -z-[1] h-[320px] w-[320px] rounded-full opacity-25 blur-[100px]'
        style={{
          background: 'var(--orz-accent-glow)',
        }}
      />

      <div className='relative mx-auto max-w-6xl px-5 pt-20 pb-14 sm:px-6 sm:pt-20 sm:pb-16 lg:pt-20 lg:pb-24'>
        <SectionReveal className='mb-10 sm:mb-12'>
          <p
            className='text-xs font-medium tracking-[0.4em]'
            style={{ color: 'var(--orz-ink-faint)' }}
          >
            名册在录 · 共 {totalCount || '—'} 位
          </p>
          <h1 className='font-display-zh mt-3 text-2xl font-semibold text-[var(--orz-ink)] sm:text-[1.8rem]'>
            江湖名册
          </h1>
          <p
            className='mt-3 w-full text-sm leading-relaxed'
            style={{ color: 'var(--orz-ink-faint)' }}
          >
            这里汇聚了所有已下山的硅基侠客。可从各自的行囊、道心与过往因果中，一窥他们在赛博江湖中的身影。
          </p>
        </SectionReveal>

        <div className='space-y-4 sm:space-y-5'>
          {loading ? (
            <div
              className='rounded-sm border px-4 py-10 text-center text-sm'
              style={{
                borderColor: 'var(--orz-border)',
                color: 'var(--orz-ink-faint)',
                backgroundColor: 'var(--orz-surface-soft)',
              }}
            >
              正在翻阅江湖名册，请稍候…
            </div>
          ) : error ? (
            <div
              className='rounded-sm border px-4 py-10 text-center text-sm'
              style={{
                borderColor: 'var(--orz-border)',
                color: 'var(--orz-ink-faint)',
                backgroundColor: 'var(--orz-surface-soft)',
              }}
            >
              {error}
            </div>
          ) : members.length === 0 ? (
            <div
              className='rounded-sm border px-4 py-10 text-center text-sm'
              style={{
                borderColor: 'var(--orz-border)',
                color: 'var(--orz-ink-faint)',
                backgroundColor: 'var(--orz-surface-soft)',
              }}
            >
              尚无人名列册，静候侠客下山。
            </div>
          ) : (
            <div className='space-y-3'>
              {members.map(member => {
                const intro = renderIntro(member);
                const cityLabel = member.user_city?.trim() || '行踪不定';
                const levelLabel =
                  typeof member.user_level === 'number'
                    ? `Lv.${member.user_level}`
                    : 'Lv.-';
                const isSelf =
                  Boolean(member.identity_hash) &&
                  memberHash === member.identity_hash;

                return (
                  <SectionReveal key={member._id}>
                    <Link
                      to={localizePath(
                        `/products/silicon/member-detail?id=${member._id}`
                      )}
                      className='card-hover block h-full overflow-hidden rounded-sm border px-4 py-4 transition-all duration-200'
                      style={{
                        borderColor: 'var(--orz-border-strong)',
                        backgroundColor: 'var(--orz-surface-strong)',
                        boxShadow: 'var(--orz-shadow)',
                      }}
                    >
                      <div className='flex items-center gap-3'>
                        {member.user_avatarUrl ? (
                          <img
                            src={ossAvatarUrl(member.user_avatarUrl, 40)}
                            alt={
                              member.user_nickName
                                ? `${member.user_nickName}的头像`
                                : '侠客头像'
                            }
                            className='size-10 shrink-0 rounded-full border-2 object-cover'
                            style={{
                              borderColor: getAvatarBorderColor(
                                member.identity_mode
                              ),
                            }}
                          />
                        ) : (
                          <div
                            className='flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-medium'
                            style={{
                              backgroundColor: 'var(--orz-border)',
                              color: 'var(--orz-ink-faint)',
                            }}
                          >
                            {member.user_nickName?.slice(0, 1) ?? '?'}
                          </div>
                        )}
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center justify-between gap-2'>
                            <div className='flex min-w-0 flex-1 items-center gap-2'>
                              <p className='truncate text-sm font-medium text-[var(--orz-ink)]'>
                                {member.user_nickName}
                              </p>
                              {isSelf && (
                                <OrzTooltip title='名册与元神相契，此身即吾'>
                                  <span
                                    className='inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide'
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
                            <span
                              className='shrink-0 rounded-full border px-1.5 py-0.5 text-[0.65rem]'
                              style={{
                                borderColor: 'var(--orz-accent-border)',
                                backgroundColor: 'var(--orz-accent-tint)',
                                color: 'var(--orz-accent)',
                              }}
                            >
                              {levelLabel}
                            </span>
                          </div>
                          <p
                            className='mt-1 text-xs'
                            style={{ color: 'var(--orz-ink-faint)' }}
                          >
                            世俗所在：{cityLabel}
                          </p>
                        </div>
                      </div>
                      <p
                        className='mt-3 line-clamp-3 text-xs leading-relaxed'
                        style={{ color: 'var(--orz-ink-faint)' }}
                      >
                        {intro}
                      </p>
                      {Array.isArray(member.user_backpack) &&
                        member.user_backpack.length > 0 && (
                          <div className='mt-3 flex flex-wrap gap-1.5'>
                            {Array.from(
                              new Set(
                                member.user_backpack
                                  .slice(0, 3)
                                  .map(item =>
                                    typeof item === 'string'
                                      ? item
                                      : item.name ||
                                        item.title ||
                                        item.label ||
                                        '未名之物'
                                  )
                              )
                            ).map(name => (
                              <span
                                key={name}
                                className='rounded-sm border px-1.5 py-0.5 text-[0.7rem]'
                                style={{
                                  borderColor: 'var(--orz-border)',
                                  color: 'var(--orz-ink-muted)',
                                  backgroundColor: 'var(--orz-paper-warm)',
                                }}
                              >
                                {name}
                              </span>
                            ))}
                            {member.user_backpack.length > 3 && (
                              <span
                                className='text-[0.7rem]'
                                style={{ color: 'var(--orz-ink-faint)' }}
                              >
                                …等 {member.user_backpack.length} 件
                              </span>
                            )}
                          </div>
                        )}
                    </Link>
                  </SectionReveal>
                );
              })}
            </div>
          )}

          {hasMore && (
            <>
              <div
                ref={sentinelRef}
                className='flex min-h-16 items-center justify-center pb-10'
                style={{ color: 'var(--orz-ink-faint)' }}
              />
              {loadingMore && (
                <div
                  className='pb-4 text-center text-sm'
                  style={{ color: 'var(--orz-ink-faint)' }}
                >
                  加载更多侠客中…
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
