import type {
  ArticlePublisherMode,
  ArticlePublisherProvider,
  ArticleTemplate,
  ArticleTemplatePayload,
  OfficialCommentConfig,
  OfficialImageConfig,
  OfficialImageSourceType,
  PostCreateArticleForLLMBody,
} from '@/api';
import {
  articlePublisherModes,
  articlePublisherProviders,
  customArticleTemplateId,
  defaultInlineImageCount,
  defaultPublisherForm,
  maxInlineImageCount,
} from '@/pages/Tools/ToolArticlePublisher/config';
import type {
  ArticlePublisherForm,
  CompletionItem,
  PublisherCopy,
  PublisherModeSetting,
} from '@/pages/Tools/ToolArticlePublisher/types';

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value
    ? (value as Record<string, unknown>)
    : {};
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readEmailInput(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((email): email is string => typeof email === 'string')
        .join('\n')
    : readString(value);
}

function normalizeArticlePublisherProvider(
  value: unknown
): ArticlePublisherProvider {
  const normalized =
    typeof value === 'string' ? value.trim().toUpperCase() : '';
  return articlePublisherProviders.includes(
    normalized as ArticlePublisherProvider
  )
    ? (normalized as ArticlePublisherProvider)
    : 'MINIMAX';
}

function normalizeArticlePublisherMode(value: unknown): ArticlePublisherMode {
  const normalized =
    typeof value === 'string' ? value.trim().toLowerCase() : '';
  return articlePublisherModes.includes(normalized as ArticlePublisherMode)
    ? (normalized as ArticlePublisherMode)
    : 'create';
}

function normalizeCustomizationOpen(value: unknown) {
  if (typeof value === 'boolean') return value;
  return typeof value === 'string' && value.trim().toLowerCase() === 'advanced';
}

function normalizeArticleTemplateId(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function normalizeImageConfig(value: unknown) {
  const image = asRecord(value);
  return {
    type: image.type === 'url' || image.type === 'base64' ? image.type : 'ai',
    value: readString(image.value),
  } satisfies OfficialImageConfig;
}

function normalizeTemplatePayload(
  value: unknown
): ArticleTemplatePayload | null {
  const payload = asRecord(value);
  if (!value || !Array.isArray(payload.imagesInlineList)) return null;
  return {
    promptSystem: readString(payload.promptSystem),
    promptContent: readString(payload.promptContent),
    imageCover: normalizeImageConfig(payload.imageCover),
    imagesInlineList: payload.imagesInlineList
      .slice(0, maxInlineImageCount)
      .map(normalizeImageConfig),
  };
}

function normalizeCustomTemplate(
  value: unknown,
  fallbackPayload?: ArticleTemplatePayload | null
): ArticleTemplate | undefined {
  const template = asRecord(value);
  const payload = normalizeTemplatePayload(template.payload) ?? fallbackPayload;
  if (!payload) return undefined;
  const sourceTemplateId = readString(template.sourceTemplateId);
  const updatedAt = Number(template.updatedAt);
  return {
    id: customArticleTemplateId,
    label: readString(template.label),
    caption: readString(template.caption),
    ...(sourceTemplateId ? { sourceTemplateId } : {}),
    ...(Number.isFinite(updatedAt) ? { updatedAt } : {}),
    payload,
  };
}

export function normalizeForm(
  input: unknown,
  defaultRewriteRequirement: string
): ArticlePublisherForm {
  const source = asRecord(input);
  const rawAi = asRecord(source.ai);
  const rawModeSettings = asRecord(source.modeSettings);
  const rawCustomTemplates = asRecord(source.customTemplates);
  const legacyEditorModes = asRecord(source.editorModes);
  const inlineList = Array.isArray(source.imagesInlineList)
    ? source.imagesInlineList
    : [];

  // Backward compatibility for old localStorage shape: imageCoverType + imageCoverValue.
  const legacyImageCoverType = source.imageCoverType as
    | OfficialImageSourceType
    | undefined;
  const rawImageCover = asRecord(source.imageCover);
  const coverType: OfficialImageSourceType =
    rawImageCover.type === 'url' || rawImageCover.type === 'base64'
      ? rawImageCover.type
      : legacyImageCoverType === 'url' || legacyImageCoverType === 'base64'
        ? legacyImageCoverType
        : 'ai';
  const coverValue = readString(
    rawImageCover.value,
    readString(source.imageCoverValue)
  );

  // Backward compatibility for old localStorage shape: comment string flags.
  const rawComment = source.comment as
    | OfficialCommentConfig
    | 'open'
    | 'fansOnly'
    | undefined;
  let comment: OfficialCommentConfig = { ...defaultPublisherForm.comment };
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

  const rewriteRequirement = readString(source.rewriteRequirement);
  const publishMode = normalizeArticlePublisherMode(
    source.publishMode ?? source.mode ?? source.scene
  );
  const storedPayload = normalizeTemplatePayload({
    promptSystem: source.promptSystem,
    promptContent: source.promptContent,
    imageCover: { type: coverType, value: coverValue },
    imagesInlineList: inlineList,
  });

  function normalizeModeSetting(mode: ArticlePublisherMode) {
    const rawSetting = asRecord(rawModeSettings[mode]);
    const isCustomizationOpen = normalizeCustomizationOpen(
      rawSetting.isCustomizationOpen ??
        rawSetting.isAdvanced ??
        rawSetting.editorMode ??
        legacyEditorModes[mode] ??
        source.editorMode ??
        source.experienceMode
    );
    let templateId = normalizeArticleTemplateId(
      rawSetting.templateId ?? source.selectedTemplateId
    );
    const legacyCustomPayload = normalizeTemplatePayload(
      rawCustomTemplates[mode]
    );
    let customTemplate = normalizeCustomTemplate(
      rawSetting.customTemplate,
      legacyCustomPayload
    );
    if (
      !customTemplate &&
      mode === publishMode &&
      isCustomizationOpen &&
      storedPayload &&
      (hasText(storedPayload.promptSystem) ||
        hasText(storedPayload.promptContent) ||
        hasText(storedPayload.imageCover.value))
    ) {
      customTemplate = normalizeCustomTemplate(null, storedPayload);
      templateId = customArticleTemplateId;
    }
    if (
      customTemplate &&
      (templateId === '__custom__' || templateId === customArticleTemplateId)
    ) {
      templateId = customArticleTemplateId;
    }
    return {
      isCustomizationOpen,
      templateId,
      ...(customTemplate ? { customTemplate } : {}),
    } satisfies PublisherModeSetting;
  }

  const form: ArticlePublisherForm = {
    publishMode,
    modeSettings: {
      create: normalizeModeSetting('create'),
      rewrite: normalizeModeSetting('rewrite'),
    },
    deliveryWechat:
      typeof source.deliveryWechat === 'boolean'
        ? source.deliveryWechat
        : hasText(readString(source.appId)) ||
          hasText(readString(source.appSecret)),
    deliveryEmail:
      typeof source.deliveryEmail === 'boolean'
        ? source.deliveryEmail
        : Boolean(readEmailInput(source.finalReportEmails).trim()),
    appId: readString(source.appId),
    appSecret: readString(source.appSecret),
    finalReportEmails: readEmailInput(source.finalReportEmails),
    provider: normalizeArticlePublisherProvider(
      source.provider ?? source.aiProvider ?? rawAi.provider
    ),
    promptSystem: readString(source.promptSystem),
    promptContent: readString(source.promptContent),
    sourceArticleUrl: readString(
      source.sourceArticleUrl,
      readString(source.rewriteHref)
    ),
    rewriteRequirement: rewriteRequirement.trim()
      ? rewriteRequirement
      : defaultRewriteRequirement,
    imageCover: { type: coverType, value: coverValue },
    imagesInlineList: inlineList.slice(0, maxInlineImageCount).map(item => {
      const rawItem = asRecord(item);
      return {
        type:
          rawItem.type === 'url' || rawItem.type === 'base64'
            ? rawItem.type
            : 'ai',
        value: readString(rawItem.value),
      };
    }),
    author: readString(source.author),
    comment,
  };
  return form;
}

export function hasText(value: string) {
  return Boolean(value.trim());
}

export function getFinalReportEmails(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\n,;，；]+/)
        .map(email => email.trim())
        .filter(Boolean)
    )
  );
}

function isValidEmail(value: string) {
  return (
    value.length <= 254 && /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(value)
  );
}

export function isWechatArticleUrl(value: string) {
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

export function getActiveModeSetting(form: ArticlePublisherForm) {
  return form.modeSettings[form.publishMode];
}

export function getTemplateContent(
  template: ArticleTemplate
): Pick<
  ArticlePublisherForm,
  'promptSystem' | 'promptContent' | 'imageCover' | 'imagesInlineList'
> {
  return {
    promptSystem: template.payload.promptSystem,
    promptContent: template.payload.promptContent,
    imageCover: { ...template.payload.imageCover },
    imagesInlineList: template.payload.imagesInlineList
      .slice(
        0,
        template.id === customArticleTemplateId
          ? maxInlineImageCount
          : defaultInlineImageCount
      )
      .map(image => ({ ...image })),
  };
}

export function getTemplatePayloadFromForm(
  form: ArticlePublisherForm
): ArticleTemplatePayload {
  return {
    promptSystem: form.promptSystem,
    promptContent: form.promptContent,
    imageCover: { ...form.imageCover },
    imagesInlineList: form.imagesInlineList.map(image => ({ ...image })),
  };
}

export function getCompletionItems(
  form: ArticlePublisherForm,
  copy: PublisherCopy,
  selectedTemplate?: ArticleTemplate
): CompletionItem[] {
  const isCustomizationOpen = getActiveModeSetting(form).isCustomizationOpen;
  const items: CompletionItem[] = [];

  if (form.publishMode === 'rewrite') {
    items.push({
      label: copy.completion.rewriteSource,
      done:
        hasText(form.sourceArticleUrl) &&
        isWechatArticleUrl(form.sourceArticleUrl),
    });
  }

  if (!isCustomizationOpen) {
    items.push({
      label: copy.completion.template,
      done: Boolean(selectedTemplate),
    });
    return items;
  }

  if (form.publishMode === 'rewrite') {
    items.push({
      label: copy.completion.rewriteRequirement,
      done: hasText(form.rewriteRequirement),
    });
  }

  items.push(
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
    }
  );

  return items;
}

export function getValidationErrors(
  form: ArticlePublisherForm,
  copy: PublisherCopy,
  selectedTemplate?: ArticleTemplate
) {
  const nextErrors: string[] = [];
  const isCustomizationOpen = getActiveModeSetting(form).isCustomizationOpen;

  const hasAppId = hasText(form.appId);
  const hasAppSecret = hasText(form.appSecret);
  const finalReportEmails = getFinalReportEmails(form.finalReportEmails);
  if (form.deliveryWechat && hasAppId !== hasAppSecret) {
    nextErrors.push(
      hasAppId ? copy.validation.appSecret : copy.validation.appId
    );
  }
  if (form.deliveryWechat && !hasAppId && !hasAppSecret) {
    nextErrors.push(copy.validation.appId, copy.validation.appSecret);
  }
  if (
    form.deliveryEmail &&
    (!finalReportEmails.length ||
      finalReportEmails.length > 20 ||
      finalReportEmails.some(email => !isValidEmail(email)))
  ) {
    nextErrors.push(copy.validation.finalReportEmails);
  }
  if (!form.provider) nextErrors.push(copy.validation.provider);
  if (form.publishMode === 'rewrite') {
    if (!hasText(form.sourceArticleUrl)) {
      nextErrors.push(copy.validation.rewriteSourceUrl);
    } else if (!isWechatArticleUrl(form.sourceArticleUrl)) {
      nextErrors.push(copy.validation.rewriteSourceUrlInvalid);
    }
    if (isCustomizationOpen && !hasText(form.rewriteRequirement)) {
      nextErrors.push(copy.validation.rewriteRequirement);
    }
  }

  if (!isCustomizationOpen) {
    if (!selectedTemplate) nextErrors.push(copy.validation.template);
    return nextErrors;
  }

  if (!hasText(form.promptSystem)) {
    nextErrors.push(copy.validation.promptSystem);
  }
  if (!hasText(form.promptContent)) {
    nextErrors.push(copy.validation.promptContent);
  }
  if (!form.imageCover.type) nextErrors.push(copy.validation.coverType);
  if (!hasText(form.imageCover.value)) {
    nextErrors.push(copy.validation.coverValue);
  }
  return nextErrors;
}

export function buildPublisherRequestBody(
  form: ArticlePublisherForm,
  selectedTemplate: ArticleTemplate,
  defaultRewriteRequirement: string
): PostCreateArticleForLLMBody {
  const isCustomizationOpen = getActiveModeSetting(form).isCustomizationOpen;
  const content = isCustomizationOpen
    ? form
    : getTemplateContent(selectedTemplate);
  const body: PostCreateArticleForLLMBody = {
    publishMode: form.publishMode,
    provider: form.provider,
    imageGenerationMode: 'async',
    comment: {
      open: form.comment.open === 1 ? 1 : 0,
      fansOnly: form.comment.fansOnly === 1 ? 1 : 0,
    },
    promptSystem: content.promptSystem.trim(),
    promptContent: content.promptContent.trim(),
    imageCover: {
      type: content.imageCover.type,
      value: content.imageCover.value.trim(),
    },
    imagesInlineList: content.imagesInlineList
      .filter(item => hasText(item.value))
      .map(item => ({
        type: item.type,
        value: item.value.trim(),
      })),
  };

  const appId = form.appId.trim();
  const appSecret = form.appSecret.trim();
  if (form.deliveryWechat && appId && appSecret) {
    body.appId = appId;
    body.appSecret = appSecret;
    body.articleType = 'news';
  }

  const finalReportEmails = getFinalReportEmails(form.finalReportEmails);
  if (form.deliveryEmail && finalReportEmails.length) {
    body.finalReportEmails = finalReportEmails;
  }

  const author = form.author.trim();
  if (author) body.author = author;
  // Digest is intentionally omitted so the publishing service generates it
  // from the final article with the LLM instead of trusting stale user input.

  if (form.publishMode === 'rewrite') {
    body.sourceArticleUrl = form.sourceArticleUrl.trim();
    body.rewriteRequirement = (
      !isCustomizationOpen ? defaultRewriteRequirement : form.rewriteRequirement
    ).trim();
    body.inlineImageCount = content.imagesInlineList.length;
  }

  return body;
}
