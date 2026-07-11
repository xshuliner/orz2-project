import {
  streamPostOfficialPublisher,
  type OfficialCommentConfig,
  type OfficialDraftResult,
  type OfficialImageConfig,
  type OfficialPublisherMode,
  type OfficialPublisherProgressEvent,
} from '@/api';
import WechatConsoleGuide from '@/assets/wechat-console-guide.svg';
import { OBadge } from '@/components/OBadge';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { OInputAI } from '@/components/OInputAI';
import { OModalConfirm } from '@/components/OModalConfirm';
import { ORadio } from '@/components/ORadio';
import { OSelector } from '@/components/OSelector';
import { OTooltip } from '@/components/OTooltip';
import { Seo } from '@/components/Seo';
import { getToolSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';
import { getTools } from '@/i18n';
import { DraftSuccessModal } from '@/pages/Tools/ToolOfficialPublisher/components/DraftSuccessModal';
import { PublisherModuleCard } from '@/pages/Tools/ToolOfficialPublisher/components/PublisherModuleCard';
import { PublisherProgressPanel } from '@/pages/Tools/ToolOfficialPublisher/components/PublisherProgressPanel';
import {
  apiWhitelistIp,
  defaultPublisherForm,
  getPromptTemplates,
  officialPublisherModes,
  officialPublisherProviders,
  officialPublisherScheduleEmail,
  officialPublisherSeoKey,
  officialPublisherStorageKey,
  officialPublisherToolId,
  wechatConsoleUrl,
  type PromptTemplateId,
} from '@/pages/Tools/ToolOfficialPublisher/config';
import type {
  OfficialPublisherForm,
  PublishPhase,
  PublishStepStatus,
} from '@/pages/Tools/ToolOfficialPublisher/types';
import {
  buildPublisherRequestBody,
  getActiveModeSetting,
  getCompletionItems,
  getTemplateContent,
  getValidationErrors,
  hasTemplateCustomizations,
  hasText,
  normalizeForm,
} from '@/pages/Tools/ToolOfficialPublisher/utils/form';

import { createInitialPublishSteps } from '@/pages/Tools/ToolOfficialPublisher/utils/progress';
import CacheManager from '@/utils/CacheManager';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronsDown,
  ChevronsUp,
  Clipboard,
  ClipboardPenLine,
  CookingPot,
  Cpu,
  Download,
  Dumbbell,
  ExternalLink,
  FileDiff,
  FilePenLine,
  GraduationCap,
  Heart,
  HeartHandshake,
  KeyRound,
  Landmark,
  Loader2,
  Mail,
  Plane,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
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

type CommentOptionValue = 'closed' | 'open' | 'fansOnly';

const commentConfigByValue: Record<CommentOptionValue, OfficialCommentConfig> =
  {
    closed: { open: 0, fansOnly: 0 },
    open: { open: 1, fansOnly: 0 },
    fansOnly: { open: 1, fansOnly: 1 },
  };

const promptTemplateIcons: Record<PromptTemplateId, LucideIcon> = {
  general: ClipboardPenLine,
  insurance_advisor: ShieldCheck,
  culture: Landmark,
  tech: Cpu,
  lifestyle: Heart,
  business: BriefcaseBusiness,
  education: GraduationCap,
  emotion: HeartHandshake,
  travel: Plane,
  food: CookingPot,
  fitness: Dumbbell,
};

export function PageOfficialPublisher() {
  const { locale, localizePath, messages } = useI18n();
  const publisherCopy = messages.publisher;
  const defaultRewriteRequirement = publisherCopy.defaultRewriteRequirement;
  const localizedDefaultForm = useMemo(
    () => ({
      ...defaultPublisherForm,
      modeSettings: {
        create: { ...defaultPublisherForm.modeSettings.create },
        rewrite: { ...defaultPublisherForm.modeSettings.rewrite },
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
  const commentOptions = useMemo<
    Array<{ label: string; value: CommentOptionValue }>
  >(
    () => [
      { label: publisherCopy.comments.closed, value: 'closed' },
      { label: publisherCopy.comments.open, value: 'open' },
      {
        label: publisherCopy.comments.fansOnly,
        value: 'fansOnly',
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
      description: modeCopy[mode].description,
      icon: mode === 'create' ? FilePenLine : FileDiff,
    }));
  }, [publisherCopy.modes]);
  const templateOptions = useMemo(
    () =>
      promptTemplates.map(template => ({
        value: template.id,
        label: template.label,
        description: template.caption,
        icon: promptTemplateIcons[template.id],
      })),
    [promptTemplates]
  );
  const [form, setForm] = useState<OfficialPublisherForm>(() => {
    try {
      return normalizeForm(
        CacheManager.getLocalStorage(officialPublisherStorageKey),
        defaultRewriteRequirement
      );
    } catch {
      return localizedDefaultForm;
    }
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatusText, setPublishStatusText] = useState<string>(
    publisherCopy.status.autosave
  );
  const [publishPhase, setPublishPhase] = useState<PublishPhase>('idle');
  const [publishSteps, setPublishSteps] = useState(() =>
    createInitialPublishSteps(publisherCopy.stepNames)
  );
  const [publishElapsedMs, setPublishElapsedMs] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [draftResult, setDraftResult] = useState<OfficialDraftResult | null>(
    null
  );
  const [isDraftResultOpen, setDraftResultOpen] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] =
    useState<PromptTemplateId | null>(null);
  const [isPublishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setResetConfirmOpen] = useState(false);
  const selectedCommentOption: CommentOptionValue =
    form.comment.open === 0
      ? 'closed'
      : form.comment.fansOnly === 1
        ? 'fansOnly'
        : 'open';
  const activeModeSetting = getActiveModeSetting(form);
  const isCustomizationOpen = activeModeSetting.isCustomizationOpen;
  const selectedPromptTemplate =
    promptTemplates.find(
      template => template.id === activeModeSetting.templateId
    ) ?? promptTemplates[0]!;
  const pendingTemplate = pendingTemplateId
    ? promptTemplates.find(template => template.id === pendingTemplateId)
    : undefined;
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const publisherAsideRef = useRef<HTMLElement | null>(null);
  const publisherAbortRef = useRef<AbortController | null>(null);
  const publishStartedAtRef = useRef<number | null>(null);
  useEffect(() => {
    CacheManager.setLocalStorage(officialPublisherStorageKey, form);
  }, [form]);

  useEffect(() => {
    if (!isPublishing) return;
    const timer = window.setInterval(() => {
      if (publishStartedAtRef.current) {
        setPublishElapsedMs(Date.now() - publishStartedAtRef.current);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPublishing]);

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

  function updateField<K extends keyof OfficialPublisherForm>(
    key: K,
    value: OfficialPublisherForm[K]
  ) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function updatePublishMode(publishMode: OfficialPublisherMode) {
    setValidationErrors([]);
    setForm(current => ({
      ...current,
      publishMode,
      rewriteRequirement: hasText(current.rewriteRequirement)
        ? current.rewriteRequirement
        : defaultRewriteRequirement,
    }));
  }

  function updateCustomizationOpen(isOpen: boolean) {
    setValidationErrors([]);
    setForm(current => {
      const currentSetting = getActiveModeSetting(current);
      const next: OfficialPublisherForm = {
        ...current,
        modeSettings: {
          ...current.modeSettings,
          [current.publishMode]: {
            ...currentSetting,
            isCustomizationOpen: isOpen,
          },
        },
      };
      const shouldSeedAdvancedFields =
        isOpen &&
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

  function applyTemplate(templateId: PromptTemplateId) {
    setValidationErrors([]);
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

      return { ...next, ...getTemplateContent(template) };
    });
    setPublishStatusText(
      `${publisherCopy.simpleMode.selectedPrefix}「${template.label}」${publisherCopy.simpleMode.selectedSuffix}`
    );
  }

  function updateSelectedTemplate(templateId: PromptTemplateId) {
    if (templateId === activeModeSetting.templateId) return;
    if (hasTemplateCustomizations(form, selectedPromptTemplate)) {
      setPendingTemplateId(templateId);
      return;
    }
    applyTemplate(templateId);
  }

  function confirmTemplateReplacement() {
    if (!pendingTemplateId) return;
    applyTemplate(pendingTemplateId);
    setPendingTemplateId(null);
  }

  function validatePublisherForm() {
    const nextErrors = getValidationErrors(
      form,
      publisherCopy,
      selectedPromptTemplate
    );
    setValidationErrors(nextErrors);
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
      setPublishStatusText(
        `${publisherCopy.status.runningPrefix}${
          event.name || publisherCopy.status.runningFallback
        }。`
      );
    } else if (event.status === 'warning') {
      setPublishStatusText(event.message || publisherCopy.status.skipped);
    } else if (event.status === 'failed') {
      setPublishPhase('failed');
      setPublishStatusText(
        `${publisherCopy.status.failedPrefix}${
          event.message || publisherCopy.status.failedFallback
        }`
      );
    }
  }

  function handlePublishRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validatePublisherForm()) {
      setPublishStatusText(publisherCopy.status.validationFailed);
      return;
    }
    setPublishConfirmOpen(true);
  }

  async function handlePublishConfirm() {
    setPublishConfirmOpen(false);
    setIsPublishing(true);
    setDraftResult(null);
    setDraftResultOpen(false);
    setPublishPhase('connecting');
    setPublishSteps(createInitialPublishSteps(publisherCopy.stepNames));
    setPublishElapsedMs(0);
    setPublishStatusText(publisherCopy.status.connecting);

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
          setPublishStatusText(event.message || publisherCopy.status.connected);
        },
        onProgress: updatePublishProgress,
      });
      setDraftResult(result);
      setDraftResultOpen(true);
      setPublishPhase('completed');
      setPublishStatusText(
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
      setPublishStatusText(`${publisherCopy.status.failedPrefix}${message}`);
    } finally {
      if (publishStartedAtRef.current) {
        setPublishElapsedMs(Date.now() - publishStartedAtRef.current);
      }
      publishStartedAtRef.current = null;
      publisherAbortRef.current = null;
      setIsPublishing(false);
    }
  }

  function handleResetConfirm() {
    setResetConfirmOpen(false);
    setForm(localizedDefaultForm);
    setValidationErrors([]);
    setDraftResult(null);
    setDraftResultOpen(false);
    setPublishPhase('idle');
    setPublishSteps(createInitialPublishSteps(publisherCopy.stepNames));
    setPublishElapsedMs(0);
    setPublishStatusText(publisherCopy.status.resetDone);
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
    setPublishStatusText(publisherCopy.status.exportDone);
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
      setValidationErrors([]);
      setPublishStatusText(publisherCopy.status.importDone);
    } catch {
      setPublishStatusText(publisherCopy.status.importFailed);
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
      setPublishStatusText(
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

        <PublisherModuleCard
          className='publisher-automation-card'
          description={publisherCopy.automation.description}
          headingExtra={
            <OBadge tone='warning'>{publisherCopy.automation.eyebrow}</OBadge>
          }
          icon={CalendarClock}
          padding='sm'
          tone='soft'
          title={publisherCopy.automation.title}
          titleId='publisher-automation-title'
          action={
            <OButton
              href={`mailto:${officialPublisherScheduleEmail}?subject=${encodeURIComponent(
                publisherCopy.automation.emailSubject
              )}`}
              variant='secondary'
            >
              <Mail size={16} aria-hidden='true' />
              {publisherCopy.automation.action}
            </OButton>
          }
        />

        <form
          className='publisher-form box-border pb-4'
          onSubmit={handlePublishRequest}
        >
          <div className='publisher-workspace'>
            <div className='publisher-main'>
              <PublisherModuleCard
                description={publisherCopy.sections.account.description}
                icon={KeyRound}
                title={publisherCopy.sections.account.title}
              >
                <div className='form-grid account-config-grid'>
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
                  <label className='field'>
                    <span>{publisherCopy.sections.account.provider}</span>
                    <OSelector
                      ariaLabel={
                        publisherCopy.sections.account.modelSelectorAriaLabel
                      }
                      className='account-model-selector'
                      options={providerOptions}
                      value={form.provider}
                      onChange={provider => updateField('provider', provider)}
                    />
                  </label>
                </div>
              </PublisherModuleCard>

              <PublisherModuleCard
                className='publisher-mode-card'
                description={publisherCopy.modeSwitch.description}
                icon={FileDiff}
                title={publisherCopy.modeSwitch.title}
              >
                <div className='mode-choice-field'>
                  <ORadio
                    ariaLabel={publisherCopy.modeSwitch.legend}
                    className='publisher-mode-radio'
                    options={modeOptions}
                    value={form.publishMode}
                    onChange={updatePublishMode}
                  />
                </div>
                {form.publishMode === 'rewrite' ? (
                  <label className='field rewrite-source-field'>
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
              </PublisherModuleCard>

              <PublisherModuleCard
                className='publisher-config-card'
                description={publisherCopy.simpleMode.description}
                icon={ClipboardPenLine}
                title={publisherCopy.simpleMode.title}
              >
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

                {!isCustomizationOpen && form.publishMode === 'rewrite' ? (
                  <div className='rewrite-simple-note'>
                    <FileDiff size={16} aria-hidden='true' />
                    <span>{publisherCopy.sections.rewrite.templateHint}</span>
                  </div>
                ) : null}

                {isCustomizationOpen ? (
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
                          onValueChange={value =>
                            setForm(current => ({
                              ...current,
                              imageCover: { ...current.imageCover, value },
                            }))
                          }
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
                          <article className='inline-image-item' key={index}>
                            <strong className='inline-image-title'>
                              {publisherCopy.sections.images.inlineImage}{' '}
                              {index + 1}
                            </strong>
                            <label className='field inline-image-value'>
                              <span className='sr-only'>
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
                          </article>
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
                        <label className='field'>
                          <span>{publisherCopy.sections.meta.comment}</span>
                          <OSelector
                            ariaLabel={publisherCopy.sections.meta.comment}
                            className='advanced-comment-selector'
                            options={commentOptions}
                            value={selectedCommentOption}
                            onChange={value =>
                              setForm(current => ({
                                ...current,
                                comment: commentConfigByValue[value],
                              }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : null}
                <OButton
                  className='editor-mode-toggle'
                  type='button'
                  variant='ghost'
                  onClick={() => updateCustomizationOpen(!isCustomizationOpen)}
                >
                  {isCustomizationOpen ? (
                    <ChevronsUp size={17} aria-hidden='true' />
                  ) : (
                    <ChevronsDown size={17} aria-hidden='true' />
                  )}
                  {isCustomizationOpen
                    ? publisherCopy.customization.hide
                    : publisherCopy.customization.show}
                </OButton>
              </PublisherModuleCard>
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
                  {isPublishing ? (
                    <Loader2 className='spin' size={18} aria-hidden='true' />
                  ) : publishPhase === 'completed' ? (
                    <CheckCircle2 size={18} aria-hidden='true' />
                  ) : null}
                  <span>{publishStatusText}</span>
                </div>
                {publishPhase === 'completed' ? (
                  <button
                    className='publisher-result-reopen interactive'
                    type='button'
                    onClick={() => setDraftResultOpen(true)}
                  >
                    <FilePenLine size={15} aria-hidden='true' />
                    {publisherCopy.aside.viewResult}
                  </button>
                ) : null}
                <div className='publisher-action-buttons'>
                  <OButton
                    className='publisher-reset'
                    type='button'
                    variant='ghost'
                    onClick={() => setResetConfirmOpen(true)}
                    disabled={isPublishing}
                  >
                    <RotateCcw size={17} aria-hidden='true' />
                    {publisherCopy.aside.reset}
                  </OButton>
                  <OButton
                    className='publisher-submit'
                    type='submit'
                    disabled={isPublishing}
                  >
                    {isPublishing ? (
                      <Loader2 className='spin' size={17} aria-hidden='true' />
                    ) : form.publishMode === 'rewrite' ? (
                      <FileDiff size={17} aria-hidden='true' />
                    ) : (
                      <Send size={17} aria-hidden='true' />
                    )}
                    {isPublishing
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

          {validationErrors.length ? (
            <OCard
              className='form-errors'
              padding='sm'
              role='alert'
              tone='danger'
            >
              {validationErrors.map(error => (
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

      <OModalConfirm
        ariaLabel={publisherCopy.customization.replaceAriaLabel}
        isOpen={Boolean(pendingTemplate)}
        title={publisherCopy.customization.replaceTitle}
        description={
          <>
            {publisherCopy.customization.replaceDescriptionPrefix}
            <strong>{pendingTemplate?.label}</strong>
            {publisherCopy.customization.replaceDescriptionSuffix}
          </>
        }
        cancelLabel={publisherCopy.customization.cancel}
        confirmLabel={publisherCopy.customization.replace}
        onCancel={() => setPendingTemplateId(null)}
        onConfirm={confirmTemplateReplacement}
      />

      <OModalConfirm
        ariaLabel={publisherCopy.status.confirmTitle}
        isOpen={isPublishConfirmOpen}
        title={publisherCopy.status.confirmTitle}
        description={
          form.publishMode === 'rewrite'
            ? publisherCopy.status.confirmRewrite
            : publisherCopy.status.confirmGenerate
        }
        cancelLabel={publisherCopy.customization.cancel}
        confirmLabel={
          form.publishMode === 'rewrite'
            ? publisherCopy.aside.generateRewrite
            : publisherCopy.aside.generate
        }
        confirmIcon={
          form.publishMode === 'rewrite' ? (
            <FileDiff size={17} aria-hidden='true' />
          ) : (
            <Send size={17} aria-hidden='true' />
          )
        }
        onCancel={() => setPublishConfirmOpen(false)}
        onConfirm={handlePublishConfirm}
      />

      <OModalConfirm
        ariaLabel={publisherCopy.status.resetTitle}
        isOpen={isResetConfirmOpen}
        title={publisherCopy.status.resetTitle}
        description={publisherCopy.status.resetConfirm}
        cancelLabel={publisherCopy.customization.cancel}
        confirmLabel={publisherCopy.aside.reset}
        confirmIcon={<RotateCcw size={17} aria-hidden='true' />}
        onCancel={() => setResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
      />
    </>
  );
}
