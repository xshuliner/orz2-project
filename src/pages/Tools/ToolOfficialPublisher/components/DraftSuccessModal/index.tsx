import type { OfficialDraftResult } from '@/api';
import { OButton } from '@/components/OButton';
import { OIconButton } from '@/components/OIconButton';
import { OModal } from '@/components/OModal';
import { wechatDraftBoxUrl } from '@/pages/Tools/ToolOfficialPublisher/config';
import type { PublisherCopy } from '@/pages/Tools/ToolOfficialPublisher/types';
import { CheckCheck, ExternalLink, FileText, X } from 'lucide-react';

export function DraftSuccessModal({
  copy,
  draftResult,
  onClose,
}: {
  copy: PublisherCopy;
  draftResult: OfficialDraftResult | null;
  onClose: () => void;
}) {
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
          <h2 id='draft-success-title'>{copy.success.title}</h2>
          <span>{copy.success.description}</span>
        </div>

        <div className='draft-success-content'>
          <div className='draft-success-highlight'>
            <div>
              <small>{copy.success.draftTitle}</small>
              <strong>
                {draftResult?.title || copy.success.fallbackTitle}
              </strong>
            </div>
            <FileText size={22} aria-hidden='true' />
          </div>

          <dl className='draft-success-grid'>
            <div>
              <dt>{copy.success.draftType}</dt>
              <dd>
                {draftResult?.articleType === 'newspic'
                  ? copy.success.typeNewspic
                  : copy.success.typeNews}
              </dd>
            </div>
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
              <span>media_id</span>
              <code>{draftResult.mediaId}</code>
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
          <OButton
            href={wechatDraftBoxUrl}
            size='lg'
            target='_blank'
            rel='noreferrer'
          >
            {copy.success.goDraftBox}
            <ExternalLink size={17} aria-hidden='true' />
          </OButton>
        </footer>

        <p className='draft-success-footnote'>{copy.success.footnote}</p>
      </>
    </OModal>
  );
}
