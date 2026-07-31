import type {
  ArticlePublisherMode,
  ArticlePublisherProvider,
  OfficialCommentConfig,
  OfficialImageSourceType,
  PostCreateArticleForLLMBody,
} from '@/api';
import {
  articlePublisherModes,
  articlePublisherProviders,
  defaultPromptTemplateId,
  defaultPublisherForm,
  defaultSimpleInlineImageCount,
  promptTemplateConfigs,
  type PromptTemplate,
  type PromptTemplateId,
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

function normalizePromptTemplateId(value: unknown): PromptTemplateId {
  return promptTemplateConfigs.some(config => config.id === value)
    ? (value as PromptTemplateId)
    : defaultPromptTemplateId;
}

export function normalizeForm(
  input: unknown,
  defaultRewriteRequirement: string
): ArticlePublisherForm {
  const source = asRecord(input);
  const rawAi = asRecord(source.ai);
  const rawModeSettings = asRecord(source.modeSettings);
  const legacyEditorModes = asRecord(source.editorModes);
  const inlineList = Array.isArray(source.imagesInlineList)
    ? source.imagesInlineList
    : [];

  function normalizeModeSetting(mode: ArticlePublisherMode) {
    const rawSetting = asRecord(rawModeSettings[mode]);
    return {
      isCustomizationOpen: normalizeCustomizationOpen(
        rawSetting.isCustomizationOpen ??
          rawSetting.editorMode ??
          legacyEditorModes[mode] ??
          source.editorMode ??
          source.experienceMode
      ),
      templateId: normalizePromptTemplateId(
        rawSetting.templateId ?? source.selectedTemplateId
      ),
    } satisfies PublisherModeSetting;
  }

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

  return {
    publishMode: normalizeArticlePublisherMode(
      source.publishMode ?? source.mode ?? source.scene
    ),
    modeSettings: {
      create: normalizeModeSetting('create'),
      rewrite: normalizeModeSetting('rewrite'),
    },
    appId: readString(source.appId),
    appSecret: readString(source.appSecret),
    finalReportEmails: readEmailInput(source.finalReportEmails),
    deliveryChannels: {
      // Older saved forms did not store explicit channel choices. Infer them
      // from the values they already contain so restoring a form stays safe.
      wechat:
        typeof asRecord(source.deliveryChannels).wechat === 'boolean'
          ? Boolean(asRecord(source.deliveryChannels).wechat)
          : hasText(readString(source.appId)) ||
            hasText(readString(source.appSecret)),
      email:
        typeof asRecord(source.deliveryChannels).email === 'boolean'
          ? Boolean(asRecord(source.deliveryChannels).email)
          : Boolean(readEmailInput(source.finalReportEmails).trim()),
    },
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
    imagesInlineList: inlineList.slice(0, 9).map(item => {
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  template: PromptTemplate,
  inlineImageCount = defaultSimpleInlineImageCount
): Pick<
  ArticlePublisherForm,
  'promptSystem' | 'promptContent' | 'imageCover' | 'imagesInlineList'
> {
  return {
    promptSystem: template.fields.promptSystem,
    promptContent: template.fields.promptContent,
    imageCover: { type: 'ai', value: template.fields.coverValue },
    imagesInlineList: template.fields.inlineValueList
      .slice(0, Math.max(0, Math.min(inlineImageCount, 9)))
      .map(value => ({ type: 'ai', value })),
  };
}

export function hasTemplateCustomizations(
  form: ArticlePublisherForm,
  template?: PromptTemplate
) {
  if (!template) return false;
  const hasConfiguredContent =
    hasText(form.promptSystem) ||
    hasText(form.promptContent) ||
    hasText(form.imageCover.value) ||
    form.imagesInlineList.some(item => hasText(item.value));
  if (!hasConfiguredContent) return false;
  const templateContent = getTemplateContent(template);
  return (
    form.promptSystem !== templateContent.promptSystem ||
    form.promptContent !== templateContent.promptContent ||
    form.imageCover.type !== templateContent.imageCover.type ||
    form.imageCover.value !== templateContent.imageCover.value ||
    form.imagesInlineList.length !== templateContent.imagesInlineList.length ||
    form.imagesInlineList.some(
      (item, index) =>
        item.type !== templateContent.imagesInlineList[index]?.type ||
        item.value !== templateContent.imagesInlineList[index]?.value
    )
  );
}

export function getCompletionItems(
  form: ArticlePublisherForm,
  copy: PublisherCopy,
  selectedTemplate?: PromptTemplate
): CompletionItem[] {
  const hasCustomizations = hasTemplateCustomizations(form, selectedTemplate);
  const hasAppId = hasText(form.appId);
  const hasAppSecret = hasText(form.appSecret);
  const items: CompletionItem[] = [
    {
      label: copy.completion.delivery,
      done:
        (form.deliveryChannels.wechat || form.deliveryChannels.email) &&
        (!form.deliveryChannels.wechat || (hasAppId && hasAppSecret)) &&
        (!form.deliveryChannels.email ||
          getFinalReportEmails(form.finalReportEmails).length > 0),
    },
  ];

  if (form.publishMode === 'rewrite') {
    items.push({
      label: copy.completion.rewriteSource,
      done:
        hasText(form.sourceArticleUrl) &&
        isWechatArticleUrl(form.sourceArticleUrl),
    });
  }

  if (!hasCustomizations) {
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
  selectedTemplate?: PromptTemplate
) {
  const nextErrors: string[] = [];
  const hasCustomizations = hasTemplateCustomizations(form, selectedTemplate);

  const hasAppId = hasText(form.appId);
  const hasAppSecret = hasText(form.appSecret);
  const finalReportEmails = getFinalReportEmails(form.finalReportEmails);
  if (!form.deliveryChannels.wechat && !form.deliveryChannels.email) {
    nextErrors.push(copy.validation.delivery);
  }
  if (form.deliveryChannels.wechat && hasAppId !== hasAppSecret) {
    nextErrors.push(
      hasAppId ? copy.validation.appSecret : copy.validation.appId
    );
  }
  if (form.deliveryChannels.wechat && !hasAppId && !hasAppSecret) {
    nextErrors.push(copy.validation.appId, copy.validation.appSecret);
  }
  if (form.deliveryChannels.email && !finalReportEmails.length) {
    nextErrors.push(copy.validation.finalReportEmails);
  }
  if (
    form.deliveryChannels.email &&
    finalReportEmails.some(email => !isValidEmail(email))
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
    if (hasCustomizations && !hasText(form.rewriteRequirement)) {
      nextErrors.push(copy.validation.rewriteRequirement);
    }
  }

  if (!hasCustomizations) {
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
  form.imagesInlineList.forEach((item, index) => {
    if (!item.type) {
      nextErrors.push(
        `${copy.validation.inlineTypePrefix} ${index + 1} ${copy.validation.inlineTypeSuffix}`
      );
    }
    if (!hasText(item.value)) {
      nextErrors.push(
        `${copy.validation.inlineTypePrefix} ${index + 1} ${copy.validation.inlineValueSuffix}`
      );
    }
  });

  return nextErrors;
}

export function buildPublisherRequestBody(
  form: ArticlePublisherForm,
  selectedTemplate: PromptTemplate,
  defaultRewriteRequirement: string
): PostCreateArticleForLLMBody {
  const hasCustomizations = hasTemplateCustomizations(form, selectedTemplate);
  const content = hasCustomizations
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
    imagesInlineList: content.imagesInlineList.map(item => ({
      type: item.type,
      value: item.value.trim(),
    })),
  };

  const appId = form.appId.trim();
  const appSecret = form.appSecret.trim();
  if (form.deliveryChannels.wechat && appId && appSecret) {
    body.appId = appId;
    body.appSecret = appSecret;
    body.articleType = 'news';
  }

  const finalReportEmails = getFinalReportEmails(form.finalReportEmails);
  if (form.deliveryChannels.email && finalReportEmails.length) {
    body.finalReportEmails = finalReportEmails;
  }

  const author = form.author.trim();
  if (author) body.author = author;
  // Digest is intentionally omitted so the publishing service generates it
  // from the final article with the LLM instead of trusting stale user input.

  if (form.publishMode === 'rewrite') {
    body.sourceArticleUrl = form.sourceArticleUrl.trim();
    body.rewriteRequirement = (
      !hasCustomizations ? defaultRewriteRequirement : form.rewriteRequirement
    ).trim();
    body.inlineImageCount = content.imagesInlineList.length;
  }

  return body;
}
