import type {
  OfficialCommentConfig,
  OfficialImageSourceType,
  OfficialPublisherMode,
  OfficialPublisherProvider,
  PostOfficialPublisherBody,
} from '@/api';
import {
  defaultForm,
  defaultPromptTemplateId,
  defaultSimpleInlineImageCount,
  officialPublisherModes,
  officialPublisherProviders,
  promptTemplateConfigs,
  type PromptTemplate,
  type PromptTemplateId,
} from '@/pages/Tools/ToolOfficialPublisher/config';
import type {
  CompletionItem,
  PublisherCopy,
  PublisherModeSetting,
  WechatPublisherForm,
} from '@/pages/Tools/ToolOfficialPublisher/types';

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value
    ? (value as Record<string, unknown>)
    : {};
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
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
    : 'MINIMAX';
}

function normalizeOfficialPublisherMode(value: unknown): OfficialPublisherMode {
  const normalized =
    typeof value === 'string' ? value.trim().toLowerCase() : '';
  return officialPublisherModes.includes(normalized as OfficialPublisherMode)
    ? (normalized as OfficialPublisherMode)
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
): WechatPublisherForm {
  const source = asRecord(input);
  const rawAi = asRecord(source.ai);
  const rawModeSettings = asRecord(source.modeSettings);
  const legacyEditorModes = asRecord(source.editorModes);
  const inlineList = Array.isArray(source.imagesInlineList)
    ? source.imagesInlineList
    : [];

  function normalizeModeSetting(mode: OfficialPublisherMode) {
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

  const rewriteRequirement = readString(source.rewriteRequirement);

  return {
    publishMode: normalizeOfficialPublisherMode(
      source.publishMode ?? source.mode ?? source.scene
    ),
    modeSettings: {
      create: normalizeModeSetting('create'),
      rewrite: normalizeModeSetting('rewrite'),
    },
    appId: readString(source.appId),
    appSecret: readString(source.appSecret),
    provider: normalizeOfficialPublisherProvider(
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

export function getActiveModeSetting(form: WechatPublisherForm) {
  return form.modeSettings[form.publishMode];
}

export function getTemplateContent(
  template: PromptTemplate,
  inlineImageCount = defaultSimpleInlineImageCount
): Pick<
  WechatPublisherForm,
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
  form: WechatPublisherForm,
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
  form: WechatPublisherForm,
  copy: PublisherCopy,
  selectedTemplate?: PromptTemplate
): CompletionItem[] {
  const hasCustomizations = hasTemplateCustomizations(form, selectedTemplate);
  const items: CompletionItem[] = [
    {
      label: copy.completion.account,
      done:
        hasText(form.appId) &&
        hasText(form.appSecret) &&
        Boolean(form.provider),
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
  form: WechatPublisherForm,
  copy: PublisherCopy,
  selectedTemplate?: PromptTemplate
) {
  const nextErrors: string[] = [];
  const hasCustomizations = hasTemplateCustomizations(form, selectedTemplate);

  if (!hasText(form.appId)) nextErrors.push(copy.validation.appId);
  if (!hasText(form.appSecret)) nextErrors.push(copy.validation.appSecret);
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
  form: WechatPublisherForm,
  selectedTemplate: PromptTemplate,
  defaultRewriteRequirement: string
): PostOfficialPublisherBody {
  const hasCustomizations = hasTemplateCustomizations(form, selectedTemplate);
  const content = hasCustomizations
    ? form
    : getTemplateContent(selectedTemplate);
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
