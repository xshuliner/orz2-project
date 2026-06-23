import {
  streamPostOfficialPublisher,
  type OfficialCommentConfig,
  type OfficialDraftResult,
  type OfficialImageConfig,
  type OfficialImageSourceType,
  type OfficialPublisherMode,
  type OfficialPublisherProgressEvent,
  type OfficialPublisherProvider,
  type PostOfficialPublisherBody,
} from '@/api';
import WechatConsoleGuide from '@/assets/wechat-console-guide.svg';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { OInputAI } from '@/components/OInputAI';
import { OModal } from '@/components/OModal';
import { ORadio } from '@/components/ORadio';
import { OTooltip } from '@/components/OTooltip';
import { Seo } from '@/components/Seo';
import { getToolSeo } from '@/config/seo';
import { useI18n } from '@/i18n';
import { getTools } from '@/i18n/catalog';
import {
  promptTemplates,
  type AutoFillKeyPattern,
  type PromptTemplate,
} from '@/pages/Tools/ToolOfficialPublisher/config';
import CacheManager from '@/utils/CacheManager';
import {
  Activity,
  ArrowLeft,
  CheckCheck,
  CheckCircle2,
  Circle,
  Clipboard,
  Clock3,
  Download,
  ExternalLink,
  FileJson,
  Image,
  KeyRound,
  Loader2,
  Newspaper,
  PenLine,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  TriangleAlert,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import './index.css';

interface WechatPublisherForm {
  publishMode: OfficialPublisherMode;
  appId: string;
  appSecret: string;
  provider: OfficialPublisherProvider;
  promptSystem: string;
  promptContent: string;
  sourceArticleUrl: string;
  rewriteRequirement: string;
  imageCover: OfficialImageConfig;
  imagesInlineList: OfficialImageConfig[];
  author: string;
  digest: string;
  sourceUrl: string;
  comment: OfficialCommentConfig;
}

interface CompletionItem {
  label: string;
  done: boolean;
}

type PublishPhase =
  | 'idle'
  | 'connecting'
  | 'publishing'
  | 'completed'
  | 'failed';
type PublishStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'warning'
  | 'failed';

interface PublishStep {
  index: number;
  key: string;
  name: string;
  status: PublishStepStatus;
  message?: string;
  durationMs?: number;
  requestedCount?: number;
}

type PublisherCopy = ReturnType<typeof useI18n>['messages']['publisher'];

const storageKey = 'orz2:wechat-auto-publisher-form';
const wechatConsoleUrl = 'https://developers.weixin.qq.com/console/index';
const wechatDraftBoxUrl =
  'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_list&action=list&begin=0&count=10&type=10&lang=zh_CN';
const apiWhitelistIp = '43.167.247.143';
const publisherStepKeys = [
  'generate_article',
  'prepare_cover',
  'prepare_inline_images',
  'assemble_draft',
  'submit_draft',
  'save_record',
] as const;
const officialPublisherProviders: OfficialPublisherProvider[] = [
  'AGNES',
  'MINIMAX',
];
const officialPublisherModes: OfficialPublisherMode[] = ['create', 'rewrite'];
const defaultRewriteRequirement =
  '请在保留原文核心事实、信息价值和读者收益的基础上，重写成一篇全新的公众号文章。标题、开头、段落顺序、表达方式和案例串联都要明显区别于原文；不要逐句同义替换，不要照搬原文金句；排版要适合微信公众号阅读，整体有层次、有留白、有编辑感。';
const defaultForm: WechatPublisherForm = {
  publishMode: 'create',
  appId: '',
  appSecret: '',
  provider: 'AGNES',
  promptSystem: '',
  promptContent: '',
  sourceArticleUrl: '',
  rewriteRequirement: defaultRewriteRequirement,
  imageCover: { type: 'ai', value: '' },
  imagesInlineList: [],
  author: '',
  digest: '',
  sourceUrl: '',
  comment: { open: 1, fansOnly: 0 },
};

function createInitialPublishSteps(
  stepNames: readonly string[]
): PublishStep[] {
  return publisherStepKeys.map((key, index) => ({
    key,
    name: stepNames[index] ?? key,
    index: index + 1,
    status: 'pending',
  }));
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(durationMs < 10000 ? 1 : 0)}s`;
}

function PublisherProgressPanel({
  copy,
  elapsedMs,
  phase,
  steps,
}: {
  copy: PublisherCopy;
  elapsedMs: number;
  phase: Exclude<PublishPhase, 'idle'>;
  steps: PublishStep[];
}) {
  const completedCount = steps.filter(
    step => step.status === 'completed'
  ).length;
  const activeStep = steps.find(
    step => step.status === 'running' || step.status === 'warning'
  );
  const progress =
    phase === 'completed'
      ? 100
      : Math.round(
          ((completedCount + (activeStep ? 0.46 : 0)) / steps.length) * 100
        );
  const phaseLabel = copy.progress.phases[phase];

  return (
    <OCard
      as='section'
      className={`publish-progress-card is-${phase}`}
      aria-label={copy.progress.ariaLabel}
      padding='md'
      tone='brand'
    >
      <div className='publish-progress-head'>
        <div className='summary-heading'>
          <Activity size={18} aria-hidden='true' />
          <h2>{copy.progress.title}</h2>
        </div>
        <span className='publish-live-chip'>
          <i aria-hidden='true' />
          {phaseLabel}
        </span>
      </div>
      <div className='publish-progress-meter' aria-hidden='true'>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className='publish-progress-meta'>
        <span>
          {completedCount}/{steps.length} {copy.progress.completedSuffix}
        </span>
        <span>
          <Clock3 size={13} aria-hidden='true' />
          {formatDuration(elapsedMs)}
        </span>
      </div>
      <ol className='publish-timeline'>
        {steps.map(step => (
          <li
            className={`publish-timeline-step is-${step.status}`}
            key={step.key}
          >
            <span className='publish-step-marker'>
              {step.status === 'completed' ? (
                <CheckCircle2 size={17} aria-hidden='true' />
              ) : step.status === 'failed' || step.status === 'warning' ? (
                <TriangleAlert size={16} aria-hidden='true' />
              ) : step.status === 'running' ? (
                <Loader2 className='spin' size={16} aria-hidden='true' />
              ) : (
                <Circle size={14} aria-hidden='true' />
              )}
            </span>
            <div className='publish-step-body'>
              <strong>
                <em>{String(step.index).padStart(2, '0')}</em>
                {step.name}
              </strong>
              <p>
                {step.message ||
                  (step.status === 'pending'
                    ? copy.progress.pending
                    : step.status === 'completed'
                      ? copy.progress.completed
                      : copy.progress.running)}
              </p>
            </div>
            {step.durationMs !== undefined ? (
              <small>{formatDuration(step.durationMs)}</small>
            ) : null}
          </li>
        ))}
      </ol>
    </OCard>
  );
}

function DraftSuccessModal({
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
            <FileJson size={22} aria-hidden='true' />
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

// 跟踪被智能填充的字段；key 是稳定路径，支持 imageCover.value 与
// imagesInlineList.<index>.value 这类嵌套路径。
type AutoFillKey =
  | 'promptSystem'
  | 'promptContent'
  | 'digest'
  | `imageCover.value`
  | `imagesInlineList.${number}.value`;

interface AutoFillSnapshot {
  templateId: PromptTemplate['id'];
  templateLabel: string;
  previousValues: Partial<Record<AutoFillKey, string>>;
  filledValues: Partial<Record<AutoFillKey, string>>;
  filledKeys: AutoFillKey[];
}

function AutoFillChip({
  copy,
  onClear,
}: {
  copy: PublisherCopy;
  onClear: () => void;
}) {
  return (
    <span className='autofill-chip'>
      <Wand2 size={13} aria-hidden='true' />
      <span>{copy.autoFill.chip}</span>
      <button
        className='autofill-chip-clear interactive'
        type='button'
        onClick={onClear}
        aria-label={copy.autoFill.clearAria}
      >
        {copy.autoFill.clear}
      </button>
    </span>
  );
}

function normalizeOfficialPublisherProvider(
  value: unknown
): OfficialPublisherProvider {
  const normalized =
    typeof value === 'string' ? value.trim().toUpperCase() : '';
  return officialPublisherProviders.includes(
    normalized as OfficialPublisherProvider
  )
    ? (normalized as OfficialPublisherProvider)
    : 'AGNES';
}

function normalizeOfficialPublisherMode(value: unknown): OfficialPublisherMode {
  const normalized =
    typeof value === 'string' ? value.trim().toLowerCase() : '';
  return officialPublisherModes.includes(normalized as OfficialPublisherMode)
    ? (normalized as OfficialPublisherMode)
    : 'create';
}

function normalizeForm(input: unknown): WechatPublisherForm {
  const source =
    typeof input === 'object' && input
      ? (input as Partial<WechatPublisherForm> & Record<string, any>)
      : {};
  const inlineList = Array.isArray(source.imagesInlineList)
    ? source.imagesInlineList
    : [];

  // 兼容旧 localStorage：imageCoverType + imageCoverValue → imageCover
  const legacyImageCoverType = source.imageCoverType as
    | OfficialImageSourceType
    | undefined;
  const rawImageCover = (source.imageCover ??
    {}) as Partial<OfficialImageConfig>;
  const coverType: OfficialImageSourceType =
    rawImageCover.type === 'url' || rawImageCover.type === 'base64'
      ? rawImageCover.type
      : legacyImageCoverType === 'url' || legacyImageCoverType === 'base64'
        ? legacyImageCoverType
        : 'ai';
  const coverValue =
    typeof rawImageCover.value === 'string'
      ? rawImageCover.value
      : typeof source.imageCoverValue === 'string'
        ? source.imageCoverValue
        : '';

  // 兼容旧 localStorage：comment 字符串 → { open, fansOnly } 标志位
  const rawComment = source.comment as
    | OfficialCommentConfig
    | 'open'
    | 'fansOnly'
    | undefined;
  let comment: OfficialCommentConfig = { ...defaultForm.comment };
  if (rawComment && typeof rawComment === 'object') {
    comment = {
      open: rawComment.open === 1 ? 1 : 0,
      fansOnly: rawComment.fansOnly === 1 ? 1 : 0,
    };
  } else if (rawComment === 'fansOnly') {
    comment = { open: 1, fansOnly: 1 };
  } else if (rawComment === 'open') {
    comment = { open: 1, fansOnly: 0 };
  }

  return {
    ...defaultForm,
    ...source,
    publishMode: normalizeOfficialPublisherMode(
      source.publishMode ?? source.mode ?? source.scene
    ),
    provider: normalizeOfficialPublisherProvider(
      source.provider ?? source.aiProvider ?? source.ai?.provider
    ),
    sourceArticleUrl:
      typeof source.sourceArticleUrl === 'string'
        ? source.sourceArticleUrl
        : typeof source.rewriteHref === 'string'
          ? source.rewriteHref
          : '',
    rewriteRequirement:
      typeof source.rewriteRequirement === 'string' &&
      source.rewriteRequirement.trim()
        ? source.rewriteRequirement
        : defaultRewriteRequirement,
    imageCover: { type: coverType, value: coverValue },
    imagesInlineList: inlineList.slice(0, 9).map(item => ({
      type: item?.type === 'url' || item?.type === 'base64' ? item.type : 'ai',
      value: typeof item?.value === 'string' ? item.value : '',
    })),
    comment,
  };
}

function hasText(value: string) {
  return Boolean(value.trim());
}

function isWechatArticleUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return (
      url.protocol === 'https:' &&
      url.hostname === 'mp.weixin.qq.com' &&
      (url.pathname === '/s' || url.pathname.startsWith('/s/'))
    );
  } catch {
    return false;
  }
}

function getCompletionItems(
  form: WechatPublisherForm,
  copy: PublisherCopy
): CompletionItem[] {
  if (form.publishMode === 'rewrite') {
    return [
      {
        label: copy.completion.account,
        done:
          hasText(form.appId) &&
          hasText(form.appSecret) &&
          Boolean(form.provider),
      },
      {
        label: copy.completion.rewriteSource,
        done:
          hasText(form.sourceArticleUrl) &&
          isWechatArticleUrl(form.sourceArticleUrl),
      },
      {
        label: copy.completion.rewriteRequirement,
        done: hasText(form.rewriteRequirement),
      },
    ];
  }
  return [
    {
      label: copy.completion.account,
      done:
        hasText(form.appId) &&
        hasText(form.appSecret) &&
        Boolean(form.provider),
    },
    {
      label: copy.completion.prompt,
      done: hasText(form.promptSystem) && hasText(form.promptContent),
    },
    {
      label: copy.completion.images,
      done:
        Boolean(form.imageCover.type) &&
        hasText(form.imageCover.value) &&
        form.imagesInlineList.every(
          item => Boolean(item.type) && hasText(item.value)
        ),
    },
    {
      label: copy.completion.meta,
      done: form.comment.open === 1 || form.comment.fansOnly === 1,
    },
  ];
}

function getValidationErrors(form: WechatPublisherForm, copy: PublisherCopy) {
  const nextErrors: string[] = [];

  if (!hasText(form.appId)) nextErrors.push(copy.validation.appId);
  if (!hasText(form.appSecret)) nextErrors.push(copy.validation.appSecret);
  if (!form.provider) nextErrors.push(copy.validation.provider);
  if (form.publishMode === 'rewrite') {
    if (!hasText(form.sourceArticleUrl)) {
      nextErrors.push(copy.validation.rewriteSourceUrl);
    } else if (!isWechatArticleUrl(form.sourceArticleUrl)) {
      nextErrors.push(copy.validation.rewriteSourceUrlInvalid);
    }
    if (!hasText(form.rewriteRequirement)) {
      nextErrors.push(copy.validation.rewriteRequirement);
    }
    return nextErrors;
  }
  if (!hasText(form.promptSystem))
    nextErrors.push(copy.validation.promptSystem);
  if (!hasText(form.promptContent))
    nextErrors.push(copy.validation.promptContent);
  if (!form.imageCover.type) nextErrors.push(copy.validation.coverType);
  if (!hasText(form.imageCover.value))
    nextErrors.push(copy.validation.coverValue);
  form.imagesInlineList.forEach((item, index) => {
    if (!item.type)
      nextErrors.push(
        `${copy.validation.inlineTypePrefix} ${index + 1} ${copy.validation.inlineTypeSuffix}`
      );
    if (!hasText(item.value))
      nextErrors.push(
        `${copy.validation.inlineTypePrefix} ${index + 1} ${copy.validation.inlineValueSuffix}`
      );
  });
  if (form.comment.open === 0 && form.comment.fansOnly === 0) {
    nextErrors.push(copy.validation.comment);
  }

  return nextErrors;
}

function truncate(value: string, max: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

function newValueForKey(template: PromptTemplate, key: AutoFillKey) {
  if (key === 'promptSystem') return template.fields.promptSystem;
  if (key === 'promptContent') return template.fields.promptContent;
  if (key === 'digest') return template.fields.digest;
  if (key === 'imageCover.value') return template.fields.coverValue;
  if (key.startsWith('imagesInlineList.')) {
    const idx = Number(key.split('.')[1]);
    return pickInlinePrompt(template, idx);
  }
  return '';
}

// 按下标取第 idx + 1 张内嵌图的提示词；超出 inlineValueList 长度时回退到末位。
function pickInlinePrompt(template: PromptTemplate, idx: number) {
  const list = template.fields.inlineValueList;
  if (idx >= 0 && idx < list.length) return list[idx];
  return list[list.length - 1];
}

// 按模板的 defaultCheckedPatterns 把通配符展开为具体字段 key
function expandDefaultCheckedPatterns(
  patterns: AutoFillKeyPattern[],
  currentForm: WechatPublisherForm,
  planFilledKeys: AutoFillKey[]
): AutoFillKey[] {
  const expanded: AutoFillKey[] = [];
  for (const pattern of patterns) {
    if (pattern === 'imagesInlineList.*.value') {
      // 展开为「所有 AI 类型内嵌图」的 key
      planFilledKeys.forEach(key => {
        if (key.startsWith('imagesInlineList.')) {
          const idx = Number(key.split('.')[1]);
          if (currentForm.imagesInlineList[idx]?.type === 'ai') {
            expanded.push(key);
          }
        }
      });
    } else if (planFilledKeys.includes(pattern)) {
      expanded.push(pattern);
    }
  }
  return expanded;
}

export function OfficialPublisher() {
  const { locale, localizePath, messages } = useI18n();
  const publisherCopy = messages.publisher;
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
      description: modeCopy[mode].description,
      icon: mode === 'create' ? Newspaper : PenLine,
    }));
  }, [publisherCopy.modes]);
  const [form, setForm] = useState<WechatPublisherForm>(() => {
    try {
      return normalizeForm(CacheManager.getLocalStorage(storageKey));
    } catch {
      return defaultForm;
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
  const [isTemplateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<PromptTemplate | null>(
    null
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<AutoFillKey>>(
    () => new Set()
  );
  const [autoFilledKeys, setAutoFilledKeys] = useState<Set<AutoFillKey>>(
    () => new Set()
  );
  const [lastAutoFill, setLastAutoFill] = useState<AutoFillSnapshot | null>(
    null
  );
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const templateMenuRef = useRef<HTMLDivElement | null>(null);
  const templateButtonRef = useRef<HTMLButtonElement | null>(null);
  const confirmDialogRef = useRef<HTMLDivElement | null>(null);
  const publisherAsideRef = useRef<HTMLElement | null>(null);
  const publisherAbortRef = useRef<AbortController | null>(null);
  const publishStartedAtRef = useRef<number | null>(null);
  useEffect(() => {
    CacheManager.setLocalStorage(storageKey, form);
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

  // 计算模板弹层在视口中的位置（fixed 定位 + Portal 渲染，避开 form-panel 的 overflow:hidden）
  useLayoutEffect(() => {
    if (!isTemplateMenuOpen) {
      setPopoverPos(null);
      return;
    }
    function update() {
      const button = templateButtonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const menuWidth = Math.min(380, window.innerWidth - 32);
      const right = Math.max(16, window.innerWidth - rect.right - 4);
      const top = rect.bottom + 8;
      // 防止菜单超出左边界
      if (right + menuWidth > window.innerWidth - 16) {
        setPopoverPos({ top, right: 16 });
      } else {
        setPopoverPos({ top, right });
      }
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isTemplateMenuOpen]);

  // 点击模板弹层外部 / Esc 键时收起弹层
  useEffect(() => {
    if (!isTemplateMenuOpen && !pendingTemplate) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (templateButtonRef.current?.contains(target)) return;
      if (templateMenuRef.current?.contains(target)) return;
      // 关键：二次确认弹窗的内部点击绝不能关闭弹层
      if (confirmDialogRef.current?.contains(target)) return;
      setTemplateMenuOpen(false);
      if (pendingTemplate) {
        setPendingTemplate(null);
        setSelectedKeys(new Set());
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setTemplateMenuOpen(false);
        if (pendingTemplate) {
          setPendingTemplate(null);
          setSelectedKeys(new Set());
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isTemplateMenuOpen]);

  // 字段被用户编辑时，自动从「已智能填充」标记中移除（用户接手了内容）
  useEffect(() => {
    setAutoFilledKeys(prev => {
      if (prev.size === 0) return prev;
      const next = new Set(prev);
      const read = (key: AutoFillKey) => {
        switch (key) {
          case 'promptSystem':
            return form.promptSystem;
          case 'promptContent':
            return form.promptContent;
          case 'digest':
            return form.digest;
          case 'imageCover.value':
            return form.imageCover.value;
          default:
            if (key.startsWith('imagesInlineList.')) {
              const idx = Number(key.split('.')[1]);
              return form.imagesInlineList[idx]?.value ?? '';
            }
            return '';
        }
      };
      prev.forEach(key => {
        const filledValue = lastAutoFill?.filledValues?.[key] ?? '';
        if (read(key) !== filledValue) next.delete(key);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [form, lastAutoFill]);

  const exportedJson = useMemo(() => JSON.stringify(form, null, 2), [form]);
  const completionItems = useMemo(
    () => getCompletionItems(form, publisherCopy),
    [form, publisherCopy]
  );
  const completedCount = completionItems.filter(item => item.done).length;
  // 页面标题 / 描述 / 面包屑文字统一从 tools.json 读取，
  // 与目录卡片、SEO 数据保持单一数据源；slug 改了就同步更新。
  const publisherTool = useMemo(
    () => localizedTools.find(item => item.seo?.slug === 'official-publisher'),
    [localizedTools]
  );

  function updateField<K extends keyof WechatPublisherForm>(
    key: K,
    value: WechatPublisherForm[K]
  ) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function updatePublishMode(publishMode: OfficialPublisherMode) {
    setTemplateMenuOpen(false);
    setPendingTemplate(null);
    setSelectedKeys(new Set());
    setLastAutoFill(null);
    setAutoFilledKeys(new Set());
    setErrors([]);
    setForm(current => ({
      ...current,
      publishMode,
      rewriteRequirement: hasText(current.rewriteRequirement)
        ? current.rewriteRequirement
        : defaultRewriteRequirement,
    }));
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
    const nextErrors = getValidationErrors(form, publisherCopy);
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

    const body: PostOfficialPublisherBody = {
      appId: form.appId.trim(),
      appSecret: form.appSecret.trim(),
      publishMode: form.publishMode,
      articleType: 'news',
      provider: form.provider,
      comment: {
        open: form.comment.open === 1 ? 1 : 0,
        fansOnly: form.comment.fansOnly === 1 ? 1 : 0,
      },
    };
    if (form.publishMode === 'rewrite') {
      body.sourceArticleUrl = form.sourceArticleUrl.trim();
      body.rewriteRequirement = form.rewriteRequirement.trim();
      body.inlineImageCount = 3;
    } else {
      body.imageCover = {
        type: form.imageCover.type,
        value: form.imageCover.value,
      };
      body.imagesInlineList = form.imagesInlineList.map(item => ({
        type: item.type,
        value: item.value,
      }));
    }
    const promptSystem = form.promptSystem.trim();
    const promptContent = form.promptContent.trim();
    const author = form.author.trim();
    const digest = form.digest.trim();
    const sourceUrl = form.sourceUrl.trim();
    if (form.publishMode === 'create') {
      if (promptSystem) body.promptSystem = promptSystem;
      if (promptContent) body.promptContent = promptContent;
      if (author) body.author = author;
      if (digest) body.digest = digest;
      if (sourceUrl) body.sourceUrl = sourceUrl;
    }

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
    setForm(defaultForm);
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
      const imported = normalizeForm(JSON.parse(await file.text()));
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

  // 计算模板会填充的字段；AI 图片项即使为空也要进入计划。
  function buildApplyPlan(currentForm: WechatPublisherForm): {
    previousValues: Partial<Record<AutoFillKey, string>>;
    filledKeys: AutoFillKey[];
  } {
    const previousValues: Partial<Record<AutoFillKey, string>> = {};
    const filledKeys: AutoFillKey[] = [
      'promptSystem',
      'promptContent',
      'digest',
    ];

    previousValues['promptSystem'] = currentForm.promptSystem;
    previousValues['promptContent'] = currentForm.promptContent;
    previousValues['digest'] = currentForm.digest;
    if (currentForm.imageCover.type === 'ai') {
      previousValues['imageCover.value'] = currentForm.imageCover.value;
      filledKeys.push('imageCover.value');
    }
    currentForm.imagesInlineList.forEach((item, index) => {
      if (item.type === 'ai') {
        const key: AutoFillKey = `imagesInlineList.${index}.value`;
        previousValues[key] = item.value;
        filledKeys.push(key);
      }
    });

    return { previousValues, filledKeys };
  }

  function getTemplateDisplay(template: PromptTemplate) {
    const meta = publisherCopy.promptTemplates[template.id];
    return {
      label: meta?.[0] ?? template.label,
      caption: meta?.[1] ?? template.caption,
    };
  }

  // 用户在弹层里点击某个模板卡：若表单为空则直接应用，否则弹出确认
  function requestApplyTemplate(template: PromptTemplate) {
    const plan = buildApplyPlan(form);
    const hasExistingValues = plan.filledKeys.some(key =>
      hasText(plan.previousValues[key] ?? '')
    );
    if (!hasExistingValues) {
      applyTemplate(template, plan.previousValues, plan.filledKeys);
    } else {
      setTemplateMenuOpen(false);
      setPendingTemplate(template);
      // 按模板的 defaultCheckedPatterns 预勾选；用户仍可在弹窗里手动调整
      const defaults = expandDefaultCheckedPatterns(
        template.defaultCheckedPatterns,
        form,
        plan.filledKeys
      );
      setSelectedKeys(new Set(defaults));
    }
  }

  function applyTemplate(
    template: PromptTemplate,
    previousValues: Partial<Record<AutoFillKey, string>>,
    filledKeys: AutoFillKey[]
  ) {
    const templateDisplay = getTemplateDisplay(template);
    const keySet = new Set(filledKeys);
    const filledValues: Partial<Record<AutoFillKey, string>> = {};
    filledKeys.forEach(key => {
      filledValues[key] = newValueForKey(template, key);
    });
    setForm(current => {
      const draft: WechatPublisherForm = { ...current };

      // 只替换用户勾选过的字段
      if (keySet.has('promptSystem')) {
        draft.promptSystem = template.fields.promptSystem;
      }
      if (keySet.has('promptContent')) {
        draft.promptContent = template.fields.promptContent;
      }
      if (keySet.has('digest')) {
        draft.digest = template.fields.digest;
      }
      if (keySet.has('imageCover.value') && draft.imageCover.type === 'ai') {
        draft.imageCover = {
          ...draft.imageCover,
          value: template.fields.coverValue,
        };
      }

      const inlineChanged = filledKeys.some(key =>
        key.startsWith('imagesInlineList.')
      );
      if (inlineChanged) {
        draft.imagesInlineList = current.imagesInlineList.map((item, index) => {
          const key: AutoFillKey = `imagesInlineList.${index}.value`;
          if (keySet.has(key) && item.type === 'ai') {
            return { ...item, value: pickInlinePrompt(template, index) };
          }
          return item;
        });
      }

      return draft;
    });

    // 把所有被替换的字段都标记为「已智能填充」
    setAutoFilledKeys(prev => {
      const next = new Set(prev);
      filledKeys.forEach(key => next.add(key));
      return next;
    });
    setLastAutoFill({
      templateId: template.id,
      templateLabel: templateDisplay.label,
      previousValues,
      filledValues,
      filledKeys,
    });
    setTemplateMenuOpen(false);
    setPendingTemplate(null);
    setSelectedKeys(new Set());
    setStatusText(
      `${publisherCopy.autoFill.appliedPrefix}「${templateDisplay.label}」${publisherCopy.autoFill.appliedMiddle} ${filledKeys.length} ${publisherCopy.autoFill.appliedSuffix}`
    );
  }

  function confirmPendingTemplate() {
    if (!pendingTemplate) return;
    const plan = buildApplyPlan(form);
    // 只对用户当前勾选的字段进行替换
    const filledKeys = plan.filledKeys.filter(key => selectedKeys.has(key));
    const previousValues: Partial<Record<AutoFillKey, string>> = {};
    for (const key of filledKeys) {
      const prev = plan.previousValues[key];
      if (prev !== undefined) previousValues[key] = prev;
    }
    applyTemplate(pendingTemplate, previousValues, filledKeys);
  }

  function cancelPendingTemplate() {
    setPendingTemplate(null);
    setSelectedKeys(new Set());
  }

  function toggleSelectedKey(key: AutoFillKey) {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function setAllSelectedKeys(keys: AutoFillKey[], selected: boolean) {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      keys.forEach(key => {
        if (selected) next.add(key);
        else next.delete(key);
      });
      return next;
    });
  }

  function revertLastAutoFill() {
    const snapshot = lastAutoFill;
    if (!snapshot) return;
    setForm(current => {
      const draft: WechatPublisherForm = { ...current };
      snapshot.filledKeys.forEach(key => {
        const previous = snapshot.previousValues[key] ?? '';
        switch (key) {
          case 'promptSystem':
            draft.promptSystem = previous;
            break;
          case 'promptContent':
            draft.promptContent = previous;
            break;
          case 'digest':
            draft.digest = previous;
            break;
          case 'imageCover.value':
            draft.imageCover = { ...draft.imageCover, value: previous };
            break;
          default:
            if (key.startsWith('imagesInlineList.')) {
              const idx = Number(key.split('.')[1]);
              draft.imagesInlineList = draft.imagesInlineList.map(
                (item, itemIndex) =>
                  itemIndex === idx ? { ...item, value: previous } : item
              );
            }
        }
      });
      return draft;
    });
    setAutoFilledKeys(prev => {
      const next = new Set(prev);
      snapshot.filledKeys.forEach(key => next.delete(key));
      return next;
    });
    setLastAutoFill(null);
    setStatusText(
      `${publisherCopy.autoFill.revertedPrefix}「${snapshot.templateLabel}」${publisherCopy.autoFill.revertedSuffix}`
    );
  }

  function clearAutoFillField(key: AutoFillKey) {
    const snapshot = lastAutoFill;
    const previous = snapshot?.previousValues[key] ?? '';
    setForm(current => {
      const draft: WechatPublisherForm = { ...current };
      switch (key) {
        case 'promptSystem':
          draft.promptSystem = previous;
          break;
        case 'promptContent':
          draft.promptContent = previous;
          break;
        case 'digest':
          draft.digest = previous;
          break;
        case 'imageCover.value':
          draft.imageCover = { ...draft.imageCover, value: previous };
          break;
        default:
          if (key.startsWith('imagesInlineList.')) {
            const idx = Number(key.split('.')[1]);
            draft.imagesInlineList = draft.imagesInlineList.map(
              (item, itemIndex) =>
                itemIndex === idx ? { ...item, value: previous } : item
            );
          }
      }
      return draft;
    });
    setAutoFilledKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setStatusText(publisherCopy.autoFill.clearedField);
  }

  return (
    <>
      <Seo config={localizedToolSeo['official-publisher']} />
      <section className='tool-form-page'>
        <Link className='back-link interactive' to={localizePath('/tools')}>
          <ArrowLeft size={16} aria-hidden='true' />
          {publisherCopy.backLabel}
        </Link>
        <div className='tool-form-hero'>
          <div>
            <h1>{publisherTool?.name ?? publisherCopy.fallbackName}</h1>
            <p>{publisherTool?.summary ?? publisherCopy.fallbackSummary}</p>
          </div>
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

        <form className='publisher-form' onSubmit={handleGenerate}>
          <OCard
            as='section'
            accentBar
            className='form-panel publisher-mode-card'
            padding='lg'
          >
            <div className='form-panel-heading'>
              <span className='panel-icon'>
                <Sparkles size={19} aria-hidden='true' />
              </span>
              <div>
                <h2>{publisherCopy.modeSwitch.title}</h2>
                <p>{publisherCopy.modeSwitch.description}</p>
              </div>
            </div>
            <div className='mode-choice-field'>
              <span className='mode-choice-label'>
                {publisherCopy.modeSwitch.legend}
              </span>
              <ORadio
                ariaLabel={publisherCopy.modeSwitch.legend}
                className='publisher-mode-radio'
                options={modeOptions}
                value={form.publishMode}
                onChange={updatePublishMode}
              />
            </div>
          </OCard>

          {form.publishMode === 'create' && lastAutoFill ? (
            <div className='autofill-banner' role='status'>
              <Sparkles size={16} aria-hidden='true' />
              <span>
                {publisherCopy.autoFill.bannerPrefix}{' '}
                {lastAutoFill.filledKeys.length}{' '}
                {publisherCopy.autoFill.bannerMiddle}「
                {lastAutoFill.templateLabel}」
              </span>
              <button
                className='autofill-banner-action interactive'
                type='button'
                onClick={revertLastAutoFill}
              >
                <RotateCcw size={14} aria-hidden='true' />
                {publisherCopy.autoFill.undo}
              </button>
              <button
                className='autofill-banner-close interactive'
                type='button'
                aria-label={publisherCopy.autoFill.closeTip}
                onClick={() => setLastAutoFill(null)}
              >
                <X size={14} aria-hidden='true' />
              </button>
            </div>
          ) : null}
          <div className='publisher-workspace'>
            <div className='publisher-main'>
              <OCard as='section' accentBar className='form-panel' padding='lg'>
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
              </OCard>

              {form.publishMode === 'create' ? (
                <>
                  <OCard
                    as='section'
                    accentBar
                    className='form-panel'
                    padding='lg'
                  >
                    <div className='form-panel-heading'>
                      <span className='panel-icon'>
                        <Sparkles size={19} aria-hidden='true' />
                      </span>
                      <div className='form-panel-heading-main'>
                        <h2>{publisherCopy.sections.prompt.title}</h2>
                        <p>{publisherCopy.sections.prompt.description}</p>
                      </div>
                      <div className='autofill-trigger' ref={templateMenuRef}>
                        <OButton
                          ref={templateButtonRef}
                          type='button'
                          size='sm'
                          variant='ghost'
                          aria-haspopup='dialog'
                          aria-expanded={isTemplateMenuOpen}
                          onClick={() =>
                            setTemplateMenuOpen(current => !current)
                          }
                        >
                          <Wand2 size={17} aria-hidden='true' />
                          {publisherCopy.sections.prompt.aiFill}
                        </OButton>
                      </div>
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
                      {autoFilledKeys.has('promptSystem') ? (
                        <AutoFillChip
                          copy={publisherCopy}
                          onClear={() => clearAutoFillField('promptSystem')}
                        />
                      ) : null}
                    </label>
                    <label className='field'>
                      <span>{publisherCopy.sections.prompt.contentLabel}</span>
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
                      {autoFilledKeys.has('promptContent') ? (
                        <AutoFillChip
                          copy={publisherCopy}
                          onClear={() => clearAutoFillField('promptContent')}
                        />
                      ) : null}
                    </label>
                  </OCard>

                  <OCard
                    as='section'
                    accentBar
                    className='form-panel'
                    padding='lg'
                  >
                    <div className='form-panel-heading'>
                      <span className='panel-icon'>
                        <Image size={19} aria-hidden='true' />
                      </span>
                      <div>
                        <h2>{publisherCopy.sections.images.title}</h2>
                        <p>{publisherCopy.sections.images.description}</p>
                      </div>
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
                            : publisherCopy.sections.images.coverUrlPlaceholder
                        }
                        required
                      />
                      {autoFilledKeys.has('imageCover.value') ? (
                        <AutoFillChip
                          copy={publisherCopy}
                          onClear={() => clearAutoFillField('imageCover.value')}
                        />
                      ) : null}
                    </label>

                    <div className='inline-image-head'>
                      <div>
                        <h3>{publisherCopy.sections.images.inlineTitle}</h3>
                        <p>
                          {form.imagesInlineList.length
                            ? `${publisherCopy.sections.images.inlineAddedPrefix} ${form.imagesInlineList.length} ${publisherCopy.sections.images.inlineAddedSuffix}`
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
                          interactive
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
                              aria-label={`${publisherCopy.sections.images.deleteInlineImage} ${index + 1}`}
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
                                updateInlineImage(index, {
                                  value,
                                })
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
                            {autoFilledKeys.has(
                              `imagesInlineList.${index}.value` as AutoFillKey
                            ) ? (
                              <AutoFillChip
                                copy={publisherCopy}
                                onClear={() =>
                                  clearAutoFillField(
                                    `imagesInlineList.${index}.value` as AutoFillKey
                                  )
                                }
                              />
                            ) : null}
                          </label>
                        </OCard>
                      ))}
                    </div>
                  </OCard>

                  <OCard
                    as='section'
                    accentBar
                    className='form-panel'
                    padding='lg'
                  >
                    <div className='form-panel-heading'>
                      <span className='panel-icon'>
                        <Newspaper size={19} aria-hidden='true' />
                      </span>
                      <div>
                        <h2>{publisherCopy.sections.meta.title}</h2>
                        <p>{publisherCopy.sections.meta.description}</p>
                      </div>
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
                        <span>{publisherCopy.sections.meta.sourceUrl}</span>
                        <input
                          value={form.sourceUrl}
                          onChange={event =>
                            updateField('sourceUrl', event.target.value)
                          }
                          placeholder='https://example.com/source'
                        />
                      </label>
                    </div>
                    <label className='field'>
                      <span>{publisherCopy.sections.meta.digest}</span>
                      <textarea
                        value={form.digest}
                        onChange={event =>
                          updateField('digest', event.target.value)
                        }
                        rows={3}
                        placeholder={
                          publisherCopy.sections.meta.digestPlaceholder
                        }
                      />
                      {autoFilledKeys.has('digest') ? (
                        <AutoFillChip
                          copy={publisherCopy}
                          onClear={() => clearAutoFillField('digest')}
                        />
                      ) : null}
                    </label>
                    <fieldset className='choice-field'>
                      <legend>{publisherCopy.sections.meta.comment}</legend>
                      {commentOptions.map(option => (
                        <label className='interactive' key={option.label}>
                          <input
                            type='radio'
                            checked={
                              option.value.open === form.comment.open &&
                              option.value.fansOnly === form.comment.fansOnly
                            }
                            onChange={() => updateComment(option.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </fieldset>
                  </OCard>
                </>
              ) : (
                <OCard
                  as='section'
                  accentBar
                  className='form-panel rewrite-panel'
                  padding='lg'
                >
                  <div className='form-panel-heading'>
                    <span className='panel-icon'>
                      <Newspaper size={19} aria-hidden='true' />
                    </span>
                    <div>
                      <h2>{publisherCopy.sections.rewrite.title}</h2>
                      <p>{publisherCopy.sections.rewrite.description}</p>
                    </div>
                  </div>
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
                    <small>
                      {publisherCopy.sections.rewrite.sourceUrlHint}
                    </small>
                  </label>
                  <label className='field'>
                    <span>{publisherCopy.sections.rewrite.requirement}</span>
                    <textarea
                      value={form.rewriteRequirement}
                      onChange={event =>
                        updateField('rewriteRequirement', event.target.value)
                      }
                      rows={6}
                      placeholder={
                        publisherCopy.sections.rewrite.requirementPlaceholder
                      }
                    />
                    <small>
                      {publisherCopy.sections.rewrite.requirementHint}
                    </small>
                  </label>
                </OCard>
              )}
            </div>

            <aside
              className='publisher-aside'
              aria-label={publisherCopy.aside.summaryAriaLabel}
              ref={publisherAsideRef}
            >
              {publishPhase !== 'idle' ? (
                <PublisherProgressPanel
                  copy={publisherCopy}
                  elapsedMs={publishElapsedMs}
                  phase={publishPhase}
                  steps={publishSteps}
                />
              ) : null}

              <OCard
                as='section'
                className='publish-summary-card publish-readiness-card'
                aria-label={publisherCopy.aside.progressAriaLabel}
                padding='md'
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
              </OCard>

              <OCard
                as='section'
                className='publisher-action-dock'
                aria-label={publisherCopy.aside.actionAriaLabel}
                padding='sm'
                tone='soft'
              >
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

      {form.publishMode === 'create' && isTemplateMenuOpen && popoverPos
        ? createPortal(
            <OCard
              className='autofill-menu'
              role='dialog'
              aria-label={publisherCopy.autoFill.menuAriaLabel}
              padding='sm'
              ref={templateMenuRef}
              style={{
                position: 'fixed',
                top: popoverPos.top,
                right: popoverPos.right,
              }}
              tone='soft'
            >
              <div className='autofill-menu-head'>
                <strong>{publisherCopy.autoFill.menuTitle}</strong>
                <p>{publisherCopy.autoFill.menuDescription}</p>
              </div>
              <div className='autofill-menu-list'>
                {promptTemplates.map(template => {
                  const plan = buildApplyPlan(form);
                  const affectedKeys = plan.filledKeys;
                  const templateDisplay = getTemplateDisplay(template);
                  // 预览该模板的默认预勾选数（用于在卡片上给用户预期）
                  const defaultKeys = expandDefaultCheckedPatterns(
                    template.defaultCheckedPatterns,
                    form,
                    affectedKeys
                  );
                  return (
                    <button
                      className='autofill-card interactive'
                      type='button'
                      key={template.id}
                      onClick={() => requestApplyTemplate(template)}
                    >
                      <span className='autofill-card-accent' aria-hidden='true'>
                        {template.accent}
                      </span>
                      <span className='autofill-card-body'>
                        <span className='autofill-card-title'>
                          {templateDisplay.label}
                        </span>
                        <span className='autofill-card-caption'>
                          {templateDisplay.caption}
                        </span>
                        <span className='autofill-card-meta'>
                          <PenLine size={13} aria-hidden='true' />
                          {publisherCopy.autoFill.coverCountPrefix}{' '}
                          {affectedKeys.length}{' '}
                          {publisherCopy.autoFill.coverCountSuffix}
                          {affectedKeys.length > 0 ? (
                            <em className='autofill-card-default'>
                              · {publisherCopy.autoFill.defaultCountPrefix}{' '}
                              {defaultKeys.length}{' '}
                              {publisherCopy.autoFill.defaultCountSuffix}
                            </em>
                          ) : null}
                        </span>
                      </span>
                      <span className='autofill-card-arrow' aria-hidden='true'>
                        →
                      </span>
                    </button>
                  );
                })}
              </div>
            </OCard>,
            document.body
          )
        : null}

      {form.publishMode === 'create' && pendingTemplate ? (
        <OModal
          className='autofill-confirm'
          isOpen
          onClose={cancelPendingTemplate}
          overlayClassName='autofill-confirm-overlay'
          panelRef={confirmDialogRef}
          titleId='autofill-confirm-title'
        >
          <>
            <div className='autofill-confirm-head'>
              <span className='autofill-confirm-icon' aria-hidden='true'>
                ⚠️
              </span>
              <div>
                <h3 id='autofill-confirm-title'>
                  {publisherCopy.autoFill.confirmTitlePrefix}「
                  {getTemplateDisplay(pendingTemplate).label}」
                  {publisherCopy.autoFill.confirmTitleSuffix}
                </h3>
                <p>
                  {publisherCopy.autoFill.confirmDescriptionPrefix}{' '}
                  {buildApplyPlan(form).filledKeys.length}{' '}
                  {publisherCopy.autoFill.confirmDescriptionMiddle}{' '}
                  {selectedKeys.size}{' '}
                  {publisherCopy.autoFill.confirmDescriptionSuffix}
                </p>
              </div>
              <OIconButton
                className='autofill-banner-close interactive'
                aria-label={publisherCopy.autoFill.closeConfirm}
                size='sm'
                variant='ghost'
                onClick={cancelPendingTemplate}
              >
                <X size={16} aria-hidden='true' />
              </OIconButton>
            </div>
            <div className='autofill-confirm-toolbar'>
              <button
                className='autofill-confirm-tool interactive'
                type='button'
                onClick={() => {
                  const plan = buildApplyPlan(form);
                  setAllSelectedKeys(plan.filledKeys, true);
                }}
              >
                <CheckCheck size={13} aria-hidden='true' />
                {publisherCopy.autoFill.selectAll}
              </button>
              <button
                className='autofill-confirm-tool interactive'
                type='button'
                onClick={() => {
                  const plan = buildApplyPlan(form);
                  setAllSelectedKeys(plan.filledKeys, false);
                }}
              >
                <Square size={13} aria-hidden='true' />
                {publisherCopy.autoFill.selectNone}
              </button>
            </div>
            <ul className='autofill-confirm-list'>
              {(() => {
                const plan = buildApplyPlan(form);
                const labelOf = (key: AutoFillKey) => {
                  if (key === 'promptSystem')
                    return publisherCopy.autoFill.fieldLabels.promptSystem;
                  if (key === 'promptContent')
                    return publisherCopy.autoFill.fieldLabels.promptContent;
                  if (key === 'digest')
                    return publisherCopy.autoFill.fieldLabels.digest;
                  if (key === 'imageCover.value')
                    return publisherCopy.autoFill.fieldLabels.cover;
                  if (key.startsWith('imagesInlineList.')) {
                    const idx = Number(key.split('.')[1]);
                    return `${publisherCopy.autoFill.fieldLabels.inline} ${
                      idx + 1
                    } ${publisherCopy.autoFill.fieldLabels.inlineSuffix}`;
                  }
                  return key;
                };
                return plan.filledKeys.map(key => {
                  const checked = selectedKeys.has(key);
                  return (
                    <li
                      key={key}
                      className={
                        checked
                          ? 'autofill-confirm-item is-checked'
                          : 'autofill-confirm-item'
                      }
                    >
                      <label className='autofill-confim-row interactive'>
                        <input
                          type='checkbox'
                          checked={checked}
                          onChange={() => toggleSelectedKey(key)}
                        />
                        <span className='autofill-confirm-label'>
                          {labelOf(key)}
                        </span>
                        <span className='autofill-confirm-current'>
                          {truncate(plan.previousValues[key] ?? '', 50)}
                        </span>
                        <span
                          className='autofill-confirm-arrow'
                          aria-hidden='true'
                        >
                          →
                        </span>
                        <span className='autofill-confirm-new'>
                          {truncate(newValueForKey(pendingTemplate, key), 50)}
                        </span>
                      </label>
                    </li>
                  );
                });
              })()}
            </ul>
            <div className='autofill-confirm-actions'>
              <OButton
                type='button'
                variant='ghost'
                onClick={cancelPendingTemplate}
              >
                {publisherCopy.autoFill.cancel}
              </OButton>
              <OButton
                type='button'
                onClick={confirmPendingTemplate}
                disabled={selectedKeys.size === 0}
              >
                <Wand2 size={16} aria-hidden='true' />
                {publisherCopy.autoFill.replacePrefix} {selectedKeys.size}{' '}
                {publisherCopy.autoFill.replaceSuffix}
              </OButton>
            </div>
          </>
        </OModal>
      ) : null}
    </>
  );
}
