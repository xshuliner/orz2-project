import type {
  OfficialCommentConfig,
  OfficialImageConfig,
  OfficialImageSourceType,
  OfficialPublisherMode,
  OfficialPublisherProvider,
} from '@/api';
import {
  defaultForm,
  defaultRewriteRequirement,
  officialPublisherModes,
  officialPublisherProviders,
} from '@/pages/Tools/ToolOfficialPublisher/config';
import type {
  CompletionItem,
  PublisherCopy,
  WechatPublisherForm,
} from '@/pages/Tools/ToolOfficialPublisher/types';

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

export function normalizeForm(input: unknown): WechatPublisherForm {
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

export function getCompletionItems(
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

export function getValidationErrors(
  form: WechatPublisherForm,
  copy: PublisherCopy
) {
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
