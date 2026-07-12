import { type ApiErrorPayload, apiErrorEventName } from '@/api/errors';
import { OIconButton } from '@/components/OIconButton';
import { OModal } from '@/components/OModal';
import { siteConfig } from '@/config/site';
import { useI18n } from '@/hooks/useI18n';
import { CircleAlert, Coins, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './index.css';

const memberScoreLowCode = 'MEMBER_SCORE_LOW';

function getErrorMessage(
  error: ApiErrorPayload,
  copy: ReturnType<typeof useI18n>['messages']['apiError']
) {
  if (error.message === memberScoreLowCode) return copy.scoreLow.description;
  return copy.generic.description;
}

/** Renders user-facing API errors emitted by the shared HTTP client. */
export function ApiErrorHandler() {
  const { messages } = useI18n();
  const copy = messages.apiError;
  const [error, setError] = useState<ApiErrorPayload | null>(null);

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const detail = (event as CustomEvent<ApiErrorPayload>).detail;
      if (detail) setError(detail);
    };

    window.addEventListener(apiErrorEventName, handleApiError);
    return () => window.removeEventListener(apiErrorEventName, handleApiError);
  }, []);

  const isScoreLow = error?.message === memberScoreLowCode;
  const title = isScoreLow ? copy.scoreLow.title : copy.generic.title;

  return (
    <OModal
      className='api-error-modal'
      isOpen={Boolean(error)}
      onClose={() => setError(null)}
      overlayClassName='api-error-modal-overlay'
      titleId='api-error-modal-title'
    >
      {error ? (
        <>
          <OIconButton
            className='api-error-modal-close'
            size='sm'
            aria-label={copy.closeAriaLabel}
            onClick={() => setError(null)}
          >
            <X size={18} aria-hidden='true' />
          </OIconButton>
          <div className='api-error-modal-heading'>
            <span className='api-error-modal-icon' aria-hidden='true'>
              {isScoreLow ? <Coins size={22} /> : <CircleAlert size={22} />}
            </span>
            <div>
              <h2 id='api-error-modal-title'>{title}</h2>
              <p>{getErrorMessage(error, copy)}</p>
            </div>
          </div>

          {isScoreLow ? (
            <>
              {siteConfig.scoreRewardMiniProgramCodeUrl ? (
                <div className='api-error-code-panel'>
                  <img
                    alt={copy.scoreLow.codeAlt}
                    className='api-error-code-image'
                    src={siteConfig.scoreRewardMiniProgramCodeUrl}
                  />
                </div>
              ) : (
                <p className='api-error-code-pending'>
                  {copy.scoreLow.codePending}
                </p>
              )}
              <p className='api-error-modal-hint'>{copy.scoreLow.hint}</p>
            </>
          ) : null}
        </>
      ) : null}
    </OModal>
  );
}
