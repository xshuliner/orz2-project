import { getQueryArticleList, type ArticleInfo } from '@/api';
import { useAuth } from '@/components/ContextAuth';
import { LayoutPage } from '@/components/LayoutPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OEmptyState } from '@/components/OEmptyState';
import { useI18n } from '@/hooks/useI18n';
import { formatArticleDate } from '@/pages/PageArticles/utils/article';
import { FileText, Plus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const pageSize = 15;

export function PageArticleList() {
  const { locale, localizePath, messages } = useI18n();
  const { isAuthenticated, openLogin } = useAuth();
  const copy = messages.articles;
  const [articles, setArticles] = useState<ArticleInfo[]>([]);
  const [pageNum, setPageNum] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const requestAbortRef = useRef<AbortController | null>(null);

  const loadArticles = useCallback(
    async (nextPageNum: number, replace = false) => {
      requestAbortRef.current?.abort();
      const controller = new AbortController();
      requestAbortRef.current = controller;
      setIsLoading(true);
      setLoadError(false);
      try {
        const page = await getQueryArticleList({
          pageNum: nextPageNum,
          pageSize,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setArticles(current => {
          if (replace) return page.list;
          const articleById = new Map(
            [...current, ...page.list].map(article => [article._id, article])
          );
          return Array.from(articleById.values());
        });
        setPageNum(page.pageNum);
        setTotalCount(page.totalCount);
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      } finally {
        if (requestAbortRef.current === controller) {
          requestAbortRef.current = null;
          setIsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!isAuthenticated) {
      requestAbortRef.current?.abort();
      requestAbortRef.current = null;
      setArticles([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }
    void loadArticles(0, true);
    return () => requestAbortRef.current?.abort();
  }, [isAuthenticated, loadArticles]);

  const hasMore = (pageNum + 1) * pageSize < totalCount;

  return (
    <LayoutPage
      backLink={{
        label: messages.utilityTool.backToTools,
        to: localizePath('/tools'),
      }}
      className='article-page'
      description={copy.listDescription}
      icon={FileText}
      seoConfig={{
        canonicalPath: '/articles',
        description: copy.listDescription,
        locale,
        robots: 'noindex, follow',
        title: copy.listTitle,
      }}
      title={copy.listTitle}
      topbarSlot={
        <OButton to='/tools/article-publisher' size='sm'>
          <Plus size={16} aria-hidden='true' />
          {copy.createArticle}
        </OButton>
      }
    >
      {!isAuthenticated ? (
        <OEmptyState className='article-empty-state'>
          <FileText size={34} aria-hidden='true' />
          <h2>{copy.loginTitle}</h2>
          <p>{copy.loginDescription}</p>
          <OButton type='button' onClick={openLogin}>
            {copy.loginAction}
          </OButton>
        </OEmptyState>
      ) : null}
      {isAuthenticated && isLoading && !articles.length ? (
        <p className='article-feedback'>{copy.loading}</p>
      ) : null}
      {isAuthenticated && loadError && !articles.length ? (
        <OEmptyState className='article-empty-state'>
          <p>{copy.loadFailed}</p>
          <OButton type='button' onClick={() => void loadArticles(0, true)}>
            {copy.retry}
          </OButton>
        </OEmptyState>
      ) : null}
      {isAuthenticated && !isLoading && !loadError && !articles.length ? (
        <OEmptyState className='article-empty-state'>
          <FileText size={34} aria-hidden='true' />
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyDescription}</p>
          <OButton to='/tools/article-publisher'>{copy.createArticle}</OButton>
        </OEmptyState>
      ) : null}
      {isAuthenticated && articles.length ? (
        <section className='article-list' aria-label={copy.listTitle}>
          {articles.map(article => (
            <OCard
              as='article'
              className='article-list-card'
              interactive
              key={article._id}
              padding='md'
            >
              {article.imgCover ? (
                <img
                  src={article.imgCover}
                  alt=''
                  className='article-list-cover'
                />
              ) : (
                <div className='article-list-cover article-list-cover--placeholder'>
                  <FileText aria-hidden='true' />
                </div>
              )}
              <div className='article-list-copy'>
                <p className='article-list-date'>
                  {formatArticleDate(article.sys_createTime, locale)}
                </p>
                <h2>
                  <Link
                    to={localizePath(
                      `/articles/${encodeURIComponent(article._id)}`
                    )}
                  >
                    {article.title || copy.untitled}
                  </Link>
                </h2>
                <p>{article.summary || article.digest || copy.noSummary}</p>
              </div>
            </OCard>
          ))}
        </section>
      ) : null}
      {articles.length ? (
        <div className='article-list-actions'>
          {loadError ? <span>{copy.loadFailed}</span> : null}
          {hasMore ? (
            <OButton
              type='button'
              variant='secondary'
              disabled={isLoading}
              onClick={() => void loadArticles(pageNum + 1)}
            >
              {isLoading ? copy.loading : copy.loadMore}
            </OButton>
          ) : (
            <span>{copy.endOfList}</span>
          )}
          <OButton
            type='button'
            variant='ghost'
            disabled={isLoading}
            onClick={() => void loadArticles(0, true)}
            aria-label={copy.refresh}
          >
            <RefreshCw size={16} aria-hidden='true' />
          </OButton>
        </div>
      ) : null}
    </LayoutPage>
  );
}
