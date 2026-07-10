import {
  streamPostOfficialPublisher,
  type OfficialCommentConfig,
  type OfficialDraftResult,
  type OfficialImageConfig,
  type OfficialPublisherMode,
  type OfficialPublisherProgressEvent,
} from '@/api';
import WechatConsoleGuide from '@/assets/wechat-console-guide.svg';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { OInputAI } from '@/components/OInputAI';
import { ORadio } from '@/components/ORadio';
import { OSelector } from '@/components/OSelector';
import { OTooltip } from '@/components/OTooltip';
import { Seo } from '@/components/Seo';
import { getToolSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';
import { getTools } from '@/i18n';
import { DraftSuccessModal } from '@/pages/Tools/ToolOfficialPublisher/components/DraftSuccessModal';
import { PublisherProgressPanel } from '@/pages/Tools/ToolOfficialPublisher/components/PublisherProgressPanel';
import {
  apiWhitelistIp,
  defaultForm,
  getPromptTemplates,
  officialPublisherModes,
  officialPublisherProviders,
  officialPublisherScheduleEmail,
  officialPublisherSeoKey,
  officialPublisherStorageKey,
  officialPublisherToolId,
  publisherEditorModes,
  wechatConsoleUrl,
  type PromptTemplateId,
} from '@/pages/Tools/ToolOfficialPublisher/config';
import type {
  PublishPhase,
  PublishStepStatus,
  PublisherEditorMode,
  WechatPublisherForm,
} from '@/pages/Tools/ToolOfficialPublisher/types';
import {
  buildPublisherRequestBody,
  getActiveModeSetting,
  getCompletionItems,
  getTemplateContent,
  getValidationErrors,
  hasText,
  normalizeForm,
} from '@/pages/Tools/ToolOfficialPublisher/utils/form';
import { createInitialPublishSteps } from '@/pages/Tools/ToolOfficialPublisher/utils/progress';
import CacheManager from '@/utils/CacheManager';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  FileJson,
  KeyRound,
  LayoutTemplate,
  Loader2,
  Mail,
  Newspaper,
  PenLine,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import './index.css';

export function OfficialPublisher() {
  const { locale, localizePath, messages } = useI18n();
  const publisherCopy = messages.publisher;
  const defaultRewriteRequirement = publisherCopy.defaultRewriteRequirement;
  const localizedDefaultForm = useMemo(
    () => ({
      ...defaultForm,
      modeSettings: {
        create: { ...defaultForm.modeSettings.create },
        rewrite: { ...defaultForm.modeSettings.rewrite },
      },
      rewriteRequirement: defaultRewriteRequirement,
    }),
    [defaultRewriteRequirement]
  );
  const promptTemplates = useMemo(
    () => getPromptTemplates(publisherCopy.promptTemplates),
    [publisherCopy.promptTemplates]
  );
  const localizedTools = useMemo(() => getTools(locale), [locale]);
  const localizedToolSeo = useMemo(() => getToolSeo(locale), [locale]);
  const commentOptions: Array<{
    label: string;
    value: OfficialCommentConfig;
  }> = useMemo(
    () => [
      { label: publisherCopy.comments.closed, value: { open: 0, fansOnly: 0 } },
      { label: publisherCopy.comments.open, value: { open: 1, fansOnly: 0 } },
      {
        label: publisherCopy.comments.fansOnly,
        value: { open: 1, fansOnly: 1 },
      },
    ],
    [
      publisherCopy.comments.closed,
      publisherCopy.comments.fansOnly,
      publisherCopy.comments.open,
    ]
  );
  const providerOptions = useMemo(
    () =>
      officialPublisherProviders.map(provider => ({
        value: provider,
        label: publisherCopy.providers[provider],
      })),
    [publisherCopy.providers]
  );
  const modeOptions = useMemo(() => {
    const modeCopy = publisherCopy.modes as Record<
      OfficialPublisherMode,
      { label: string; description: string }
    >;
    return officialPublisherModes.map(mode => ({
      value: mode,
      label: modeCopy[mode].label,
      icon: mode === 'create' ? Newspaper : PenLine,
    }));
  }, [publisherCopy.modes]);
  const editorModeOptions = useMemo(() => {
    const editorModeCopy = publisherCopy.editorModes as Record<
      PublisherEditorMode,
      { label: string; description: string }
    >;
    return publisherEditorModes.map(mode => ({
      value: mode,
      label: editorModeCopy[mode].label,
    }));
  }, [publisherCopy.editorModes]);
  const templateOptions = useMemo(
    () =>
      promptTemplates.map(template => ({
        value: template.id,
        label: template.label,
        description: template.caption,
        icon: LayoutTemplate,
      })),
    [promptTemplates]
  );
  const [form, setForm] = useState<WechatPublisherForm>(() => {
    try {
      return normalizeForm(
        CacheManager.getLocalStorage(officialPublisherStorageKey),
        defaultRewriteRequirement
      );
    } catch {
      return localizedDefaultForm;
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState<string>(
    publisherCopy.status.autosave
  );
  const [publishPhase, setPublishPhase] = useState<PublishPhase>('idle');
  const [publishSteps, setPublishSteps] = useState(() =>
    createInitialPublishSteps(publisherCopy.stepNames)
  );
  const [publishElapsedMs, setPublishElapsedMs] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [draftResult, setDraftResult] = useState<OfficialDraftResult | null>(
    null
  );
  const [isDraftResultOpen, setDraftResultOpen] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const activeModeSetting = getActiveModeSetting(form);
  const isAdvancedMode = activeModeSetting.editorMode === 'advanced';
  const selectedPromptTemplate =
    promptTemplates.find(
      template => template.id === activeModeSetting.templateId
    ) ?? promptTemplates[0]!;
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const publisherAsideRef = useRef<HTMLElement | null>(null);
  const publisherAbortRef = useRef<AbortController | null>(null);
  const publishStartedAtRef = useRef<number | null>(null);
  useEffect(() => {
    CacheManager.setLocalStorage(officialPublisherStorageKey, form);
  }, [form]);

  useEffect(() => {
    if (!isGenerating) return;
    const timer = window.setInterval(() => {
      if (publishStartedAtRef.current) {
        setPublishElapsedMs(Date.now() - publishStartedAtRef.current);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  useEffect(
    () => () => {
      publisherAbortRef.current?.abort();
    },
    []
  );

  useEffect(() => {
    if (publishPhase === 'connecting') {
      publisherAsideRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [publishPhase]);

  const exportedJson = useMemo(() => JSON.stringify(form, null, 2), [form]);
  const completionItems = useMemo(
    () => getCompletionItems(form, publisherCopy, selectedPromptTemplate),
    [form, publisherCopy, selectedPromptTemplate]
  );
  const completedCount = completionItems.filter(item => item.done).length;
  // Keep page title, description, breadcrumb, cards, and SEO on one catalog source.
  const publisherTool = useMemo(
    () =>
      localizedTools.find(item => item.id === officialPublisherToolId) ??
      localizedTools.find(item => item.seo?.slug === officialPublisherSeoKey),
    [localizedTools]
  );

  function updateField<K extends keyof WechatPublisherForm>(
    key: K,
    value: WechatPublisherForm[K]
  ) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function updatePublishMode(publishMode: OfficialPublisherMode) {
    setErrors([]);
    setForm(current => ({
      ...current,
      publishMode,
      rewriteRequirement: hasText(current.rewriteRequirement)
        ? current.rewriteRequirement
        : defaultRewriteRequirement,
    }));
  }

  function updateEditorMode(editorMode: PublisherEditorMode) {
    setErrors([]);
    setForm(current => {
      const currentSetting = getActiveModeSetting(current);
      const next: WechatPublisherForm = {
        ...current,
        modeSettings: {
          ...current.modeSettings,
          [current.publishMode]: {
            ...currentSetting,
            editorMode,
          },
        },
      };
      const shouldSeedAdvancedFields =
        editorMode === 'advanced' &&
        !hasText(current.promptSystem) &&
        !hasText(current.promptContent) &&
        !hasText(current.imageCover.value) &&
        current.imagesInlineList.length === 0;
      if (!shouldSeedAdvancedFields) return next;

      const template =
        promptTemplates.find(item => item.id === currentSetting.templateId) ??
        promptTemplates[0]!;
      return { ...next, ...getTemplateContent(template) };
    });
  }

  function updateSelectedTemplate(templateId: PromptTemplateId) {
    setErrors([]);
    const template = promptTemplates.find(item => item.id === templateId);
    if (!template) return;
    setForm(current => {
      const activeSetting = getActiveModeSetting(current);
      const next = {
        ...current,
        modeSettings: {
          ...current.modeSettings,
          [current.publishMode]: {
            ...activeSetting,
            templateId,
          },
        },
      };

      return activeSetting.editorMode === 'advanced'
        ? { ...next, ...getTemplateContent(template) }
        : next;
    });
    setStatusText(
      `${publisherCopy.simpleMode.selectedPrefix}「${template.label}」${publisherCopy.simpleMode.selectedSuffix}`
    );
  }

  function updateCoverImageValue(value: string) {
    setForm(current => ({
      ...current,
      imageCover: { ...current.imageCover, value },
    }));
  }

  function updateComment(comment: OfficialCommentConfig) {
    setForm(current => ({ ...current, comment }));
  }

  function validate() {
    const nextErrors = getValidationErrors(
      form,
      publisherCopy,
      selectedPromptTemplate
    );
    setErrors(nextErrors);
    return nextErrors.length === 0;
  }

  function updateInlineImage(
    index: number,
    patch: Partial<OfficialImageConfig>
  ) {
    setForm(current => ({
      ...current,
      imagesInlineList: current.imagesInlineList.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function addInlineImage() {
    setForm(current => {
      if (current.imagesInlineList.length >= 9) return current;
      return {
        ...current,
        imagesInlineList: [
          ...current.imagesInlineList,
          { type: 'ai', value: '' },
        ],
      };
    });
  }

  function removeInlineImage(index: number) {
    setForm(current => ({
      ...current,
      imagesInlineList: current.imagesInlineList.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  }

  function updatePublishProgress(event: OfficialPublisherProgressEvent) {
    if (event.key === 'workflow') {
      if (event.status === 'completed') setPublishPhase('completed');
      if (event.status === 'failed') setPublishPhase('failed');
      return;
    }
    if (!event.step) return;

    setPublishSteps(current =>
      current.map(step => {
        if (step.index !== event.step) return step;
        const status: PublishStepStatus =
          event.status === 'info'
            ? step.status === 'pending'
              ? 'running'
              : step.status
            : event.status === 'warning'
              ? 'warning'
              : event.status === 'completed' ||
                  event.status === 'failed' ||
                  event.status === 'running'
                ? event.status
                : step.status;
        const requestedCount = event.requestedCount ?? step.requestedCount;
        const currentInlineImageIndex =
          event.key === 'prepare_inline_images' &&
          requestedCount &&
          (event.status === 'running' || event.status === 'info')
            ? event.status === 'info' && event.imageIndex !== undefined
              ? Math.min(event.imageIndex + 1, requestedCount)
              : 1
            : undefined;
        const message =
          currentInlineImageIndex && requestedCount
            ? event.status === 'info' &&
              event.imageIndex !== undefined &&
              event.imageIndex >= requestedCount
              ? `${publisherCopy.progress.inlineUploaded}（${requestedCount}/${requestedCount}）`
              : `${publisherCopy.progress.inlineGenerating}（${currentInlineImageIndex}/${requestedCount}）`
            : event.message ||
              (event.status === 'info' && event.imageIndex
                ? `${publisherCopy.progress.inlineUploadedSingle} ${event.imageIndex}`
                : undefined);
        const durationMs =
          event.key === 'prepare_inline_images' &&
          event.status === 'info' &&
          event.durationMs !== undefined
            ? (step.durationMs ?? 0) + event.durationMs
            : (event.durationMs ?? step.durationMs);
        return {
          ...step,
          status,
          message: message ?? step.message,
          durationMs,
          requestedCount,
        };
      })
    );

    if (event.status === 'running') {
      setPublishPhase('publishing');
      setStatusText(
        `${publisherCopy.status.runningPrefix}${
          event.name || publisherCopy.status.runningFallback
        }。`
      );
    } else if (event.status === 'warning') {
      setStatusText(event.message || publisherCopy.status.skipped);
    } else if (event.status === 'failed') {
      setPublishPhase('failed');
      setStatusText(
        `${publisherCopy.status.failedPrefix}${
          event.message || publisherCopy.status.failedFallback
        }`
      );
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      setStatusText(publisherCopy.status.validationFailed);
      return;
    }
    const confirmed = window.confirm(
      form.publishMode === 'rewrite'
        ? publisherCopy.status.confirmRewrite
        : publisherCopy.status.confirmGenerate
    );
    if (!confirmed) return;

    setIsGenerating(true);
    setDraftResult(null);
    setDraftResultOpen(false);
    setPublishPhase('connecting');
    setPublishSteps(createInitialPublishSteps(publisherCopy.stepNames));
    setPublishElapsedMs(0);
    setStatusText(publisherCopy.status.connecting);

    const body = buildPublisherRequestBody(
      form,
      selectedPromptTemplate,
      defaultRewriteRequirement
    );

    try {
      publisherAbortRef.current?.abort();
      const controller = new AbortController();
      publisherAbortRef.current = controller;
      publishStartedAtRef.current = Date.now();
      const result = await streamPostOfficialPublisher(body, {
        signal: controller.signal,
        onConnected: event => {
          setPublishPhase('publishing');
          setStatusText(event.message || publisherCopy.status.connected);
        },
        onProgress: updatePublishProgress,
      });
      setDraftResult(result);
      setDraftResultOpen(true);
      setPublishPhase('completed');
      setStatusText(
        result?.title
          ? `${publisherCopy.status.draftCreatedPrefix}「${result.title}」${publisherCopy.status.draftCreatedSuffix}`
          : publisherCopy.status.draftCreated
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : publisherCopy.status.submitFailed;
      setPublishPhase('failed');
      setPublishSteps(current =>
        current.map(step =>
          step.status === 'running' || step.status === 'warning'
            ? { ...step, status: 'failed', message }
            : step
        )
      );
      setStatusText(`${publisherCopy.status.failedPrefix}${message}`);
    } finally {
      if (publishStartedAtRef.current) {
        setPublishElapsedMs(Date.now() - publishStartedAtRef.current);
      }
      publishStartedAtRef.current = null;
      publisherAbortRef.current = null;
      setIsGenerating(false);
    }
  }

  function handleReset() {
    const confirmed = window.confirm(publisherCopy.status.resetConfirm);
    if (!confirmed) return;
    setForm(localizedDefaultForm);
    setErrors([]);
    setDraftResult(null);
    setDraftResultOpen(false);
    setPublishPhase('idle');
    setPublishSteps(createInitialPublishSteps(publisherCopy.stepNames));
    setPublishElapsedMs(0);
    setStatusText(publisherCopy.status.resetDone);
  }

  function handleExport() {
    const blob = new Blob([exportedJson], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orz2-wechat-publisher-config.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatusText(publisherCopy.status.exportDone);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = normalizeForm(
        JSON.parse(await file.text()),
        defaultRewriteRequirement
      );
      setForm(imported);
      setErrors([]);
      setStatusText(publisherCopy.status.importDone);
    } catch {
      setStatusText(publisherCopy.status.importFailed);
    } finally {
      event.target.value = '';
    }
  }

  async function handleCopyIp() {
    try {
      await window.navigator.clipboard.writeText(apiWhitelistIp);
      setCopiedIp(true);
      window.setTimeout(() => setCopiedIp(false), 1800);
    } catch {
      setStatusText(
        `${publisherCopy.status.copyFailedPrefix} ${apiWhitelistIp} ${publisherCopy.status.copyFailedSuffix}`
      );
    }
  }

  return (
    <>
      <Seo config={localizedToolSeo[officialPublisherSeoKey]} />
      <section className='tool-form-page'>
        <div className='tool-form-topbar'>
          <Link className='back-link interactive' to={localizePath('/tools')}>
            <ArrowLeft size={16} aria-hidden='true' />
            {publisherCopy.backLabel}
          </Link>
          <div
            className='json-actions'
            aria-label={publisherCopy.jsonActionsAriaLabel}
          >
            <OButton
              type='button'
              variant='ghost'
              onClick={() => importInputRef.current?.click()}
            >
              <Upload size={17} aria-hidden='true' />
              {publisherCopy.importJson}
            </OButton>
            <OButton type='button' variant='secondary' onClick={handleExport}>
              <Download size={17} aria-hidden='true' />
              {publisherCopy.exportJson}
            </OButton>
            <input
              ref={importInputRef}
              className='sr-only'
              type='file'
              accept='application/json,.json'
              onChange={handleImport}
            />
          </div>
        </div>
        <header className='tool-form-hero'>
          <div className='tool-form-hero-copy'>
            <h1>{publisherTool?.name ?? publisherCopy.fallbackName}</h1>
            <p>{publisherTool?.summary ?? publisherCopy.fallbackSummary}</p>
          </div>
        </header>

        <OCard
          as='section'
          className='wechat-setup-card'
          aria-labelledby='wechat-setup-title'
          padding='sm'
          tone='warm'
        >
          <OTooltip
            className='wechat-setup-visual interactive'
            ariaLabel={publisherCopy.setupAriaLabel}
            content={
              <div className='wechat-setup-preview'>
                <img src={WechatConsoleGuide} alt='' />
              </div>
            }
            contentClassName='wechat-setup-tooltip'
            maxWidth={680}
            placement='bottom-start'
            offset={12}
          >
            <img src={WechatConsoleGuide} alt={publisherCopy.setupImageAlt} />
          </OTooltip>
          <div className='wechat-setup-content'>
            <h2 id='wechat-setup-title'>{publisherCopy.setupTitle}</h2>
            <ol className='setup-steps'>
              <li>{publisherCopy.setupSteps[0]}</li>
              <li>{publisherCopy.setupSteps[1]}</li>
              <li>
                {publisherCopy.setupSteps[2]} <code>{apiWhitelistIp}</code>.
              </li>
            </ol>
            <div className='setup-actions'>
              <OButton href={wechatConsoleUrl} target='_blank' rel='noreferrer'>
                <ExternalLink size={17} aria-hidden='true' />
                {publisherCopy.openWechatConsole}
              </OButton>
              <OButton type='button' variant='secondary' onClick={handleCopyIp}>
                <Clipboard size={17} aria-hidden='true' />
                {copiedIp ? publisherCopy.copiedIp : publisherCopy.copyIp}
              </OButton>
            </div>
          </div>
        </OCard>

        <OCard
          as='section'
          className='publisher-automation-card'
          aria-labelledby='publisher-automation-title'
          padding='sm'
          tone='soft'
        >
          <span className='publisher-automation-icon' aria-hidden='true'>
            <CalendarClock size={21} />
          </span>
          <div className='publisher-automation-copy'>
            <span>{publisherCopy.automation.eyebrow}</span>
            <h2 id='publisher-automation-title'>
              {publisherCopy.automation.title}
            </h2>
            <p>{publisherCopy.automation.description}</p>
          </div>
          <OButton
            href={`mailto:${officialPublisherScheduleEmail}?subject=${encodeURIComponent(
              publisherCopy.automation.emailSubject
            )}`}
            variant='secondary'
          >
            <Mail size={16} aria-hidden='true' />
            {publisherCopy.automation.action}
          </OButton>
        </OCard>

        <form
          className='publisher-form box-border pb-4'
          onSubmit={handleGenerate}
        >
          <div className='publisher-workspace'>
            <div className='publisher-main'>
              <OCard as='section' className='form-panel' padding='md'>
                <div className='form-panel-heading'>
                  <span className='panel-icon'>
                    <KeyRound size={19} aria-hidden='true' />
                  </span>
                  <div>
                    <h2>{publisherCopy.sections.account.title}</h2>
                    <p>{publisherCopy.sections.account.description}</p>
                  </div>
                </div>
                <div className='form-grid two'>
                  <label className='field'>
                    <span>appId *</span>
                    <input
                      value={form.appId}
                      onChange={event =>
                        updateField('appId', event.target.value)
                      }
                      placeholder={
                        publisherCopy.sections.account.appIdPlaceholder
                      }
                      required
                    />
                  </label>
                  <label className='field'>
                    <span>appSecret *</span>
                    <input
                      value={form.appSecret}
                      onChange={event =>
                        updateField('appSecret', event.target.value)
                      }
                      placeholder={
                        publisherCopy.sections.account.appSecretPlaceholder
                      }
                      type='password'
                      required
                    />
                  </label>
                </div>
                <fieldset className='choice-field'>
                  <legend>{publisherCopy.sections.account.provider}</legend>
                  {providerOptions.map(option => (
                    <label className='interactive' key={option.value}>
                      <input
                        type='radio'
                        checked={form.provider === option.value}
                        onChange={() => updateField('provider', option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </fieldset>
                <div className='account-mode-switch'>
                  <span className='mode-choice-label'>
                    {publisherCopy.modeSwitch.title}
                  </span>
                  <ORadio
                    ariaLabel={publisherCopy.modeSwitch.legend}
                    className='publisher-mode-radio compact'
                    options={modeOptions}
                    value={form.publishMode}
                    onChange={updatePublishMode}
                  />
                </div>
              </OCard>

              <OCard
                as='section'
                className='form-panel publisher-config-card'
                padding='md'
              >
                <div className='form-panel-heading module-heading'>
                  <span className='panel-icon'>
                    {form.publishMode === 'rewrite' ? (
                      <PenLine size={19} aria-hidden='true' />
                    ) : (
                      <LayoutTemplate size={19} aria-hidden='true' />
                    )}
                  </span>
                  <div className='form-panel-heading-main'>
                    <h2>
                      {form.publishMode === 'rewrite'
                        ? publisherCopy.sections.rewrite.title
                        : publisherCopy.simpleMode.title}
                    </h2>
                    <p>
                      {form.publishMode === 'rewrite'
                        ? isAdvancedMode
                          ? publisherCopy.sections.rewrite.description
                          : publisherCopy.sections.rewrite.simpleDescription
                        : publisherCopy.simpleMode.description}
                    </p>
                  </div>
                  <div className='module-mode-switch'>
                    <span>{publisherCopy.editorModes.legend}</span>
                    <ORadio
                      ariaLabel={publisherCopy.editorModes.legend}
                      className='publisher-editor-mode-radio compact'
                      options={editorModeOptions}
                      value={activeModeSetting.editorMode}
                      onChange={updateEditorMode}
                    />
                  </div>
                </div>

                {form.publishMode === 'rewrite' ? (
                  <label className='field'>
                    <span>{publisherCopy.sections.rewrite.sourceUrl}</span>
                    <input
                      value={form.sourceArticleUrl}
                      onChange={event =>
                        updateField('sourceArticleUrl', event.target.value)
                      }
                      placeholder={
                        publisherCopy.sections.rewrite.sourceUrlPlaceholder
                      }
                      required
                    />
                  </label>
                ) : null}

                <div className='template-picker'>
                  <label className='simple-template-field'>
                    <span>{publisherCopy.simpleMode.templateLabel}</span>
                    <OSelector
                      ariaLabel={publisherCopy.simpleMode.selectorAriaLabel}
                      className='simple-template-selector'
                      options={templateOptions}
                      placement='bottom'
                      value={activeModeSetting.templateId}
                      onChange={updateSelectedTemplate}
                    />
                  </label>
                  <div className='template-summary'>
                    <CheckCircle2 size={16} aria-hidden='true' />
                    <span>
                      <strong>{selectedPromptTemplate.label}</strong>
                      {selectedPromptTemplate.caption}
                    </span>
                  </div>
                </div>

                {!isAdvancedMode && form.publishMode === 'rewrite' ? (
                  <div className='rewrite-simple-note'>
                    <Zap size={16} aria-hidden='true' />
                    <span>{publisherCopy.sections.rewrite.simpleHint}</span>
                  </div>
                ) : null}

                {isAdvancedMode ? (
                  <div className='advanced-config'>
                    {form.publishMode === 'rewrite' ? (
                      <div className='advanced-config-section'>
                        <div className='advanced-section-heading'>
                          <h3>{publisherCopy.sections.rewrite.requirement}</h3>
                          <p>
                            {publisherCopy.sections.rewrite.requirementHint}
                          </p>
                        </div>
                        <label className='field'>
                          <span>
                            {publisherCopy.sections.rewrite.requirement}
                          </span>
                          <textarea
                            value={form.rewriteRequirement}
                            onChange={event =>
                              updateField(
                                'rewriteRequirement',
                                event.target.value
                              )
                            }
                            rows={5}
                            placeholder={
                              publisherCopy.sections.rewrite
                                .requirementPlaceholder
                            }
                          />
                        </label>
                      </div>
                    ) : null}

                    <div className='advanced-config-section'>
                      <div className='advanced-section-heading'>
                        <h3>{publisherCopy.sections.prompt.title}</h3>
                        <p>{publisherCopy.sections.prompt.description}</p>
                      </div>
                      <label className='field'>
                        <span>{publisherCopy.sections.prompt.systemLabel}</span>
                        <OInputAI
                          as='textarea'
                          value={form.promptSystem}
                          onValueChange={value =>
                            updateField('promptSystem', value)
                          }
                          polishMode='official_system_prompt'
                          rows={4}
                          placeholder={
                            publisherCopy.sections.prompt.systemPlaceholder
                          }
                        />
                      </label>
                      <label className='field'>
                        <span>
                          {publisherCopy.sections.prompt.contentLabel}
                        </span>
                        <OInputAI
                          as='textarea'
                          value={form.promptContent}
                          onValueChange={value =>
                            updateField('promptContent', value)
                          }
                          polishMode='official_content_prompt'
                          rows={5}
                          placeholder={
                            publisherCopy.sections.prompt.contentPlaceholder
                          }
                        />
                      </label>
                    </div>

                    <div className='advanced-config-section'>
                      <div className='advanced-section-heading'>
                        <h3>{publisherCopy.sections.images.title}</h3>
                        <p>{publisherCopy.sections.images.description}</p>
                      </div>
                      <label className='field'>
                        <span>{publisherCopy.sections.images.coverLabel}</span>
                        <OInputAI
                          value={form.imageCover.value}
                          onValueChange={updateCoverImageValue}
                          polishMode='official_image_prompt'
                          disabledPolish={form.imageCover.type !== 'ai'}
                          placeholder={
                            form.imageCover.type === 'ai'
                              ? publisherCopy.sections.images.coverAiPlaceholder
                              : publisherCopy.sections.images
                                  .coverUrlPlaceholder
                          }
                          required
                        />
                      </label>

                      <div className='inline-image-head'>
                        <div>
                          <h3>{publisherCopy.sections.images.inlineTitle}</h3>
                          <p>
                            {form.imagesInlineList.length
                              ? publisherCopy.sections.images
                                  .inlineAddedPrefix +
                                ' ' +
                                form.imagesInlineList.length +
                                ' ' +
                                publisherCopy.sections.images.inlineAddedSuffix
                              : publisherCopy.sections.images.inlineEmpty}
                          </p>
                        </div>
                        <OButton
                          type='button'
                          size='sm'
                          variant='ghost'
                          onClick={addInlineImage}
                          disabled={form.imagesInlineList.length >= 9}
                        >
                          <Plus size={17} aria-hidden='true' />
                          {publisherCopy.sections.images.addImage}
                        </OButton>
                      </div>
                      <div className='inline-image-list'>
                        {form.imagesInlineList.map((item, index) => (
                          <OCard
                            as='article'
                            className='inline-image-item'
                            key={index}
                            padding='sm'
                            tone='soft'
                          >
                            <div className='inline-image-title'>
                              <strong>
                                {publisherCopy.sections.images.inlineImage}{' '}
                                {index + 1}
                              </strong>
                              <OIconButton
                                type='button'
                                aria-label={
                                  publisherCopy.sections.images
                                    .deleteInlineImage +
                                  ' ' +
                                  (index + 1)
                                }
                                onClick={() => removeInlineImage(index)}
                                size='sm'
                              >
                                <Trash2 size={17} />
                              </OIconButton>
                            </div>
                            <label className='field'>
                              <span>
                                {publisherCopy.sections.images.imageValueLabel}
                              </span>
                              <OInputAI
                                value={item.value}
                                onValueChange={value =>
                                  updateInlineImage(index, { value })
                                }
                                polishMode='official_image_prompt'
                                disabledPolish={item.type !== 'ai'}
                                placeholder={
                                  item.type === 'ai'
                                    ? publisherCopy.sections.images
                                        .imageAiPlaceholder
                                    : publisherCopy.sections.images
                                        .imageUrlPlaceholder
                                }
                              />
                            </label>
                          </OCard>
                        ))}
                      </div>
                    </div>

                    <div className='advanced-config-section'>
                      <div className='advanced-section-heading'>
                        <h3>{publisherCopy.sections.meta.title}</h3>
                        <p>{publisherCopy.sections.meta.description}</p>
                      </div>
                      <div className='form-grid two'>
                        <label className='field'>
                          <span>{publisherCopy.sections.meta.author}</span>
                          <input
                            value={form.author}
                            onChange={event =>
                              updateField('author', event.target.value)
                            }
                            placeholder={
                              publisherCopy.sections.meta.authorPlaceholder
                            }
                          />
                        </label>
                        <fieldset className='choice-field compact'>
                          <legend>{publisherCopy.sections.meta.comment}</legend>
                          {commentOptions.map(option => (
                            <label className='interactive' key={option.label}>
                              <input
                                type='radio'
                                checked={
                                  option.value.open === form.comment.open &&
                                  option.value.fansOnly ===
                                    form.comment.fansOnly
                                }
                                onChange={() => updateComment(option.value)}
                              />
                              {option.label}
                            </label>
                          ))}
                        </fieldset>
                      </div>
                    </div>
                  </div>
                ) : null}
              </OCard>
            </div>

            <aside
              className='publisher-aside'
              aria-label={publisherCopy.aside.summaryAriaLabel}
              ref={publisherAsideRef}
            >
              <OCard
                as='section'
                className='publisher-action-dock'
                aria-label={publisherCopy.aside.actionAriaLabel}
                padding='md'
                tone='soft'
              >
                <div
                  className='publish-readiness-card'
                  aria-label={publisherCopy.aside.progressAriaLabel}
                >
                  <div className='publish-readiness-head'>
                    <div className='summary-heading'>
                      <CheckCircle2 size={18} aria-hidden='true' />
                      <h2>{publisherCopy.aside.progressTitle}</h2>
                    </div>
                    <strong>
                      {completedCount}
                      <small>/{completionItems.length}</small>
                    </strong>
                  </div>
                  <div className='publish-readiness-meter' aria-hidden='true'>
                    <span
                      style={{
                        width: `${(completedCount / completionItems.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className='summary-checks'>
                    {completionItems.map(item => (
                      <div
                        className={
                          item.done ? 'summary-check done' : 'summary-check'
                        }
                        key={item.label}
                      >
                        <CheckCircle2 size={17} aria-hidden='true' />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='publisher-status-line' aria-live='polite'>
                  {isGenerating ? (
                    <Loader2 className='spin' size={18} aria-hidden='true' />
                  ) : publishPhase === 'completed' ? (
                    <CheckCircle2 size={18} aria-hidden='true' />
                  ) : null}
                  <span>{statusText}</span>
                </div>
                {publishPhase === 'completed' ? (
                  <button
                    className='publisher-result-reopen interactive'
                    type='button'
                    onClick={() => setDraftResultOpen(true)}
                  >
                    <FileJson size={15} aria-hidden='true' />
                    {publisherCopy.aside.viewResult}
                  </button>
                ) : null}
                <div className='publisher-action-buttons'>
                  <OButton
                    className='publisher-reset'
                    type='button'
                    variant='ghost'
                    onClick={handleReset}
                    disabled={isGenerating}
                  >
                    <RotateCcw size={17} aria-hidden='true' />
                    {publisherCopy.aside.reset}
                  </OButton>
                  <OButton
                    className='publisher-submit'
                    type='submit'
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className='spin' size={17} aria-hidden='true' />
                    ) : (
                      <Sparkles size={17} aria-hidden='true' />
                    )}
                    {isGenerating
                      ? publisherCopy.aside.generating
                      : form.publishMode === 'rewrite'
                        ? publisherCopy.aside.generateRewrite
                        : publisherCopy.aside.generate}
                  </OButton>
                </div>
              </OCard>

              {publishPhase !== 'idle' ? (
                <PublisherProgressPanel
                  copy={publisherCopy}
                  elapsedMs={publishElapsedMs}
                  phase={publishPhase}
                  steps={publishSteps}
                />
              ) : null}
            </aside>
          </div>

          {errors.length ? (
            <OCard
              className='form-errors'
              padding='sm'
              role='alert'
              tone='danger'
            >
              {errors.map(error => (
                <p key={error}>{error}</p>
              ))}
            </OCard>
          ) : null}
        </form>
      </section>

      {isDraftResultOpen ? (
        <DraftSuccessModal
          copy={publisherCopy}
          draftResult={draftResult}
          onClose={() => setDraftResultOpen(false)}
        />
      ) : null}
    </>
  );
}
