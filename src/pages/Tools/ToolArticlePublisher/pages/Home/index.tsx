import {
  ArticlePublisherStreamError,
  getCreateArticleForLLMStatus,
  getQueryArticleTemplates,
  normalizeArticleTemplateState,
  streamPostCreateArticleForLLM,
  type ArticlePublisherMode,
  type ArticlePublisherProgressEvent,
  type ArticleTemplate,
  type ArticleTemplateState,
  type CreateArticleForLLMResult,
  type OfficialCommentConfig,
  type OfficialImageConfig,
} from '@/api';
import WechatConsoleGuide from '@/assets/wechat-console-guide.svg';
import { useAuth } from '@/components/ContextAuth';
import { LayoutPage } from '@/components/LayoutPage';
import { OBadge } from '@/components/OBadge';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { OInputAI } from '@/components/OInputAI';
import { OModalConfirm } from '@/components/OModalConfirm';
import { ORadio } from '@/components/ORadio';
import { OSelector } from '@/components/OSelector';
import { OTooltip } from '@/components/OTooltip';
import { useI18n } from '@/hooks/useI18n';
import { DraftSuccessModal } from '@/pages/Tools/ToolArticlePublisher/components/DraftSuccessModal';
import { PublisherModuleCard } from '@/pages/Tools/ToolArticlePublisher/components/PublisherModuleCard';
import { PublisherProgressPanel } from '@/pages/Tools/ToolArticlePublisher/components/PublisherProgressPanel';
import {
  apiWhitelistIp,
  articlePublisherModes,
  articlePublisherProviders,
  articlePublisherScheduleEmail,
  articlePublisherSeoKey,
  articlePublisherToolId,
  articleTemplateCacheTtlSeconds,
  customArticleTemplateId,
  defaultPublisherForm,
  maxInlineImageCount,
  wechatConsoleUrl,
} from '@/pages/Tools/ToolArticlePublisher/config';
import type {
  ArticlePublisherForm,
  PublishPhase,
  PublishStepStatus,
} from '@/pages/Tools/ToolArticlePublisher/types';
import {
  buildPublisherRequestBody,
  getActiveModeSetting,
  getCompletionItems,
  getTemplateContent,
  getTemplatePayloadFromForm,
  getValidationErrors,
  hasText,
  normalizeForm,
} from '@/pages/Tools/ToolArticlePublisher/utils/form';

import { createInitialPublishSteps } from '@/pages/Tools/ToolArticlePublisher/utils/progress';
import managerCache, { cacheKeys } from '@/utils/manager/cache';
import {
  CalendarClock,
  CheckCircle2,
  Clipboard,
  ClipboardPenLine,
  Download,
  ExternalLink,
  FileDiff,
  FilePenLine,
  FileText,
  Loader2,
  Mail,
  Plus,
  RotateCcw,
  Send,
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
import './index.css';

type CommentOptionValue = 'closed' | 'open' | 'fansOnly';

const commentConfigByValue: Record<CommentOptionValue, OfficialCommentConfig> =
  {
    closed: { open: 0, fansOnly: 0 },
    open: { open: 1, fansOnly: 0 },
    fansOnly: { open: 1, fansOnly: 1 },
  };

interface CachedArticleTemplates {
  schemaVersion: 1;
  updatedAt: number;
  state: ArticleTemplateState;
}

interface ArticleTemplateResource {
  state: ArticleTemplateState | null;
  isLoading: boolean;
  error: boolean;
}

export function PageArticlePublisher() {
  const { messages } = useI18n();
  const { user, withLoginRequired } = useAuth();
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
  const [templateRequestVersion, setTemplateRequestVersion] = useState(0);
  const [templateResource, setTemplateResource] =
    useState<ArticleTemplateResource>(() => {
      const cached = managerCache.getLocalStorage<CachedArticleTemplates>(
        cacheKeys.articlePublisherTemplates
      );
      const cachedState =
        cached?.schemaVersion === 1
          ? normalizeArticleTemplateState(cached.state)
          : null;
      return {
        state: cachedState,
        isLoading: true,
        error: false,
      };
    });
  const articleTemplates = templateResource.state?.templates ?? [];
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
      articlePublisherProviders.map(provider => ({
        value: provider,
        label: publisherCopy.providers[provider],
      })),
    [publisherCopy.providers]
  );
  const modeOptions = useMemo(() => {
    const modeCopy = publisherCopy.modes as Record<
      ArticlePublisherMode,
      { label: string; description: string }
    >;
    return articlePublisherModes.map(mode => ({
      value: mode,
      label: modeCopy[mode].label,
      description: modeCopy[mode].description,
      icon: mode === 'create' ? FilePenLine : FileDiff,
    }));
  }, [publisherCopy.modes]);
  const [form, setForm] = useState<ArticlePublisherForm>(() => {
    try {
      return normalizeForm(
        managerCache.getLocalStorage(cacheKeys.articlePublisherForm),
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
    createInitialPublishSteps()
  );
  const [publishElapsedMs, setPublishElapsedMs] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [publishResult, setPublishResult] =
    useState<CreateArticleForLLMResult | null>(null);
  const [isDraftResultOpen, setDraftResultOpen] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [isPublishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [restoreRequestVersion, setRestoreRequestVersion] = useState(0);
  const publisherTaskCacheKey = user
    ? `${cacheKeys.articlePublisherTask}:${import.meta.env.VITE_APP_ENV || 'prod'}:${encodeURIComponent(user.id)}`
    : null;
  const selectedCommentOption: CommentOptionValue =
    form.comment.open === 0
      ? 'closed'
      : form.comment.fansOnly === 1
        ? 'fansOnly'
        : 'open';
  const activeModeSetting = getActiveModeSetting(form);
  const isCustomizationOpen = activeModeSetting.isCustomizationOpen;
  const customArticleTemplate: ArticleTemplate | null =
    activeModeSetting.customTemplate
      ? {
          ...activeModeSetting.customTemplate,
          label: publisherCopy.customization.customLabel,
          caption: publisherCopy.customization.customDescription,
        }
      : null;
  const availableTemplates = customArticleTemplate
    ? [customArticleTemplate, ...articleTemplates]
    : articleTemplates;
  const selectedArticleTemplate =
    availableTemplates.find(
      template => template.id === activeModeSetting.templateId
    ) ??
    articleTemplates.find(
      template => template.id === templateResource.state?.defaultTemplateId
    ) ??
    articleTemplates[0] ??
    customArticleTemplate ??
    null;
  const inlineImageSourceTemplate =
    selectedArticleTemplate?.id === customArticleTemplateId
      ? (articleTemplates.find(
          template => template.id === selectedArticleTemplate.sourceTemplateId
        ) ?? selectedArticleTemplate)
      : selectedArticleTemplate;
  const inlineImageTemplateList =
    inlineImageSourceTemplate?.payload.imagesInlineList ?? [];
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const templateScrollRef = useRef<HTMLDivElement | null>(null);
  const publisherAsideRef = useRef<HTMLElement | null>(null);
  const publisherAbortRef = useRef<AbortController | null>(null);
  const publishStartedAtRef = useRef<number | null>(null);
  const activeCreateArticleIdRef = useRef('');
  const latestPublishRevisionRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    setTemplateResource(current => ({
      ...current,
      isLoading: true,
      error: false,
    }));
    void getQueryArticleTemplates({ signal: controller.signal })
      .then(state => {
        if (controller.signal.aborted) return;
        managerCache.setLocalStorage(
          cacheKeys.articlePublisherTemplates,
          {
            schemaVersion: 1,
            updatedAt: Date.now(),
            state,
          } satisfies CachedArticleTemplates,
          articleTemplateCacheTtlSeconds
        );
        setTemplateResource({
          state,
          isLoading: false,
          error: false,
        });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setTemplateResource(current => ({
          ...current,
          isLoading: false,
          error: true,
        }));
      });
    return () => controller.abort();
  }, [templateRequestVersion]);

  useEffect(() => {
    managerCache.setLocalStorage(cacheKeys.articlePublisherForm, form);
  }, [form]);

  useEffect(() => {
    const scrollElement = templateScrollRef.current;
    if (!scrollElement || !selectedArticleTemplate) return;
    const timer = window.setTimeout(() => {
      const selectedElement = scrollElement.querySelector<HTMLElement>(
        '.template-choice.is-selected'
      );
      if (!selectedElement) return;
      const scrollRect = scrollElement.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();
      const selectedCenterOffset =
        selectedRect.left -
        scrollRect.left -
        (scrollElement.clientWidth - selectedRect.width) / 2;
      scrollElement.scrollTo({
        left: scrollElement.scrollLeft + selectedCenterOffset,
        top: scrollElement.scrollTop,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [
    selectedArticleTemplate?.id,
    availableTemplates.map(template => template.id).join('|'),
  ]);

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

  useEffect(() => {
    if (!publisherTaskCacheKey) return;
    const createArticleId = managerCache.getLocalStorage<string>(
      publisherTaskCacheKey
    );
    if (
      typeof createArticleId !== 'string' ||
      !/^ca_[a-f0-9]{29}$/.test(createArticleId)
    ) {
      if (createArticleId !== null) {
        managerCache.removeLocalStorage(publisherTaskCacheKey);
      }
      return;
    }

    const controller = new AbortController();
    publisherAbortRef.current?.abort();
    publisherAbortRef.current = controller;
    activeCreateArticleIdRef.current = createArticleId;
    latestPublishRevisionRef.current = 0;
    publishStartedAtRef.current ??= Date.now();
    setIsPublishing(true);
    setPublishResult(null);
    setDraftResultOpen(false);
    setPublishPhase('connecting');
    if (restoreRequestVersion === 0) setPublishElapsedMs(0);
    setPublishStatusText(publisherCopy.status.restoring);

    let retryTimer: number | undefined;
    let shouldRetry = false;
    void getCreateArticleForLLMStatus(createArticleId, {
      signal: controller.signal,
      onConnected: event => {
        updatePublishProgress(event);
        setPublishStatusText(
          event.message || publisherCopy.status.restoreConnected
        );
      },
      onProgress: updatePublishProgress,
    })
      .then(streamResult => {
        if (controller.signal.aborted) return;
        managerCache.removeLocalStorage(publisherTaskCacheKey);
        activeCreateArticleIdRef.current = '';
        if (streamResult.status === 'not_found') {
          setPublishPhase('idle');
          setPublishSteps(createInitialPublishSteps());
          setPublishStatusText(publisherCopy.status.autosave);
          return;
        }
        setPublishResult(streamResult.result);
        setDraftResultOpen(Boolean(streamResult.result?.article));
        setPublishPhase('completed');
        setPublishStatusText(publisherCopy.status.published);
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        if (error instanceof ArticlePublisherStreamError && error.terminal) {
          managerCache.removeLocalStorage(publisherTaskCacheKey);
          activeCreateArticleIdRef.current = '';
          setPublishPhase('failed');
          setPublishStatusText(
            `${publisherCopy.status.failedPrefix}${error.message}`
          );
          return;
        }
        if (error instanceof ArticlePublisherStreamError && !error.retryable) {
          managerCache.removeLocalStorage(publisherTaskCacheKey);
          activeCreateArticleIdRef.current = '';
          setPublishPhase('failed');
          setPublishStatusText(
            `${publisherCopy.status.failedPrefix}${error.message}`
          );
          return;
        }
        shouldRetry = true;
        setPublishPhase('connecting');
        setPublishStatusText(publisherCopy.status.restoreRetrying);
        retryTimer = window.setTimeout(
          () => setRestoreRequestVersion(current => current + 1),
          Math.min(3000 * 2 ** Math.min(restoreRequestVersion, 3), 30000)
        );
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        if (publisherAbortRef.current !== controller) return;
        if (!shouldRetry && publishStartedAtRef.current) {
          setPublishElapsedMs(Date.now() - publishStartedAtRef.current);
        }
        if (!shouldRetry) publishStartedAtRef.current = null;
        publisherAbortRef.current = null;
        if (!shouldRetry) setIsPublishing(false);
      });

    return () => {
      controller.abort();
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [publisherTaskCacheKey, restoreRequestVersion]);

  const exportedJson = useMemo(() => JSON.stringify(form, null, 2), [form]);
  const completionItems = useMemo(
    () =>
      getCompletionItems(
        form,
        publisherCopy,
        selectedArticleTemplate ?? undefined
      ),
    [form, publisherCopy, selectedArticleTemplate]
  );
  const completedCount = completionItems.filter(item => item.done).length;

  function updateField<K extends keyof ArticlePublisherForm>(
    key: K,
    value: ArticlePublisherForm[K]
  ) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function updatePublishMode(publishMode: ArticlePublisherMode) {
    setValidationErrors([]);
    setForm(current => {
      const targetSetting = current.modeSettings[publishMode];
      const nextTemplate =
        (targetSetting.customTemplate?.id === targetSetting.templateId
          ? targetSetting.customTemplate
          : undefined) ??
        articleTemplates.find(
          template => template.id === targetSetting.templateId
        ) ??
        articleTemplates.find(
          template => template.id === templateResource.state?.defaultTemplateId
        ) ??
        articleTemplates[0];
      return {
        ...current,
        ...(nextTemplate ? getTemplateContent(nextTemplate) : {}),
        publishMode,
        rewriteRequirement: hasText(current.rewriteRequirement)
          ? current.rewriteRequirement
          : defaultRewriteRequirement,
      };
    });
  }

  function updateTemplateFields(
    update: (current: ArticlePublisherForm) => ArticlePublisherForm
  ) {
    if (!selectedArticleTemplate) return;
    setValidationErrors([]);
    setForm(current => {
      const updated = update(current);
      const setting = getActiveModeSetting(updated);
      const sourceTemplateId =
        selectedArticleTemplate.id === customArticleTemplateId
          ? selectedArticleTemplate.sourceTemplateId
          : selectedArticleTemplate.id;
      const customTemplate: ArticleTemplate = {
        ...selectedArticleTemplate,
        id: customArticleTemplateId,
        label: publisherCopy.customization.customLabel,
        caption: publisherCopy.customization.customDescription,
        ...(sourceTemplateId ? { sourceTemplateId } : {}),
        updatedAt: Date.now(),
        payload: getTemplatePayloadFromForm(updated),
      };
      return {
        ...updated,
        modeSettings: {
          ...updated.modeSettings,
          [updated.publishMode]: {
            ...setting,
            templateId: customArticleTemplateId,
            customTemplate,
          },
        },
      };
    });
  }

  function updateCustomizationOpen(isOpen: boolean) {
    setValidationErrors([]);
    setForm(current => {
      const currentSetting = getActiveModeSetting(current);
      const next: ArticlePublisherForm = {
        ...current,
        modeSettings: {
          ...current.modeSettings,
          [current.publishMode]: {
            ...currentSetting,
            isCustomizationOpen: isOpen,
          },
        },
      };
      return isOpen && selectedArticleTemplate
        ? { ...next, ...getTemplateContent(selectedArticleTemplate) }
        : next;
    });
  }

  function applyTemplate(templateId: string) {
    setValidationErrors([]);
    const template = availableTemplates.find(item => item.id === templateId);
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

  function updateSelectedTemplate(templateId: string) {
    if (templateId === activeModeSetting.templateId) return;
    applyTemplate(templateId);
  }

  function validatePublisherForm() {
    const nextErrors = getValidationErrors(
      form,
      publisherCopy,
      selectedArticleTemplate ?? undefined
    );
    setValidationErrors(nextErrors);
    return nextErrors.length === 0;
  }

  function updateInlineImage(
    index: number,
    patch: Partial<OfficialImageConfig>
  ) {
    updateTemplateFields(current => ({
      ...current,
      imagesInlineList: current.imagesInlineList.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function addInlineImage() {
    if (
      form.imagesInlineList.length >= maxInlineImageCount ||
      inlineImageTemplateList.length === 0
    ) {
      return;
    }
    const templateInlineImage =
      inlineImageTemplateList[
        Math.floor(Math.random() * inlineImageTemplateList.length)
      ];
    updateTemplateFields(current => {
      return {
        ...current,
        imagesInlineList: [
          ...current.imagesInlineList,
          { ...templateInlineImage },
        ],
      };
    });
  }

  function removeInlineImage(index: number) {
    updateTemplateFields(current => ({
      ...current,
      imagesInlineList: current.imagesInlineList.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  }

  function updatePublishProgress(event: ArticlePublisherProgressEvent) {
    if (
      event.revision !== undefined &&
      event.revision <= latestPublishRevisionRef.current
    ) {
      return;
    }
    if (event.revision !== undefined) {
      latestPublishRevisionRef.current = event.revision;
    }
    if (event.steps) {
      setPublishSteps(createInitialPublishSteps(event.steps));
    }
    if (!event.steps && event.key) {
      setPublishSteps(current =>
        current.map(step => {
          if (step.key !== event.key) return step;
          const status: PublishStepStatus =
            event.status === 'info'
              ? step.status === 'pending'
                ? 'running'
                : step.status
              : event.status === 'warning'
                ? 'warning'
                : event.status === 'retrying'
                  ? 'running'
                  : event.status === 'completed' ||
                      event.status === 'failed' ||
                      event.status === 'running'
                    ? event.status
                    : step.status;
          return {
            ...step,
            status,
            message: event.message ?? step.message,
            durationMs: event.durationMs ?? step.durationMs,
            requestedCount:
              event.totalImageCount ??
              event.requestedCount ??
              step.requestedCount,
          };
        })
      );
    }

    if (event.status === 'running' || event.status === 'retrying') {
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
    return withLoginRequired(() => setPublishConfirmOpen(true))();
  }

  function handlePublishConfirm() {
    return withLoginRequired(startPublish)();
  }

  async function startPublish() {
    if (!selectedArticleTemplate) return;
    setPublishConfirmOpen(false);
    setIsPublishing(true);
    setPublishResult(null);
    setDraftResultOpen(false);
    setPublishPhase('connecting');
    setPublishSteps(createInitialPublishSteps());
    setPublishElapsedMs(0);
    setPublishStatusText(publisherCopy.status.connecting);
    setRestoreRequestVersion(0);
    latestPublishRevisionRef.current = 0;
    activeCreateArticleIdRef.current = '';

    const body = buildPublisherRequestBody(
      form,
      selectedArticleTemplate,
      defaultRewriteRequirement
    );

    publisherAbortRef.current?.abort();
    const controller = new AbortController();
    publisherAbortRef.current = controller;
    publishStartedAtRef.current = Date.now();

    try {
      const result = await streamPostCreateArticleForLLM(body, {
        signal: controller.signal,
        onConnected: event => {
          updatePublishProgress(event);
          if (event.createArticleId && publisherTaskCacheKey) {
            activeCreateArticleIdRef.current = event.createArticleId;
            managerCache.setLocalStorage(
              publisherTaskCacheKey,
              event.createArticleId,
              6 * 60 * 60
            );
          }
          setPublishPhase('publishing');
          setPublishStatusText(event.message || publisherCopy.status.connected);
        },
        onProgress: updatePublishProgress,
      });
      setPublishResult(result);
      setDraftResultOpen(Boolean(result?.article));
      setPublishPhase('completed');
      setPublishStatusText(publisherCopy.status.published);
      if (publisherTaskCacheKey) {
        managerCache.removeLocalStorage(publisherTaskCacheKey);
      }
      activeCreateArticleIdRef.current = '';
    } catch (error) {
      if (controller.signal.aborted) return;
      const canRestore =
        Boolean(activeCreateArticleIdRef.current && publisherTaskCacheKey) &&
        (!(error instanceof ArticlePublisherStreamError) || error.retryable) &&
        !(error instanceof ArticlePublisherStreamError && error.terminal);
      if (canRestore) {
        setPublishPhase('connecting');
        setPublishStatusText(publisherCopy.status.restoreRetrying);
        setRestoreRequestVersion(current => current + 1);
        return;
      }
      if (
        error instanceof ArticlePublisherStreamError &&
        publisherTaskCacheKey
      ) {
        managerCache.removeLocalStorage(publisherTaskCacheKey);
        activeCreateArticleIdRef.current = '';
      }
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
      if (
        !controller.signal.aborted &&
        publisherAbortRef.current === controller
      ) {
        if (publishStartedAtRef.current) {
          setPublishElapsedMs(Date.now() - publishStartedAtRef.current);
        }
        publishStartedAtRef.current = null;
        publisherAbortRef.current = null;
        setIsPublishing(false);
      }
    }
  }

  function handleResetConfirm() {
    setResetConfirmOpen(false);
    setForm(localizedDefaultForm);
    setValidationErrors([]);
    setPublishResult(null);
    setDraftResultOpen(false);
    setPublishPhase('idle');
    setPublishSteps(createInitialPublishSteps());
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
    link.download = 'orz2-article-publisher-config.json';
    link.click();
    URL.revokeObjectURL(url);
    setPublishStatusText(publisherCopy.status.exportDone);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const normalized = normalizeForm(
        JSON.parse(await file.text()),
        defaultRewriteRequirement
      );
      setForm(normalized);
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
      <LayoutPage
        className='article-publisher-page'
        icon={Send}
        seoKey={articlePublisherSeoKey}
        toolId={articlePublisherToolId}
        topbarSlot={
          <div
            className='json-actions'
            aria-label={publisherCopy.jsonActionsAriaLabel}
          >
            <OButton to='/articles' variant='ghost'>
              <FileText size={17} aria-hidden='true' />
              {messages.articles.listTitle}
            </OButton>
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
        }
      >
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
              href={`mailto:${articlePublisherScheduleEmail}?subject=${encodeURIComponent(
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
                headingExtra={
                  <button
                    className='publisher-switch-button'
                    type='button'
                    role='switch'
                    aria-checked={isCustomizationOpen}
                    disabled={!selectedArticleTemplate}
                    onClick={() =>
                      updateCustomizationOpen(!isCustomizationOpen)
                    }
                  >
                    <span>
                      {isCustomizationOpen
                        ? publisherCopy.customization.hide
                        : publisherCopy.customization.show}
                    </span>
                    <i aria-hidden='true' />
                  </button>
                }
                icon={ClipboardPenLine}
                title={publisherCopy.simpleMode.title}
              >
                {templateResource.error ? (
                  <div className='template-resource-notice' role='status'>
                    <span>
                      {templateResource.state
                        ? publisherCopy.templates.cached
                        : publisherCopy.templates.failed}
                    </span>
                    <OButton
                      type='button'
                      size='sm'
                      variant='ghost'
                      onClick={() =>
                        setTemplateRequestVersion(current => current + 1)
                      }
                    >
                      {publisherCopy.templates.retry}
                    </OButton>
                  </div>
                ) : templateResource.isLoading ? (
                  <div className='template-resource-notice' role='status'>
                    <Loader2
                      className='is-spinning'
                      size={16}
                      aria-hidden='true'
                    />
                    <span>{publisherCopy.templates.loading}</span>
                  </div>
                ) : null}
                {availableTemplates.length && selectedArticleTemplate ? (
                  <div
                    className='template-card-scroll'
                    role='radiogroup'
                    aria-label={publisherCopy.simpleMode.selectorAriaLabel}
                    ref={templateScrollRef}
                  >
                    <div className='template-card-list'>
                      {availableTemplates.map(template => {
                        const isSelected =
                          template.id === selectedArticleTemplate.id;
                        return (
                          <button
                            className={
                              isSelected
                                ? 'template-choice is-selected'
                                : 'template-choice'
                            }
                            type='button'
                            role='radio'
                            aria-checked={isSelected}
                            key={template.id}
                            onClick={() => updateSelectedTemplate(template.id)}
                          >
                            <span>{template.label}</span>
                            <small>{template.caption}</small>
                            {isSelected ? (
                              <CheckCircle2 size={17} aria-hidden='true' />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <span className='template-empty'>
                    {publisherCopy.templates.empty}
                  </span>
                )}
                {selectedArticleTemplate && !isCustomizationOpen ? (
                  <div className='template-summary'>
                    <CheckCircle2 size={16} aria-hidden='true' />
                    <span>
                      <strong>{selectedArticleTemplate.label}</strong>
                      {selectedArticleTemplate.caption}
                    </span>
                  </div>
                ) : null}

                {!isCustomizationOpen && form.publishMode === 'rewrite' ? (
                  <div className='rewrite-simple-note'>
                    <FileDiff size={16} aria-hidden='true' />
                    <span>{publisherCopy.sections.rewrite.templateHint}</span>
                  </div>
                ) : null}

                {isCustomizationOpen ? (
                  <div className='advanced-config'>
                    <div className='advanced-config-section'>
                      <div className='advanced-section-heading'>
                        <h3>{publisherCopy.sections.account.provider}</h3>
                      </div>
                      <OSelector
                        ariaLabel={
                          publisherCopy.sections.account.modelSelectorAriaLabel
                        }
                        className='advanced-provider-selector'
                        options={providerOptions}
                        value={form.provider}
                        onChange={provider => updateField('provider', provider)}
                      />
                    </div>
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
                            updateTemplateFields(current => ({
                              ...current,
                              promptSystem: value,
                            }))
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
                            updateTemplateFields(current => ({
                              ...current,
                              promptContent: value,
                            }))
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
                            updateTemplateFields(current => ({
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
                        {form.imagesInlineList.length < maxInlineImageCount &&
                        inlineImageTemplateList.length ? (
                          <OButton
                            type='button'
                            size='sm'
                            variant='ghost'
                            onClick={addInlineImage}
                          >
                            <Plus size={17} aria-hidden='true' />
                            {publisherCopy.sections.images.addImage}
                          </OButton>
                        ) : null}
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
              </PublisherModuleCard>

              <PublisherModuleCard
                className='delivery-settings-card'
                description={publisherCopy.sections.delivery.description}
                icon={Mail}
                title={publisherCopy.sections.delivery.title}
              >
                <div className='delivery-option-list'>
                  <section className='delivery-option'>
                    <button
                      className='delivery-toggle-row'
                      type='button'
                      role='switch'
                      aria-checked={form.deliveryWechat}
                      onClick={() =>
                        updateField('deliveryWechat', !form.deliveryWechat)
                      }
                    >
                      <span className='delivery-toggle-copy'>
                        <strong>
                          {publisherCopy.sections.delivery.wechat.title}
                        </strong>
                        <small>
                          {publisherCopy.sections.delivery.wechat.description}
                        </small>
                      </span>
                      <i className='publisher-switch' aria-hidden='true' />
                    </button>
                    {form.deliveryWechat ? (
                      <div className='delivery-option-detail'>
                        <div className='wechat-chain-setup'>
                          <div className='wechat-chain-guide'>
                            <OTooltip
                              className='wechat-chain-visual interactive'
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
                              <img
                                src={WechatConsoleGuide}
                                alt={publisherCopy.setupImageAlt}
                              />
                            </OTooltip>
                            <div>
                              <h4>
                                {
                                  publisherCopy.sections.delivery.wechat
                                    .setupTitle
                                }
                              </h4>
                              <p>
                                {
                                  publisherCopy.sections.delivery.wechat
                                    .setupDescription
                                }
                              </p>
                            </div>
                          </div>
                          <div className='setup-actions'>
                            <OButton
                              href={wechatConsoleUrl}
                              target='_blank'
                              rel='noreferrer'
                              size='sm'
                            >
                              <ExternalLink size={16} aria-hidden='true' />
                              {publisherCopy.openWechatConsole}
                            </OButton>
                            <OButton
                              type='button'
                              variant='secondary'
                              size='sm'
                              onClick={handleCopyIp}
                            >
                              <Clipboard size={16} aria-hidden='true' />
                              {copiedIp
                                ? publisherCopy.copiedIp
                                : publisherCopy.copyIp}
                            </OButton>
                          </div>
                        </div>
                        <div className='form-grid two'>
                          <label className='field'>
                            <span>{publisherCopy.sections.account.appId}</span>
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
                            <span>
                              {publisherCopy.sections.account.appSecret}
                            </span>
                            <input
                              value={form.appSecret}
                              onChange={event =>
                                updateField('appSecret', event.target.value)
                              }
                              placeholder={
                                publisherCopy.sections.account
                                  .appSecretPlaceholder
                              }
                              type='password'
                              required
                            />
                          </label>
                        </div>
                      </div>
                    ) : null}
                  </section>

                  <section className='delivery-option'>
                    <button
                      className='delivery-toggle-row'
                      type='button'
                      role='switch'
                      aria-checked={form.deliveryEmail}
                      onClick={() =>
                        updateField('deliveryEmail', !form.deliveryEmail)
                      }
                    >
                      <span className='delivery-toggle-copy'>
                        <strong>
                          {publisherCopy.sections.delivery.email.title}
                        </strong>
                        <small>
                          {publisherCopy.sections.delivery.email.description}
                        </small>
                      </span>
                      <i className='publisher-switch' aria-hidden='true' />
                    </button>
                    {form.deliveryEmail ? (
                      <div className='delivery-option-detail'>
                        <label className='field'>
                          <span>
                            {publisherCopy.sections.delivery.finalReportEmails}
                          </span>
                          <textarea
                            aria-describedby='final-report-emails-hint'
                            inputMode='email'
                            value={form.finalReportEmails}
                            onChange={event =>
                              updateField(
                                'finalReportEmails',
                                event.target.value
                              )
                            }
                            placeholder={
                              publisherCopy.sections.delivery
                                .finalReportEmailsPlaceholder
                            }
                            rows={3}
                            required
                          />
                          <small id='final-report-emails-hint'>
                            {
                              publisherCopy.sections.delivery
                                .finalReportEmailsHint
                            }
                          </small>
                        </label>
                      </div>
                    ) : null}
                  </section>
                </div>
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

                <div className='publisher-action-controls'>
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
                        <Loader2
                          className='spin'
                          size={17}
                          aria-hidden='true'
                        />
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
      </LayoutPage>

      {isDraftResultOpen ? (
        <DraftSuccessModal
          copy={publisherCopy}
          publishResult={publishResult}
          onClose={() => setDraftResultOpen(false)}
        />
      ) : null}

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
