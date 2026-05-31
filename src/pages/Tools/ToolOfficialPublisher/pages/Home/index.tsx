import { useLoginGate } from '@/components/ContextAuth';
import { Seo } from '@/components/Seo';
import { toolSeo } from '@/config/seo';
import CacheManager from '@/utils/CacheManager';
import WechatConsoleGuide from '@/assets/wechat-console-guide.svg';
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  FileJson,
  Image,
  KeyRound,
  Loader2,
  Newspaper,
  Plus,
  RotateCcw,
  Sparkles,
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

type ArticleType = 'news' | 'newspic';
type ReferenceType = 'festivals' | 'solarTerms';
type ImageType = 'ai' | 'url' | 'base64';
type CommentType = 'open' | 'fansOnly';

interface InlineImageItem {
  type: ImageType;
  value: string;
}

interface WechatPublisherForm {
  appId: string;
  appSecret: string;
  articleType: ArticleType;
  promptSystem: string;
  promptContent: string;
  promptReferences: ReferenceType[];
  imageCoverType: ImageType;
  imageCoverValue: string;
  imagesInlineList: InlineImageItem[];
  author: string;
  digest: string;
  sourceUrl: string;
  comment: CommentType;
}

interface CompletionItem {
  label: string;
  done: boolean;
}

const storageKey = 'orz2:wechat-auto-publisher-form';
const wechatConsoleUrl = 'https://developers.weixin.qq.com/console/index';
const apiWhitelistIp = '43.167.247.143';
const defaultForm: WechatPublisherForm = {
  appId: '',
  appSecret: '',
  articleType: 'news',
  promptSystem: '',
  promptContent: '',
  promptReferences: [],
  imageCoverType: 'ai',
  imageCoverValue: '',
  imagesInlineList: [],
  author: '',
  digest: '',
  sourceUrl: '',
  comment: 'open',
};

const referenceOptions: Array<{ label: string; value: ReferenceType }> = [
  { label: '节日', value: 'festivals' },
  { label: '节气', value: 'solarTerms' },
];

const imageTypeOptions: Array<{ label: string; value: ImageType }> = [
  { label: 'AI 生成', value: 'ai' },
  { label: '图片 URL', value: 'url' },
  { label: 'Base64 文件', value: 'base64' },
];

function normalizeForm(input: unknown): WechatPublisherForm {
  const source =
    typeof input === 'object' && input
      ? (input as Partial<WechatPublisherForm>)
      : {};
  const inlineList = Array.isArray(source.imagesInlineList)
    ? source.imagesInlineList
    : [];

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
    imageCoverType:
      source.imageCoverType === 'url' || source.imageCoverType === 'base64'
        ? source.imageCoverType
        : 'ai',
    imagesInlineList: inlineList.slice(0, 9).map(item => ({
      type: item?.type === 'url' || item?.type === 'base64' ? item.type : 'ai',
      value: typeof item?.value === 'string' ? item.value : '',
    })),
    comment: source.comment === 'fansOnly' ? 'fansOnly' : 'open',
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
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
        Boolean(form.imageCoverType) &&
        hasText(form.imageCoverValue) &&
        form.imagesInlineList.every(
          item => Boolean(item.type) && hasText(item.value)
        ),
    },
    {
      label: '文章元信息',
      done: Boolean(form.comment),
    },
  ];
}

function getValidationErrors(form: WechatPublisherForm) {
  const nextErrors: string[] = [];

  if (!hasText(form.appId)) nextErrors.push('请填写公众号 appId。');
  if (!hasText(form.appSecret)) nextErrors.push('请填写公众号 appSecret。');
  if (!form.articleType) nextErrors.push('请选择草稿类型。');
  if (!form.imageCoverType) nextErrors.push('请选择封面图生成类型。');
  if (!hasText(form.imageCoverValue))
    nextErrors.push('请填写或上传封面图生成值。');
  form.imagesInlineList.forEach((item, index) => {
    if (!item.type)
      nextErrors.push(`第 ${index + 1} 张内嵌文章图缺少图片类型。`);
    if (!hasText(item.value))
      nextErrors.push(`第 ${index + 1} 张内嵌文章图缺少生成值。`);
  });
  if (!form.comment) nextErrors.push('请选择评论配置。');

  return nextErrors;
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
  const [errors, setErrors] = useState<string[]>([]);
  const [copiedIp, setCopiedIp] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const requireLogin = useLoginGate();

  useEffect(() => {
    CacheManager.setLocalStorage(storageKey, form);
  }, [form]);

  const exportedJson = useMemo(() => JSON.stringify(form, null, 2), [form]);
  const referenceLabels = useMemo(
    () =>
      referenceOptions
        .filter(option => form.promptReferences.includes(option.value))
        .map(option => option.label)
        .join(' / '),
    [form.promptReferences]
  );
  const completionItems = useMemo(() => getCompletionItems(form), [form]);
  const completedCount = completionItems.filter(item => item.done).length;
  const imageCoverTypeLabel =
    imageTypeOptions.find(option => option.value === form.imageCoverType)
      ?.label ?? 'AI 生成';

  function updateField<K extends keyof WechatPublisherForm>(
    key: K,
    value: WechatPublisherForm[K]
  ) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function updateCoverImageType(type: ImageType) {
    setForm(current => ({
      ...current,
      imageCoverType: type,
      imageCoverValue:
        current.imageCoverType === type ? current.imageCoverValue : '',
    }));
  }

  function validate() {
    const nextErrors = getValidationErrors(form);
    setErrors(nextErrors);
    return nextErrors.length === 0;
  }

  async function handleCoverFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    updateField('imageCoverValue', await readFileAsDataUrl(file));
  }

  async function handleInlineFile(
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    const value = await readFileAsDataUrl(file);
    updateInlineImage(index, { value });
  }

  function updateInlineImage(index: number, patch: Partial<InlineImageItem>) {
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
    setStatusText(
      '正在整理提示词、图片素材和公众号参数，通常需要几十秒，请保持页面打开。'
    );
    window.setTimeout(
      () =>
        setStatusText(
          '正在准备封面图与内嵌图片素材，Base64 文件会直接使用本地表单内容。'
        ),
      1600
    );
    window.setTimeout(
      () =>
        setStatusText(
          '正在模拟生成发布任务。真实发布接口接入后，会在这里显示任务结果。'
        ),
      3400
    );
    window.setTimeout(() => {
      setIsGenerating(false);
      setStatusText(
        '已完成任务配置校验。当前版本已生成可提交的表单数据，等待后续接入真实发布服务。'
      );
    }, 5200);
  }

  function handleReset() {
    const confirmed = window.confirm(
      '重置会清空当前表单并覆盖本机自动保存内容，确认继续？'
    );
    if (!confirmed) return;
    setForm(defaultForm);
    setErrors([]);
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
            <button
              className='button ghost interactive'
              type='button'
              onClick={() => importInputRef.current?.click()}
            >
              <Upload size={17} aria-hidden='true' />
              导入 JSON
            </button>
            <button
              className='button secondary interactive'
              type='button'
              onClick={handleExport}
            >
              <Download size={17} aria-hidden='true' />
              导出 JSON
            </button>
            <input
              ref={importInputRef}
              className='sr-only'
              type='file'
              accept='application/json,.json'
              onChange={handleImport}
            />
          </div>
        </div>

        <section
          className='wechat-setup-card'
          aria-labelledby='wechat-setup-title'
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
              <a
                className='button primary interactive'
                href={wechatConsoleUrl}
                target='_blank'
                rel='noreferrer'
              >
                <ExternalLink size={17} aria-hidden='true' />
                打开微信公众平台
              </a>
              <button
                className='button secondary interactive'
                type='button'
                onClick={handleCopyIp}
              >
                <Clipboard size={17} aria-hidden='true' />
                {copiedIp ? '已复制 IP' : '复制白名单 IP'}
              </button>
            </div>
          </div>
        </section>

        <form
          className='publisher-form'
          onSubmit={requireLogin(handleGenerate)}
        >
          <div className='publisher-workspace'>
            <div className='publisher-main'>
              <section className='form-panel'>
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
                  <label className='interactive'>
                    <input
                      type='radio'
                      checked={form.articleType === 'newspic'}
                      onChange={() => updateField('articleType', 'newspic')}
                    />
                    newspic 贴图/图片消息
                  </label>
                </fieldset>
              </section>

              <section className='form-panel'>
                <div className='form-panel-heading'>
                  <span className='panel-icon'>
                    <Sparkles size={19} aria-hidden='true' />
                  </span>
                  <div>
                    <h2>文章生成提示词</h2>
                    <p>定义内容角色、主题、结构和可引用的信息。</p>
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
              </section>

              <section className='form-panel'>
                <div className='form-panel-heading'>
                  <span className='panel-icon'>
                    <Image size={19} aria-hidden='true' />
                  </span>
                  <div>
                    <h2>封面与内嵌图片</h2>
                    <p>管理首图和正文插图，支持 AI 描述、URL 与本地文件。</p>
                  </div>
                </div>
                <fieldset className='choice-field'>
                  <legend>封面图生成类型 *</legend>
                  {imageTypeOptions.map(option => (
                    <label className='interactive' key={option.value}>
                      <input
                        type='radio'
                        checked={form.imageCoverType === option.value}
                        onChange={() => updateCoverImageType(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </fieldset>
                {form.imageCoverType === 'base64' ? (
                  <label className='field'>
                    <span>封面图文件 *</span>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleCoverFile}
                    />
                    <small>
                      {form.imageCoverValue
                        ? '已保存 Base64 文件内容。'
                        : '请选择图片文件，系统会转为 Base64 保存。'}
                    </small>
                  </label>
                ) : (
                  <label className='field'>
                    <span>封面图生成值 *</span>
                    <input
                      value={form.imageCoverValue}
                      onChange={event =>
                        updateField('imageCoverValue', event.target.value)
                      }
                      placeholder={
                        form.imageCoverType === 'ai'
                          ? '描述希望生成的封面图'
                          : 'https://example.com/cover.png'
                      }
                      required
                    />
                  </label>
                )}

                <div className='inline-image-head'>
                  <div>
                    <h3>内嵌文章图</h3>
                    <p>
                      {form.imagesInlineList.length
                        ? `已添加 ${form.imagesInlineList.length} / 9 张`
                        : '正文插图可稍后补充'}
                    </p>
                  </div>
                  <button
                    className='button ghost interactive'
                    type='button'
                    onClick={addInlineImage}
                    disabled={form.imagesInlineList.length >= 9}
                  >
                    <Plus size={17} aria-hidden='true' />
                    增加图片
                  </button>
                </div>
                <div className='inline-image-list'>
                  {form.imagesInlineList.map((item, index) => (
                    <article className='inline-image-item' key={index}>
                      <div className='inline-image-title'>
                        <strong>内嵌图片 {index + 1}</strong>
                        <button
                          className='icon-button interactive'
                          type='button'
                          aria-label={`删除内嵌图片 ${index + 1}`}
                          onClick={() => removeInlineImage(index)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <fieldset className='choice-field compact'>
                        <legend>图片类型</legend>
                        {imageTypeOptions.map(option => (
                          <label className='interactive' key={option.value}>
                            <input
                              type='radio'
                              checked={item.type === option.value}
                              onChange={() =>
                                updateInlineImage(index, {
                                  type: option.value,
                                  value: '',
                                })
                              }
                            />
                            {option.label}
                          </label>
                        ))}
                      </fieldset>
                      {item.type === 'base64' ? (
                        <label className='field'>
                          <span>图片文件</span>
                          <input
                            type='file'
                            accept='image/*'
                            onChange={event => handleInlineFile(index, event)}
                          />
                          <small>
                            {item.value
                              ? '已保存 Base64 文件内容。'
                              : '请选择图片文件。'}
                          </small>
                        </label>
                      ) : (
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
                        </label>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              <section className='form-panel'>
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
                </label>
                <fieldset className='choice-field'>
                  <legend>评论配置 *</legend>
                  <label className='interactive'>
                    <input
                      type='radio'
                      checked={form.comment === 'open'}
                      onChange={() => updateField('comment', 'open')}
                    />
                    open 开放评论
                  </label>
                  <label className='interactive'>
                    <input
                      type='radio'
                      checked={form.comment === 'fansOnly'}
                      onChange={() => updateField('comment', 'fansOnly')}
                    />
                    fansOnly 仅粉丝评论
                  </label>
                </fieldset>
              </section>
            </div>

            <aside className='publisher-aside' aria-label='发布任务摘要'>
              <section className='publish-summary-card'>
                <div className='summary-score'>
                  <span>{completedCount}/4</span>
                  <p>配置进度</p>
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
              </section>

              <section className='publish-summary-card'>
                <div className='summary-heading'>
                  <FileJson size={18} aria-hidden='true' />
                  <h2>任务快照</h2>
                </div>
                <dl className='summary-list'>
                  <div>
                    <dt>草稿类型</dt>
                    <dd>
                      {form.articleType === 'news'
                        ? 'news 图文消息'
                        : 'newspic 贴图/图片消息'}
                    </dd>
                  </div>
                  <div>
                    <dt>封面方式</dt>
                    <dd>{imageCoverTypeLabel}</dd>
                  </div>
                  <div>
                    <dt>内嵌图片</dt>
                    <dd>{form.imagesInlineList.length} 张</dd>
                  </div>
                  <div>
                    <dt>参考信息</dt>
                    <dd>{referenceLabels || '未选择'}</dd>
                  </div>
                  <div>
                    <dt>评论</dt>
                    <dd>
                      {form.comment === 'open' ? '开放评论' : '仅粉丝评论'}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className='publish-control-card' aria-label='发布控制'>
                <div className='summary-heading'>
                  <CheckCircle2 size={18} aria-hidden='true' />
                  <h2>发布控制</h2>
                </div>
                <div className='generation-status' aria-live='polite'>
                  {isGenerating ? (
                    <Loader2 className='spin' size={18} aria-hidden='true' />
                  ) : null}
                  <span>{statusText}</span>
                </div>
                <div className='form-actions'>
                  <button
                    className='button ghost interactive'
                    type='button'
                    onClick={handleReset}
                  >
                    <RotateCcw size={17} aria-hidden='true' />
                    重置
                  </button>
                  <button
                    className='button primary publish-submit interactive'
                    type='submit'
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className='spin' size={17} aria-hidden='true' />
                    ) : (
                      <Sparkles size={17} aria-hidden='true' />
                    )}
                    {isGenerating ? '生成中...' : '生成发布任务'}
                  </button>
                </div>
              </section>
            </aside>
          </div>

          {errors.length ? (
            <div className='form-errors' role='alert'>
              {errors.map(error => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </form>
      </section>
    </>
  );
}