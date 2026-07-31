import type { CreateArticleForLLMResult } from '@/api';
import { OButton } from '@/components/OButton';
import { OIconButton } from '@/components/OIconButton';
import { OModal } from '@/components/OModal';
import { wechatDraftBoxUrl } from '@/pages/Tools/ToolArticlePublisher/config';
import type { PublisherCopy } from '@/pages/Tools/ToolArticlePublisher/types';
import { CheckCheck, ExternalLink, FileText, X } from 'lucide-react';

export function DraftSuccessModal({
  copy,
  publishResult,
  onClose,
}: {
  copy: PublisherCopy;
  publishResult: CreateArticleForLLMResult | null;
  onClose: () => void;
}) {
  const draftResult =
    publishResult?.officialDraft.status === 'success'
      ? (publishResult.officialDraft.result ?? null)
      : null;
  const hasWechatDelivery = publishResult?.officialDraft.status !== 'skipped';
  const hasEmailDelivery = publishResult?.finalReportEmail.status !== 'skipped';
  const title =
    hasWechatDelivery && hasEmailDelivery
      ? copy.success.titleBoth
      : hasWechatDelivery
        ? copy.success.titleWechat
        : hasEmailDelivery
          ? copy.success.titleEmail
          : copy.success.titleArticle;
  const description =
    hasWechatDelivery && hasEmailDelivery
      ? copy.success.descriptionBoth
      : hasWechatDelivery
        ? copy.success.descriptionWechat
        : hasEmailDelivery
          ? copy.success.descriptionEmail
          : copy.success.descriptionArticle;
  const inlineImages = draftResult?.inlineImages ?? [];
  const inlineImageCount =
    inlineImages.length || draftResult?.inlineImagePaths?.length || 0;
  const coverValue = draftResult?.coverImageUrl || draftResult?.imagePath || '';

  return (
    <OModal
      className='draft-success-modal'
      isOpen
      onClose={onClose}
      overlayClassName='draft-success-overlay'
      titleId='draft-success-title'
    >
      <>
        <OIconButton
          className='draft-success-close'
          variant='ghost'
          onClick={onClose}
          aria-label={copy.success.closeAriaLabel}
          autoFocus
        >
          <X size={18} aria-hidden='true' />
        </OIconButton>

        <div className='draft-success-hero'>
          <div className='draft-success-icon' aria-hidden='true'>
            <CheckCheck size={31} strokeWidth={2.4} />
          </div>
          <p>{copy.success.kicker}</p>
          <h2 id='draft-success-title'>{title}</h2>
          <span>{description}</span>
        </div>

        <div className='draft-success-content'>
          <div className='draft-success-highlight'>
            <div>
              <small>{copy.success.articleTitle}</small>
              <strong>
                {draftResult?.title ||
                  publishResult?.article.articleInfo?.title ||
                  copy.success.fallbackTitle}
              </strong>
            </div>
            <FileText size={22} aria-hidden='true' />
          </div>

          <dl className='draft-success-grid'>
            {hasWechatDelivery ? (
              <div>
                <dt>{copy.success.wechatDelivery}</dt>
                <dd>
                  {draftResult
                    ? copy.success.deliverySuccess
                    : copy.success.deliveryFailed}
                </dd>
              </div>
            ) : null}
            {hasEmailDelivery ? (
              <div>
                <dt>{copy.success.emailDelivery}</dt>
                <dd>
                  {publishResult?.finalReportEmail.status === 'success'
                    ? copy.success.deliverySuccess
                    : copy.success.deliveryFailed}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>{copy.success.generatedAt}</dt>
              <dd>{draftResult?.time || copy.success.justNow}</dd>
            </div>
            <div>
              <dt>{copy.success.cover}</dt>
              <dd>
                {coverValue
                  ? copy.success.coverDone
                  : copy.success.coverProcessed}
              </dd>
            </div>
            <div>
              <dt>{copy.success.inlineImages}</dt>
              <dd>
                {inlineImageCount
                  ? `${inlineImageCount} ${copy.success.inlineUploadedSuffix}`
                  : copy.success.noInline}
              </dd>
            </div>
          </dl>

          {draftResult?.mediaId ? (
            <div className='draft-success-media'>
              <span>{copy.success.mediaId}</span>
              <code>{draftResult.mediaId}</code>
            </div>
          ) : null}

          {publishResult?.article.articleInfo?._id ? (
            <div className='draft-success-media'>
              <span>{copy.success.articleRecordId}</span>
              <code>{publishResult.article.articleInfo._id}</code>
            </div>
          ) : null}

          {coverValue || inlineImageCount ? (
            <details className='draft-success-details'>
              <summary className='interactive'>{copy.success.details}</summary>
              <dl className='summary-list'>
                {coverValue ? (
                  <div>
                    <dt>{copy.success.cover}</dt>
                    <dd className='summary-mono'>{coverValue}</dd>
                  </div>
                ) : null}
                {inlineImages.length ? (
                  <div>
                    <dt>{copy.success.inlineDetail}</dt>
                    <dd>
                      {inlineImages.map((image, index) => (
                        <span
                          className='summary-mono'
                          key={`${image.url || image.mediaId}-${index}`}
                        >
                          {image.url || image.mediaId}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : draftResult?.inlineImagePaths?.length ? (
                  <div>
                    <dt>{copy.success.inlineDetail}</dt>
                    <dd>
                      {draftResult.inlineImagePaths?.map((path, index) => (
                        <span className='summary-mono' key={`${path}-${index}`}>
                          {path}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </details>
          ) : null}
        </div>

        <footer className='draft-success-actions'>
          <OButton size='lg' type='button' variant='ghost' onClick={onClose}>
            {copy.success.stay}
          </OButton>
          {draftResult ? (
            <OButton
              href={wechatDraftBoxUrl}
              size='lg'
              target='_blank'
              rel='noreferrer'
            >
              {copy.success.goDraftBox}
              <ExternalLink size={17} aria-hidden='true' />
            </OButton>
          ) : null}
        </footer>

        <p className='draft-success-footnote'>
          {draftResult
            ? copy.success.footnoteWechat
            : copy.success.footnoteArticle}
        </p>
      </>
    </OModal>
  );
}
