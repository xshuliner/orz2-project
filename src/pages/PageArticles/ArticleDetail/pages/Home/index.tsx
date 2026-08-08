import { getQueryArticleInfo, type ArticleInfo } from '@/api';
import { LayoutPage } from '@/components/LayoutPage';
import { OButton } from '@/components/OButton';
import { OEmptyState } from '@/components/OEmptyState';
import { OModal } from '@/components/OModal';
import { useI18n } from '@/hooks/useI18n';
import {
  formatArticleDate,
  getArticleBodyText,
  getArticleImages,
  sanitizeArticleHtml,
  type ArticleImageDirection,
} from '@/pages/PageArticles/utils/article';
import { Copy, Download, FileText, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.css';

async function copyTextToClipboard(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Permission and secure-context restrictions are handled by the fallback.
  }

  const activeElement = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.readOnly = true;
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.inset = '0 auto auto -9999px';
  document.body.append(textarea);
  textarea.select();
  textarea.setSelectionRange(0, value.length);

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
    if (activeElement instanceof HTMLElement) activeElement.focus();
  }
}

export function PageArticleDetail() {
  const { id = '' } = useParams();
  const { locale, localizePath, messages } = useI18n();
  const copy = messages.articles;
  const [article, setArticle] = useState<ArticleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');
  const [actionPanel, setActionPanel] = useState<'copy' | 'download' | null>(
    null
  );
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(false);
    setArticle(null);
    setActionFeedback('');
    getQueryArticleInfo(id, { signal: controller.signal })
      .then(result => {
        if (!controller.signal.aborted) setArticle(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  const horizontalImages = useMemo(
    () => (article ? getArticleImages(article, 'horizontal') : []),
    [article]
  );
  const verticalImages = useMemo(
    () => (article ? getArticleImages(article, 'vertical') : []),
    [article]
  );
  const articleHtml = useMemo(
    () => sanitizeArticleHtml(article?.content ?? '', article?.title),
    [article?.content, article?.title]
  );
  const articleTitle = article?.title || copy.untitled;
  const layoutProps = {
    backLink: { label: copy.backToList, to: localizePath('/articles') },
    className: 'article-page',
    description: copy.detailDescription,
    icon: FileText,
    seoConfig: {
      canonicalPath: `/articles/${encodeURIComponent(id)}`,
      description:
        article?.summary || article?.digest || copy.detailDescription,
      locale,
      robots: 'index, follow',
      title: copy.detailTitle,
    } as const,
    title: copy.detailTitle,
  };

  async function handleCopy(type: 'title' | 'content' | 'summary') {
    const value =
      type === 'title'
        ? article?.title || ''
        : type === 'content'
          ? article && getArticleBodyText(article)
          : article?.summary || article?.digest || '';
    if (!value) return;
    setActionPanel(null);
    if (await copyTextToClipboard(value)) {
      setActionFeedback(copy.copySuccess);
    } else {
      setActionFeedback(copy.copyFailed);
    }
  }

  async function handleDownload(direction: ArticleImageDirection) {
    if (!article || isDownloading) return;
    const imageUrls = getArticleImages(article, direction);
    if (!imageUrls.length) return;
    setActionPanel(null);
    setIsDownloading(true);
    let downloadedCount = 0;
    try {
      for (const [index, imageUrl] of imageUrls.entries()) {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error('Image download failed');
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          const extension =
            blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = `${article._id}-${direction}-${index + 1}.${extension}`;
          link.click();
          URL.revokeObjectURL(objectUrl);
          downloadedCount += 1;
        } catch {
          // Cross-origin hosts may block fetch; opening the original still lets the user save it.
          window.open(imageUrl, '_blank', 'noopener,noreferrer');
        }
      }
      setActionFeedback(
        downloadedCount ? copy.downloadSuccess : copy.downloadFailed
      );
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading)
    return (
      <LayoutPage {...layoutProps} title={copy.detailTitle}>
        <p className='article-feedback'>{copy.loading}</p>
      </LayoutPage>
    );
  if (loadError || !article)
    return (
      <LayoutPage
        {...layoutProps}
        seoConfig={{ ...layoutProps.seoConfig, robots: 'noindex, follow' }}
        title={copy.detailTitle}
      >
        <OEmptyState className='article-empty-state'>
          <h2>{loadError ? copy.loadFailed : copy.notFoundTitle}</h2>
          <p>{loadError ? copy.detailLoadFailed : copy.notFoundDescription}</p>
          <OButton to='/articles'>{copy.backToList}</OButton>
        </OEmptyState>
      </LayoutPage>
    );

  return (
    <LayoutPage
      backLink={layoutProps.backLink}
      className='article-page article-detail-page'
      description={copy.detailDescription}
      icon={FileText}
      seoConfig={layoutProps.seoConfig}
      title={copy.detailTitle}
    >
      <article className='article-detail'>
        <header className='article-detail-header'>
          <h2 className='article-detail-title'>{articleTitle}</h2>
          <div className='article-detail-meta'>
            <span>{article.author || copy.unknownAuthor}</span>
            <time dateTime={article.sys_createTime}>
              {formatArticleDate(article.sys_createTime, locale)}
            </time>
          </div>
          {article.imgCover ? (
            <img
              className='article-detail-cover'
              src={article.imgCover}
              alt=''
            />
          ) : null}
          <div className='article-detail-actions'>
            <OButton
              type='button'
              variant='secondary'
              onClick={() => setActionPanel('copy')}
            >
              <Copy size={16} aria-hidden='true' />
              {copy.copyAction}
            </OButton>
            {horizontalImages.length || verticalImages.length ? (
              <OButton
                type='button'
                variant='ghost'
                disabled={isDownloading}
                onClick={() => setActionPanel('download')}
              >
                <Download size={16} aria-hidden='true' />
                {copy.downloadImages}
              </OButton>
            ) : null}
          </div>
          {actionFeedback ? (
            <p className='article-copy-feedback' role='status'>
              {actionFeedback}
            </p>
          ) : null}
        </header>
        <div
          className='article-detail-content'
          dangerouslySetInnerHTML={{ __html: articleHtml }}
        />
      </article>
      <OModal
        className='article-action-panel'
        isOpen={actionPanel !== null}
        onClose={() => setActionPanel(null)}
        titleId='article-action-panel-title'
      >
        <header className='article-action-panel-header'>
          <div>
            <h2 id='article-action-panel-title'>
              {actionPanel === 'copy'
                ? copy.copyPanelTitle
                : copy.downloadPanelTitle}
            </h2>
            <p>{copy.actionPanelDescription}</p>
          </div>
          <button
            type='button'
            className='article-action-panel-close interactive'
            aria-label={copy.closeActionPanel}
            onClick={() => setActionPanel(null)}
          >
            <X size={18} aria-hidden='true' />
          </button>
        </header>
        <div className='article-action-options'>
          {actionPanel === 'copy' ? (
            <>
              {article.title ? (
                <button type='button' onClick={() => void handleCopy('title')}>
                  <strong>{copy.copyTitle}</strong>
                  <span>{copy.copyTitleDescription}</span>
                </button>
              ) : null}
              {getArticleBodyText(article) ? (
                <button
                  type='button'
                  onClick={() => void handleCopy('content')}
                >
                  <strong>{copy.copyContent}</strong>
                  <span>{copy.copyContentDescription}</span>
                </button>
              ) : null}
              {article.summary || article.digest ? (
                <button
                  type='button'
                  onClick={() => void handleCopy('summary')}
                >
                  <strong>{copy.copySummary}</strong>
                  <span>{copy.copySummaryDescription}</span>
                </button>
              ) : null}
            </>
          ) : (
            <>
              {verticalImages.length ? (
                <button
                  type='button'
                  onClick={() => void handleDownload('vertical')}
                >
                  <strong>{copy.downloadVertical}</strong>
                  <span>{copy.downloadDescription}</span>
                </button>
              ) : null}
              {horizontalImages.length ? (
                <button
                  type='button'
                  onClick={() => void handleDownload('horizontal')}
                >
                  <strong>{copy.downloadHorizontal}</strong>
                  <span>{copy.downloadDescription}</span>
                </button>
              ) : null}
            </>
          )}
        </div>
      </OModal>
    </LayoutPage>
  );
}
