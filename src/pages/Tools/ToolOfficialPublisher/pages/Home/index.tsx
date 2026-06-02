import {
  streamPostOfficialPublisher,
  type OfficialArticleType,
  type OfficialCommentConfig,
  type OfficialDraftResult,
  type OfficialImageConfig,
  type OfficialImageSourceType,
  type OfficialPublisherProgressEvent,
  type PostOfficialPublisherBody,
} from '@/api';
import WechatConsoleGuide from '@/assets/wechat-console-guide.svg';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { OModal } from '@/components/OModal';
import { Seo } from '@/components/Seo';
import { toolSeo } from '@/config/seo';
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

type ReferenceType = 'festivals' | 'solarTerms';
interface WechatPublisherForm {
  appId: string;
  appSecret: string;
  articleType: OfficialArticleType;
  promptSystem: string;
  promptContent: string;
  promptReferences: ReferenceType[];
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

const storageKey = 'orz2:wechat-auto-publisher-form';
const wechatConsoleUrl = 'https://developers.weixin.qq.com/console/index';
const wechatDraftBoxUrl =
  'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_list&action=list&begin=0&count=10&type=10&lang=zh_CN';
const apiWhitelistIp = '43.167.247.143';
const publisherStepDefinitions = [
  { key: 'generate_article', name: '生成文章内容' },
  { key: 'prepare_cover', name: '准备并上传封面图' },
  { key: 'prepare_inline_images', name: '准备并上传正文配图' },
  { key: 'assemble_draft', name: '组装微信公众号草稿' },
  { key: 'submit_draft', name: '提交草稿到微信' },
  { key: 'save_record', name: '保存草稿发布记录' },
];
const defaultForm: WechatPublisherForm = {
  appId: '',
  appSecret: '',
  articleType: 'news',
  promptSystem: '',
  promptContent: '',
  promptReferences: [],
  imageCover: { type: 'ai', value: '' },
  imagesInlineList: [],
  author: '',
  digest: '',
  sourceUrl: '',
  comment: { open: 1, fansOnly: 0 },
};

const referenceOptions: Array<{ label: string; value: ReferenceType }> = [
  { label: '节日', value: 'festivals' },
  { label: '节气', value: 'solarTerms' },
];

const commentOptions: Array<{
  label: string;
  value: OfficialCommentConfig;
}> = [
  { label: '关闭评论', value: { open: 0, fansOnly: 0 } },
  { label: '开放评论', value: { open: 1, fansOnly: 0 } },
  { label: '仅粉丝评论', value: { open: 1, fansOnly: 1 } },
];

function createInitialPublishSteps(): PublishStep[] {
  return publisherStepDefinitions.map((step, index) => ({
    ...step,
    index: index + 1,
    status: 'pending',
  }));
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(durationMs < 10000 ? 1 : 0)}s`;
}

function PublisherProgressPanel({
  elapsedMs,
  phase,
  steps,
}: {
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
  const phaseLabel =
    phase === 'connecting'
      ? '正在建立连接'
      : phase === 'publishing'
        ? '实时发布中'
        : phase === 'completed'
          ? '发布完成'
          : '发布遇到问题';

  return (
    <OCard
      as='section'
      className={`publish-progress-card is-${phase}`}
      aria-label='实时发布状态'
      padding='md'
      tone='brand'
    >
      <div className='publish-progress-head'>
        <div className='summary-heading'>
          <Activity size={18} aria-hidden='true' />
          <h2>实时发布轨迹</h2>
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
          {completedCount}/{steps.length} 步已完成
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
                    ? '等待前序步骤完成'
                    : step.status === 'completed'
                      ? '处理完成'
                      : '正在处理中')}
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
  draftResult,
  onClose,
}: {
  draftResult: OfficialDraftResult | null;
  onClose: () => void;
}) {
  const inlineImageCount = draftResult?.inlineImagePaths?.length ?? 0;

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
          aria-label='关闭草稿发布结果'
          autoFocus
        >
          <X size={18} aria-hidden='true' />
        </OIconButton>

        <div className='draft-success-hero'>
          <div className='draft-success-icon' aria-hidden='true'>
            <CheckCheck size={31} strokeWidth={2.4} />
          </div>
          <p>发布任务已完成</p>
          <h2 id='draft-success-title'>草稿已稳稳送达公众号</h2>
          <span>
            已保存到微信公众号草稿箱。现在可以前往后台预览排版、补充细节并安排发布。
          </span>
        </div>

        <div className='draft-success-content'>
          <div className='draft-success-highlight'>
            <div>
              <small>草稿标题</small>
              <strong>{draftResult?.title || '公众号图文草稿'}</strong>
            </div>
            <FileJson size={22} aria-hidden='true' />
          </div>

          <dl className='draft-success-grid'>
            <div>
              <dt>草稿类型</dt>
              <dd>
                {draftResult?.articleType === 'newspic'
                  ? 'newspic 贴图 / 图片消息'
                  : 'news 图文消息'}
              </dd>
            </div>
            <div>
              <dt>生成时间</dt>
              <dd>{draftResult?.time || '刚刚'}</dd>
            </div>
            <div>
              <dt>封面图</dt>
              <dd>{draftResult?.imagePath ? '已完成上传' : '已处理'}</dd>
            </div>
            <div>
              <dt>正文配图</dt>
              <dd>
                {inlineImageCount ? `${inlineImageCount} 张已上传` : '无内嵌图'}
              </dd>
            </div>
          </dl>

          {draftResult?.mediaId ? (
            <div className='draft-success-media'>
              <span>media_id</span>
              <code>{draftResult.mediaId}</code>
            </div>
          ) : null}

          {draftResult?.imagePath || draftResult?.inlineImagePaths?.length ? (
            <details className='draft-success-details'>
              <summary className='interactive'>查看素材处理详情</summary>
              <dl className='summary-list'>
                {draftResult.imagePath ? (
                  <div>
                    <dt>封面图</dt>
                    <dd className='summary-mono'>{draftResult.imagePath}</dd>
                  </div>
                ) : null}
                {draftResult.inlineImagePaths?.length ? (
                  <div>
                    <dt>内嵌图</dt>
                    <dd>
                      {draftResult.inlineImagePaths.map((path, index) => (
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
            留在当前页面
          </OButton>
          <OButton
            href={wechatDraftBoxUrl}
            size='lg'
            target='_blank'
            rel='noreferrer'
          >
            前往公众号草稿箱
            <ExternalLink size={17} aria-hidden='true' />
          </OButton>
        </footer>

        <p className='draft-success-footnote'>
          草稿箱页面将在新窗口打开，当前任务配置会继续保留。
        </p>
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

function AutoFillChip({ onClear }: { onClear: () => void }) {
  return (
    <span className='autofill-chip'>
      <Wand2 size={13} aria-hidden='true' />
      <span>已智能填充</span>
      <button
        className='autofill-chip-clear interactive'
        type='button'
        onClick={onClear}
        aria-label='清除智能填充内容'
      >
        清除
      </button>
    </span>
  );
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
    articleType: source.articleType === 'newspic' ? 'newspic' : 'news',
    promptReferences: Array.isArray(source.promptReferences)
      ? source.promptReferences.filter(
          (item): item is ReferenceType =>
            item === 'festivals' || item === 'solarTerms'
        )
      : [],
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

function getCompletionItems(form: WechatPublisherForm): CompletionItem[] {
  return [
    {
      label: '公众号配置',
      done:
        hasText(form.appId) &&
        hasText(form.appSecret) &&
        Boolean(form.articleType),
    },
    {
      label: '文章生成提示词',
      done: true,
    },
    {
      label: '封面与内嵌图片',
      done:
        Boolean(form.imageCover.type) &&
        hasText(form.imageCover.value) &&
        form.imagesInlineList.every(
          item => Boolean(item.type) && hasText(item.value)
        ),
    },
    {
      label: '文章元信息',
      done: form.comment.open === 1 || form.comment.fansOnly === 1,
    },
  ];
}

function getValidationErrors(form: WechatPublisherForm) {
  const nextErrors: string[] = [];

  if (!hasText(form.appId)) nextErrors.push('请填写公众号 appId。');
  if (!hasText(form.appSecret)) nextErrors.push('请填写公众号 appSecret。');
  if (!form.articleType) nextErrors.push('请选择草稿类型。');
  if (!form.imageCover.type) nextErrors.push('请选择封面图生成类型。');
  if (!hasText(form.imageCover.value))
    nextErrors.push('请填写或上传封面图生成值。');
  form.imagesInlineList.forEach((item, index) => {
    if (!item.type)
      nextErrors.push(`第 ${index + 1} 张内嵌文章图缺少图片类型。`);
    if (!hasText(item.value))
      nextErrors.push(`第 ${index + 1} 张内嵌文章图缺少生成值。`);
  });
  if (form.comment.open === 0 && form.comment.fansOnly === 0) {
    nextErrors.push('请选择评论配置。');
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
  const [form, setForm] = useState<WechatPublisherForm>(() => {
    try {
      return normalizeForm(CacheManager.getLocalStorage(storageKey));
    } catch {
      return defaultForm;
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('表单会自动保存到本机浏览器。');
  const [publishPhase, setPublishPhase] = useState<PublishPhase>('idle');
  const [publishSteps, setPublishSteps] = useState(createInitialPublishSteps);
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
  const completionItems = useMemo(() => getCompletionItems(form), [form]);
  const completedCount = completionItems.filter(item => item.done).length;

  function updateField<K extends keyof WechatPublisherForm>(
    key: K,
    value: WechatPublisherForm[K]
  ) {
    setForm(current => ({ ...current, [key]: value }));
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
    const nextErrors = getValidationErrors(form);
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
              ? `正文配图已上传（${requestedCount}/${requestedCount}）`
              : `正在生成正文配图（${currentInlineImageIndex}/${requestedCount}）`
            : event.message ||
              (event.status === 'info' && event.imageIndex
                ? `正文配图 ${event.imageIndex} 已上传`
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
      setStatusText(`正在执行：${event.name || '公众号草稿发布步骤'}。`);
    } else if (event.status === 'warning') {
      setStatusText(event.message || '部分素材已跳过，发布任务继续执行中。');
    } else if (event.status === 'failed') {
      setPublishPhase('failed');
      setStatusText(`生成失败：${event.message || '发布步骤执行失败'}`);
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      setStatusText('请先补齐必填项，再生成公众号发布任务。');
      return;
    }
    const confirmed = window.confirm(
      '生成公众号发布任务可能耗时较长，请确认是否开始？'
    );
    if (!confirmed) return;

    setIsGenerating(true);
    setDraftResult(null);
    setDraftResultOpen(false);
    setPublishPhase('connecting');
    setPublishSteps(createInitialPublishSteps());
    setPublishElapsedMs(0);
    setStatusText('正在连接发布服务，实时进度会显示在发布轨迹中。');

    const body: PostOfficialPublisherBody = {
      appId: form.appId.trim(),
      appSecret: form.appSecret.trim(),
      articleType: form.articleType,
      imageCover: {
        type: form.imageCover.type,
        value: form.imageCover.value,
      },
      imagesInlineList: form.imagesInlineList.map(item => ({
        type: item.type,
        value: item.value,
      })),
      comment: {
        open: form.comment.open === 1 ? 1 : 0,
        fansOnly: form.comment.fansOnly === 1 ? 1 : 0,
      },
    };
    const promptSystem = form.promptSystem.trim();
    const promptContent = form.promptContent.trim();
    const author = form.author.trim();
    const digest = form.digest.trim();
    const sourceUrl = form.sourceUrl.trim();
    if (promptSystem) body.promptSystem = promptSystem;
    if (promptContent) body.promptContent = promptContent;
    if (form.promptReferences.length) {
      body.promptReferences = [...form.promptReferences];
    }
    if (author) body.author = author;
    if (digest) body.digest = digest;
    if (sourceUrl) body.sourceUrl = sourceUrl;

    try {
      publisherAbortRef.current?.abort();
      const controller = new AbortController();
      publisherAbortRef.current = controller;
      publishStartedAtRef.current = Date.now();
      const result = await streamPostOfficialPublisher(body, {
        signal: controller.signal,
        onConnected: event => {
          setPublishPhase('publishing');
          setStatusText(
            event.message || '已连接发布服务，正在生成公众号草稿。'
          );
        },
        onProgress: updatePublishProgress,
      });
      setDraftResult(result);
      setDraftResultOpen(true);
      setPublishPhase('completed');
      setStatusText(
        result?.title
          ? `已生成草稿「${result.title}」，请在公众号后台查看。`
          : '草稿已生成，请在公众号后台查看。'
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '发布任务提交失败';
      setPublishPhase('failed');
      setPublishSteps(current =>
        current.map(step =>
          step.status === 'running' || step.status === 'warning'
            ? { ...step, status: 'failed', message }
            : step
        )
      );
      setStatusText(`生成失败：${message}`);
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
    const confirmed = window.confirm(
      '重置会清空当前表单并覆盖本机自动保存内容，确认继续？'
    );
    if (!confirmed) return;
    setForm(defaultForm);
    setErrors([]);
    setDraftResult(null);
    setDraftResultOpen(false);
    setPublishPhase('idle');
    setPublishSteps(createInitialPublishSteps());
    setPublishElapsedMs(0);
    setStatusText('表单已重置，并已同步更新本机保存内容。');
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
    setStatusText('JSON 配置已导出。');
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = normalizeForm(JSON.parse(await file.text()));
      setForm(imported);
      setErrors([]);
      setStatusText('JSON 配置已导入，并已自动保存到本机浏览器。');
    } catch {
      setStatusText('JSON 导入失败，请检查文件格式。');
    } finally {
      event.target.value = '';
    }
  }

  function toggleReference(value: ReferenceType) {
    updateField(
      'promptReferences',
      form.promptReferences.includes(value)
        ? form.promptReferences.filter(item => item !== value)
        : [...form.promptReferences, value]
    );
  }

  async function handleCopyIp() {
    try {
      await window.navigator.clipboard.writeText(apiWhitelistIp);
      setCopiedIp(true);
      window.setTimeout(() => setCopiedIp(false), 1800);
    } catch {
      setStatusText(
        `无法自动复制，请手动将 ${apiWhitelistIp} 添加到 API IP 白名单。`
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
      templateLabel: template.label,
      previousValues,
      filledValues,
      filledKeys,
    });
    setTemplateMenuOpen(false);
    setPendingTemplate(null);
    setSelectedKeys(new Set());
    setStatusText(
      `已应用「${template.label}」模板，填充 ${filledKeys.length} 个字段，可点击撤销。`
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
    setStatusText(`已撤销「${snapshot.templateLabel}」模板的智能填充。`);
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
    setStatusText('已清除该字段的智能填充内容。');
  }

  return (
    <>
      <Seo config={toolSeo['official-publisher']} />
      <section className='tool-form-page'>
        <Link className='back-link interactive' to='/tools'>
          <ArrowLeft size={16} aria-hidden='true' />
          在线工具
        </Link>
        <div className='tool-form-hero'>
          <div>
            <h1>公众号发布</h1>
            <p>
              把账号、提示词、图片素材和发布元信息整理成一张清晰的任务单，发布前的关键信息一眼可查。
            </p>
          </div>
          <div className='json-actions' aria-label='JSON 配置操作'>
            <OButton
              type='button'
              variant='ghost'
              onClick={() => importInputRef.current?.click()}
            >
              <Upload size={17} aria-hidden='true' />
              导入 JSON
            </OButton>
            <OButton type='button' variant='secondary' onClick={handleExport}>
              <Download size={17} aria-hidden='true' />
              导出 JSON
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
          <div
            className='wechat-setup-visual interactive'
            tabIndex={0}
            aria-label='查看微信公众平台配置示意大图'
          >
            <img
              src={WechatConsoleGuide}
              alt='微信公众平台配置 AppId、AppSecret 和 API IP 白名单示意图'
            />
            <div className='wechat-setup-preview' aria-hidden='true'>
              <img src={WechatConsoleGuide} alt='' />
            </div>
          </div>
          <div className='wechat-setup-content'>
            <h2 id='wechat-setup-title'>先完成公众号开发配置</h2>
            <ol className='setup-steps'>
              <li>打开微信公众平台开发者控制台，选择要发布的公众号。</li>
              <li>在开发配置里获取 AppId 和 AppSecret，填入下方公众号配置。</li>
              <li>
                配置 API IP 白名单，并加入 <code>{apiWhitelistIp}</code>。
              </li>
            </ol>
            <div className='setup-actions'>
              <OButton href={wechatConsoleUrl} target='_blank' rel='noreferrer'>
                <ExternalLink size={17} aria-hidden='true' />
                打开微信公众平台
              </OButton>
              <OButton type='button' variant='secondary' onClick={handleCopyIp}>
                <Clipboard size={17} aria-hidden='true' />
                {copiedIp ? '已复制 IP' : '复制白名单 IP'}
              </OButton>
            </div>
          </div>
        </OCard>

        <form className='publisher-form' onSubmit={handleGenerate}>
          {lastAutoFill ? (
            <div className='autofill-banner' role='status'>
              <Sparkles size={16} aria-hidden='true' />
              <span>
                已为 {lastAutoFill.filledKeys.length} 个字段智能填充「
                {lastAutoFill.templateLabel}」模板
              </span>
              <button
                className='autofill-banner-action interactive'
                type='button'
                onClick={revertLastAutoFill}
              >
                <RotateCcw size={14} aria-hidden='true' />
                撤销填充
              </button>
              <button
                className='autofill-banner-close interactive'
                type='button'
                aria-label='关闭提示'
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
                    <h2>公众号配置</h2>
                    <p>连接发布账号并选择草稿类型。</p>
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
                      placeholder='请输入公众号 appId'
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
                      placeholder='请输入公众号 appSecret'
                      type='password'
                      required
                    />
                  </label>
                </div>
                <fieldset className='choice-field'>
                  <legend>草稿类型 *</legend>
                  <label className='interactive'>
                    <input
                      type='radio'
                      checked={form.articleType === 'news'}
                      onChange={() => updateField('articleType', 'news')}
                    />
                    news 图文消息
                  </label>
                  {/* <label className='interactive'>
                    <input
                      type='radio'
                      checked={form.articleType === 'newspic'}
                      onChange={() => updateField('articleType', 'newspic')}
                    />
                    newspic 贴图/图片消息
                  </label> */}
                </fieldset>
              </OCard>

              <OCard as='section' accentBar className='form-panel' padding='lg'>
                <div className='form-panel-heading'>
                  <span className='panel-icon'>
                    <Sparkles size={19} aria-hidden='true' />
                  </span>
                  <div className='form-panel-heading-main'>
                    <h2>文章生成提示词</h2>
                    <p>定义内容角色、主题、结构和可引用的信息。</p>
                  </div>
                  <div className='autofill-trigger' ref={templateMenuRef}>
                    <OButton
                      ref={templateButtonRef}
                      type='button'
                      size='sm'
                      variant='ghost'
                      aria-haspopup='dialog'
                      aria-expanded={isTemplateMenuOpen}
                      onClick={() => setTemplateMenuOpen(current => !current)}
                    >
                      <Wand2 size={17} aria-hidden='true' />
                      AI 智能填充
                    </OButton>
                  </div>
                </div>
                <label className='field'>
                  <span>系统提示词</span>
                  <textarea
                    value={form.promptSystem}
                    onChange={event =>
                      updateField('promptSystem', event.target.value)
                    }
                    rows={4}
                    placeholder='例如：你是一名专业公众号内容编辑...'
                  />
                  {autoFilledKeys.has('promptSystem') ? (
                    <AutoFillChip
                      onClear={() => clearAutoFillField('promptSystem')}
                    />
                  ) : null}
                </label>
                <label className='field'>
                  <span>主体内容提示词</span>
                  <textarea
                    value={form.promptContent}
                    onChange={event =>
                      updateField('promptContent', event.target.value)
                    }
                    rows={5}
                    placeholder='输入文章主题、受众、语气、结构要求...'
                  />
                  {autoFilledKeys.has('promptContent') ? (
                    <AutoFillChip
                      onClear={() => clearAutoFillField('promptContent')}
                    />
                  ) : null}
                </label>
                <fieldset className='choice-field'>
                  <legend>参考信息</legend>
                  {referenceOptions.map(option => (
                    <label className='interactive' key={option.value}>
                      <input
                        type='checkbox'
                        checked={form.promptReferences.includes(option.value)}
                        onChange={() => toggleReference(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </fieldset>
              </OCard>

              <OCard as='section' accentBar className='form-panel' padding='lg'>
                <div className='form-panel-heading'>
                  <span className='panel-icon'>
                    <Image size={19} aria-hidden='true' />
                  </span>
                  <div>
                    <h2>封面与内嵌图片</h2>
                    <p>管理首图和正文插图，支持 AI 描述、URL 与本地文件。</p>
                  </div>
                </div>
                <label className='field'>
                  <span>封面图生成值 *</span>
                  <input
                    value={form.imageCover.value}
                    onChange={event =>
                      updateCoverImageValue(event.target.value)
                    }
                    placeholder={
                      form.imageCover.type === 'ai'
                        ? '描述希望生成的封面图'
                        : 'https://example.com/cover.png'
                    }
                    required
                  />
                  {autoFilledKeys.has('imageCover.value') ? (
                    <AutoFillChip
                      onClear={() => clearAutoFillField('imageCover.value')}
                    />
                  ) : null}
                </label>

                <div className='inline-image-head'>
                  <div>
                    <h3>内嵌文章图</h3>
                    <p>
                      {form.imagesInlineList.length
                        ? `已添加 ${form.imagesInlineList.length} / 9 张`
                        : '正文插图可稍后补充'}
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
                    增加图片
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
                        <strong>内嵌图片 {index + 1}</strong>
                        <OIconButton
                          type='button'
                          aria-label={`删除内嵌图片 ${index + 1}`}
                          onClick={() => removeInlineImage(index)}
                          size='sm'
                        >
                          <Trash2 size={17} />
                        </OIconButton>
                      </div>
                      <label className='field'>
                        <span>图片生成值</span>
                        <input
                          value={item.value}
                          onChange={event =>
                            updateInlineImage(index, {
                              value: event.target.value,
                            })
                          }
                          placeholder={
                            item.type === 'ai'
                              ? '描述这张内嵌图'
                              : 'https://example.com/inline.png'
                          }
                        />
                        {autoFilledKeys.has(
                          `imagesInlineList.${index}.value` as AutoFillKey
                        ) ? (
                          <AutoFillChip
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

              <OCard as='section' accentBar className='form-panel' padding='lg'>
                <div className='form-panel-heading'>
                  <span className='panel-icon'>
                    <Newspaper size={19} aria-hidden='true' />
                  </span>
                  <div>
                    <h2>文章元信息</h2>
                    <p>补齐作者、摘要、来源与评论策略。</p>
                  </div>
                </div>
                <div className='form-grid two'>
                  <label className='field'>
                    <span>作者</span>
                    <input
                      value={form.author}
                      onChange={event =>
                        updateField('author', event.target.value)
                      }
                      placeholder='作者名称'
                    />
                  </label>
                  <label className='field'>
                    <span>原文链接</span>
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
                  <span>摘要</span>
                  <textarea
                    value={form.digest}
                    onChange={event =>
                      updateField('digest', event.target.value)
                    }
                    rows={3}
                    placeholder='用于公众号摘要展示的短文案'
                  />
                  {autoFilledKeys.has('digest') ? (
                    <AutoFillChip
                      onClear={() => clearAutoFillField('digest')}
                    />
                  ) : null}
                </label>
                <fieldset className='choice-field'>
                  <legend>评论配置 *</legend>
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
            </div>

            <aside
              className='publisher-aside'
              aria-label='发布任务摘要'
              ref={publisherAsideRef}
            >
              {publishPhase !== 'idle' ? (
                <PublisherProgressPanel
                  elapsedMs={publishElapsedMs}
                  phase={publishPhase}
                  steps={publishSteps}
                />
              ) : null}

              <OCard
                as='section'
                className='publish-summary-card publish-readiness-card'
                aria-label='配置进度'
                padding='md'
              >
                <div className='publish-readiness-head'>
                  <div className='summary-heading'>
                    <CheckCircle2 size={18} aria-hidden='true' />
                    <h2>配置进度</h2>
                  </div>
                  <strong>
                    {completedCount}
                    <small>/4</small>
                  </strong>
                </div>
                <div className='publish-readiness-meter' aria-hidden='true'>
                  <span style={{ width: `${(completedCount / 4) * 100}%` }} />
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
                aria-label='发布操作'
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
                    查看草稿发布结果
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
                    重置
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
                    {isGenerating ? '生成中...' : '生成发布任务'}
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
          draftResult={draftResult}
          onClose={() => setDraftResultOpen(false)}
        />
      ) : null}

      {isTemplateMenuOpen && popoverPos
        ? createPortal(
            <OCard
              className='autofill-menu'
              role='dialog'
              aria-label='选择提示词模板'
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
                <strong>选择提示词模板</strong>
                <p>
                  切换模板会填充提示词与 AI
                  图片描述；已有内容会在替换前二次确认。
                </p>
              </div>
              <div className='autofill-menu-list'>
                {promptTemplates.map(template => {
                  const plan = buildApplyPlan(form);
                  const affectedKeys = plan.filledKeys;
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
                          {template.label}
                        </span>
                        <span className='autofill-card-caption'>
                          {template.caption}
                        </span>
                        <span className='autofill-card-meta'>
                          <PenLine size={13} aria-hidden='true' />
                          切换将覆盖 {affectedKeys.length} 个字段
                          {affectedKeys.length > 0 ? (
                            <em className='autofill-card-default'>
                              · 默认预勾 {defaultKeys.length} 项
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

      {pendingTemplate ? (
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
                  切换到「{pendingTemplate.label}」模板？
                </h3>
                <p>
                  勾选要替换的字段；未勾选的字段将保持原值。 共{' '}
                  {buildApplyPlan(form).filledKeys.length} 项可替换， 已选{' '}
                  {selectedKeys.size} 项。
                </p>
              </div>
              <OIconButton
                className='autofill-banner-close interactive'
                aria-label='关闭确认'
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
                全选
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
                全不选
              </button>
            </div>
            <ul className='autofill-confirm-list'>
              {(() => {
                const plan = buildApplyPlan(form);
                const labelOf = (key: AutoFillKey) => {
                  if (key === 'promptSystem') return '系统提示词';
                  if (key === 'promptContent') return '主体内容提示词';
                  if (key === 'digest') return '摘要';
                  if (key === 'imageCover.value') return '封面图描述（AI）';
                  if (key.startsWith('imagesInlineList.')) {
                    const idx = Number(key.split('.')[1]);
                    return `内嵌图 ${idx + 1} 描述（AI）`;
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
                取消
              </OButton>
              <OButton
                type='button'
                onClick={confirmPendingTemplate}
                disabled={selectedKeys.size === 0}
              >
                <Wand2 size={16} aria-hidden='true' />
                替换 {selectedKeys.size} 个字段
              </OButton>
            </div>
          </>
        </OModal>
      ) : null}
    </>
  );
}
