import { postPolishContent } from '@/api';
import { LayoutPage } from '@/components/LayoutPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { useI18n } from '@/hooks/useI18n';
import {
  reportPolisherPolishMode,
  reportPolisherSeoKey,
  reportPolisherToolId,
  type CachedReportPolishForm,
  type ReportType,
} from '@/pages/Tools/ToolWorkReportPolisher/config';
import {
  getInitialReportPolishForm,
  persistReportPolishForm,
} from '@/pages/Tools/ToolWorkReportPolisher/utils/form';
import { buildPolishContent } from '@/pages/Tools/ToolWorkReportPolisher/utils/prompt';
import {
  ClipboardCopy,
  ClipboardPenLine,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import './index.css';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function WorkReportPolisher() {
  const { messages } = useI18n();
  const copy = messages.reportPolishTool;
  const initialForm = useMemo(() => getInitialReportPolishForm(), []);
  const [reportType, setReportType] = useState<ReportType>(
    initialForm.reportType
  );
  const [source, setSource] = useState(initialForm.source);
  const [referenceContent, setReferenceContent] = useState(
    initialForm.referenceContent
  );
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const reportTypeOptions: Array<{ label: string; value: ReportType }> = [
    { label: copy.daily, value: 'daily' },
    { label: copy.weekly, value: 'weekly' },
  ];
  const charCount = source.trim().length;
  const canPolish = charCount > 0 && !isPolishing;

  useEffect(() => {
    persistReportPolishForm({
      referenceContent,
      reportType,
      source,
    } satisfies CachedReportPolishForm);
  }, [referenceContent, reportType, source]);

  function fillSourceSample() {
    setSource(reportType === 'daily' ? copy.sampleDaily : copy.sampleWeekly);
    setResult('');
    setStatus('');
    setIsCopied(false);
  }

  function fillReferenceSample() {
    setReferenceContent(
      reportType === 'daily'
        ? copy.sampleReferenceDaily
        : copy.sampleReferenceWeekly
    );
    setStatus('');
    setIsCopied(false);
  }

  function handleReportTypeChange(nextReportType: ReportType) {
    if (nextReportType === reportType) return;
    if (!window.confirm(copy.switchConfirm)) return;

    setReportType(nextReportType);
    setSource('');
    setReferenceContent('');
    setResult('');
    setStatus('');
    setIsCopied(false);
  }

  async function handlePolish() {
    const content = source.trim();
    if (!content) {
      setStatus(copy.errors.empty);
      return;
    }

    setIsPolishing(true);
    setStatus('');
    setIsCopied(false);
    try {
      const polished = await postPolishContent({
        content: buildPolishContent({
          promptCopy: copy.polishPrompt,
          referenceContent,
          reportType,
          source: content,
        }),
        mode: reportPolisherPolishMode,
      });
      setResult(polished.content);
      setStatus(copy.success);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : copy.errors.failed;
      setStatus(message || copy.errors.failed);
    } finally {
      setIsPolishing(false);
    }
  }

  async function copyResult() {
    if (!result.trim()) return;
    try {
      await navigator.clipboard.writeText(result);
      setIsCopied(true);
      setStatus(copy.copied);
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setStatus(copy.errors.copyFailed);
    }
  }

  return (
    <LayoutPage
      icon={Sparkles}
      seoKey={reportPolisherSeoKey}
      toolId={reportPolisherToolId}
    >
      <section className='report-polish-workbench'>
        <OCard
          as='section'
          className='report-polish-card reveal-on-scroll'
          padding='lg'
        >
          <div className='report-polish-card-heading'>
            <span className='report-polish-card-icon' aria-hidden='true'>
              <ClipboardPenLine size={19} strokeWidth={1.9} />
            </span>
            <div>
              <h2>{copy.inputTitle}</h2>
              <p>{copy.inputDescription}</p>
            </div>
          </div>

          <div className='report-polish-type-row'>
            <span>{copy.typeLabel}</span>
            <div className='report-polish-type-switch'>
              {reportTypeOptions.map(option => (
                <button
                  aria-pressed={reportType === option.value}
                  className={cx(
                    'interactive',
                    reportType === option.value && 'is-active'
                  )}
                  key={option.value}
                  onClick={() => handleReportTypeChange(option.value)}
                  type='button'
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className='report-polish-textarea-field'>
            <span className='report-polish-field-heading'>
              <span>
                <strong>{copy.inputTitle}</strong>
                <small>{copy.inputDescription}</small>
              </span>
              <OButton
                disabled={isPolishing}
                onClick={fillSourceSample}
                size='sm'
                type='button'
                variant='ghost'
              >
                {copy.useSample}
              </OButton>
            </span>
            <textarea
              aria-label={copy.inputTitle}
              disabled={isPolishing}
              onChange={event => {
                setSource(event.target.value);
                setStatus('');
              }}
              placeholder={copy.inputPlaceholder}
              value={source}
            />
          </div>

          <div className='report-polish-textarea-field report-polish-textarea-field--reference'>
            <span className='report-polish-field-heading'>
              <span>
                <strong>{copy.referenceTitle}</strong>
                <small>{copy.referenceDescription}</small>
              </span>
              <OButton
                disabled={isPolishing}
                onClick={fillReferenceSample}
                size='sm'
                type='button'
                variant='ghost'
              >
                {copy.useReferenceSample}
              </OButton>
            </span>
            <textarea
              aria-label={copy.referenceTitle}
              disabled={isPolishing}
              onChange={event => {
                setReferenceContent(event.target.value);
                setStatus('');
              }}
              placeholder={copy.referencePlaceholder}
              value={referenceContent}
            />
          </div>

          <div className='report-polish-action-row report-polish-action-row--end'>
            <div className='report-polish-actions'>
              <OButton
                disabled={!canPolish}
                onClick={handlePolish}
                size='sm'
                type='button'
              >
                {isPolishing ? (
                  <Loader2
                    className='report-polish-loading-icon'
                    size={15}
                    aria-hidden='true'
                  />
                ) : (
                  <Sparkles size={15} aria-hidden='true' />
                )}
                {isPolishing ? copy.polishing : copy.polish}
              </OButton>
            </div>
          </div>
        </OCard>

        <OCard
          as='section'
          className='report-polish-card report-polish-output-card reveal-on-scroll'
          padding='lg'
        >
          <div className='report-polish-card-heading'>
            <span className='report-polish-card-icon' aria-hidden='true'>
              <FileText size={19} strokeWidth={1.9} />
            </span>
            <div>
              <h2>{copy.outputTitle}</h2>
              <p>{copy.outputDescription}</p>
            </div>
          </div>

          <div
            className={cx(
              'report-polish-output',
              result ? 'has-result' : 'is-empty'
            )}
            aria-live='polite'
          >
            {result ? <pre>{result}</pre> : <p>{copy.outputEmpty}</p>}
          </div>

          <div className='report-polish-action-row report-polish-output-actions'>
            <span className='report-polish-status' role='status'>
              {status}
            </span>
            <OButton
              disabled={!result.trim()}
              onClick={copyResult}
              size='sm'
              type='button'
              variant='secondary'
            >
              <ClipboardCopy size={15} aria-hidden='true' />
              {isCopied ? copy.copied : copy.copy}
            </OButton>
          </div>
        </OCard>
      </section>

      <OCard
        as='aside'
        className='report-polish-tips reveal-on-scroll'
        padding='md'
        tone='soft'
      >
        <strong>{copy.tipsTitle}</strong>
        <ul>
          {copy.tips.map(tip => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </OCard>
    </LayoutPage>
  );
}
