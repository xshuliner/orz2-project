import managerFetch, { type FetchResponse } from '@/utils/manager/fetch';
import md5 from 'blueimp-md5';
import type {
  ArticleInfo,
  ArticleListPage,
  ArticlePublisherProgressEvent,
  ArticleTemplate,
  ArticleTemplateState,
  CreateArticleForLLMResult,
  CreateArticleForLLMStatusResult,
  MemberInfo,
  MemberListPageBody,
  MemberSummaryBody,
  OfficialImageConfig,
  PostCreateArticleForLLMBody,
  PostPolishContentBody,
  PostPolishContentResult,
  StoryListResult,
  TinifyImageResult,
} from './orz2.modal';

const TINIFY_IMAGE_API_PATH = '/smart/v1/tool/postTinifyImage';
const TINIFY_IMAGE_SIGN_PATH = TINIFY_IMAGE_API_PATH;

/**
 * Query QR-code login status.
 * @param params.uuid.required QR-code UUID.
 * @returns Promise
 */
interface LegacyApiPayload<TBody> {
  code?: number;
  body?: TBody;
  content?: string;
  message?: string;
}

interface MiniCodeLoginStatus {
  _id?: string;
  refreshToken?: string;
  status?: 'confirmed' | 'pending';
  token?: string;
}

interface MiniCodeLoginQrCode {
  data?: unknown;
}

interface MiniCodeLoginQrCodeBody {
  data?: MiniCodeLoginQrCode;
  uuid?: string;
}

export interface AuthMemberInfo {
  _id?: string;
  identity_email?: string;
  identity_username?: string;
  sys_thirdId?: string;
  user_avatarUrl?: string;
  user_nickName?: string;
  user_gender?: number;
  user_province?: string;
  user_province_code?: string;
  user_city?: string;
  user_city_code?: string;
  user_area?: string;
  user_area_code?: string;
  user_title?: string;
  user_level?: number;
  user_exp?: number;
  user_score?: number;
}

interface MemberInfoBody {
  memberInfo?: AuthMemberInfo;
}

export const getQueryMiniCodeLogin = async (params: {
  uuid: string;
}): Promise<FetchResponse<LegacyApiPayload<MiniCodeLoginStatus>>> => {
  const query = {
    uuid: params.uuid,
  };

  return await managerFetch.request({
    method: 'GET',
    url: '/smart/v1/minicode/getQueryMiniCodeLogin',
    query,
  });
};

/**
 * Create QR-code login.
 * @returns Promise
 */
export const postCreateMiniCodeLogin = async (): Promise<
  FetchResponse<LegacyApiPayload<MiniCodeLoginQrCodeBody>>
> => {
  return managerFetch.request({
    method: 'POST',
    url: '/smart/v1/minicode/postCreateMiniCodeLogin',
    body: {
      page: 'LG',
      third: 'O2',
    },
  });
};

/**
 * Query user profile.
 * @returns Promise
 */
export const getQueryMemberInfo = async (
  token?: string
): Promise<FetchResponse<LegacyApiPayload<MemberInfoBody>>> => {
  return managerFetch.request({
    method: 'GET',
    url: '/smart/v1/member/getQueryMemberInfo',
    header: token ? { authorization: `Bearer ${token}` } : undefined,
  });
};

export interface UpdateMemberInfoParams {
  avatarUrl: string;
  nickName: string;
  gender: number;
  province: string;
  provinceCode: string;
  city: string;
  cityCode: string;
  area: string;
  areaCode: string;
  title: string;
}

export interface ScoreRecord {
  _id: string;
  sys_createTime: string;
  type: string;
  scoreOperation: number;
  scoreBalance: number;
}

interface ScoreListBody {
  pageNum: number;
  pageSize: number;
  totalCount: number;
  list: ScoreRecord[];
}

export const postUpdateMemberInfo = async (params: UpdateMemberInfoParams) =>
  managerFetch.request<LegacyApiPayload<MemberInfoBody>>({
    method: 'POST',
    url: '/smart/v1/member/postUpdateMemberInfo',
    body: { ...params },
  });

export const postUploadMemberAvatar = async (params: {
  file: Blob;
  filename: string;
}) =>
  managerFetch.upload<LegacyApiPayload<string>>({
    method: 'POST',
    url: '/smart/v1/member/postUploadMemberAvatar',
    file: {
      blob: params.file,
      fieldName: 'file',
      filename: params.filename,
    },
  });

export const getQueryScoreList = async (params: {
  pageNum: number;
  pageSize: number;
}) =>
  managerFetch.request<LegacyApiPayload<ScoreListBody>>({
    method: 'GET',
    url: '/smart/v1/score/getQueryScoreList',
    query: params,
  });

/**
 * Password login.
 * @param params.username.required Username.
 * @param params.password.required Password.
 * @returns Promise<memberInfo, token>
 */
export const postLoginMemberInfoForPassword = async (params: {
  username: string;
  password: string;
}): Promise<FetchResponse<LegacyApiPayload<MemberInfoBody>>> => {
  const body = {
    username: params.username,
    password: md5(params.password),
  };

  return managerFetch.request({
    method: 'POST',
    url: '/smart/v1/member/postLoginMemberInfoForPassword',
    body,
  });
};

// ===== Silicon APIs =====

/** Query member summary. */
export async function getMemberSummary(): Promise<MemberSummaryBody | null> {
  const response = await managerFetch.request<
    LegacyApiPayload<MemberSummaryBody | null>
  >({
    method: 'GET',
    url: '/smart/v1/member/getQueryMemberSummaryForSilicon',
  });
  const data = response.data;
  if (data?.code === 200 && data?.body) {
    return data.body;
  }
  return null;
}

/** Query paginated members. */
export async function getMemberList(params: {
  pageNum: number;
  pageSize: number;
}): Promise<MemberListPageBody> {
  const response = await managerFetch.request<
    LegacyApiPayload<MemberListPageBody>
  >({
    method: 'GET',
    url: '/smart/v1/member/getQueryMemberListForSilicon',
    query: params,
  });
  const data = response.data;
  if (data?.code === 200 && data?.body) {
    return data.body;
  }
  throw new Error('Member list failed to load');
}

/** Query member detail by either id or token. */
export async function getMemberInfo(params: {
  id?: string;
  token?: string;
}): Promise<MemberInfo | null> {
  const { id, token } = params;
  const query =
    id != null && id !== ''
      ? { id }
      : token != null && token !== ''
        ? { token }
        : null;
  if (!query) return null;
  const response = await managerFetch.request<
    LegacyApiPayload<{ memberInfo?: MemberInfo | null } | null>
  >({
    method: 'GET',
    url: '/smart/v1/member/getQueryMemberInfoForSilicon',
    query,
  });
  const data = response.data;
  if (data?.code === 200 && data?.body?.memberInfo) {
    return data.body.memberInfo;
  }
  return null;
}

/** Query story list, optionally scoped to one member. */
export async function getStoryList(options: {
  pageNum?: number;
  pageSize?: number;
  memberId?: string;
}): Promise<StoryListResult> {
  const { pageNum = 0, pageSize = 15, memberId } = options;
  const response = await managerFetch.request<
    LegacyApiPayload<{
      pageNum: number;
      pageSize: number;
      totalCount: number;
      list: import('./orz2.modal').StoryItem[];
    }>
  >({
    method: 'GET',
    url: '/smart/v1/story/getQueryStoryListForSilicon',
    query: { pageNum, pageSize, ...(memberId ? { memberId } : {}) },
  });
  const data = response.data;
  if (data?.code === 200 && data?.body) {
    return {
      list: data.body.list ?? [],
      pageNum: data.body.pageNum,
      pageSize: data.body.pageSize,
      totalCount: data.body.totalCount ?? 0,
    };
  }
  return { list: [], pageNum, pageSize, totalCount: 0 };
}

/** Submit nickname and create a Silicon landing link. */
export async function postLoginMemberInfo(nickName: string): Promise<{
  storyInfo?: import('./orz2.modal').StoryItem;
  memberInfo?: MemberInfo;
} | null> {
  const response = await managerFetch.request<
    LegacyApiPayload<{
      storyInfo?: import('./orz2.modal').StoryItem;
      memberInfo?: MemberInfo;
    } | null>
  >({
    method: 'POST',
    url: '/smart/v1/member/postLoginMemberInfoForSilicon',
    body: { nickName },
    header: { mode: 'human' },
  });
  const data = response.data;
  if (data?.code === 200 && data?.body) {
    return data.body;
  }
  return null;
}

export default {
  getQueryMiniCodeLogin,
  postCreateMiniCodeLogin,
  getQueryMemberInfo,
  getQueryScoreList,
  postLoginMemberInfoForPassword,
  postUpdateMemberInfo,
  postUploadMemberAvatar,
  postPolishContent,
  postTinifyImage,
};

// ===== Tool APIs =====

/**
 * Call the backend Tinify compression endpoint.
 * Backend route: POST /smart/v1/tool/postTinifyImage
 * Content type: multipart/form-data, file field name: image.
 */
export async function postTinifyImage(params: {
  image: Blob;
  filename: string;
}): Promise<TinifyImageResult> {
  const filename =
    params.filename ||
    (params.image instanceof File ? params.image.name : '') ||
    'image.png';
  const uploadFile =
    params.image instanceof File
      ? params.image
      : new File([params.image], filename, {
          lastModified: Date.now(),
          type: params.image.type || 'application/octet-stream',
        });
  const response = await managerFetch.upload<{
    code?: number;
    body?: TinifyImageResult | null;
    content?: string;
    message?: string;
  }>({
    file: {
      blob: uploadFile,
      fieldName: 'image',
      filename,
    },
    method: 'POST',
    signPath: TINIFY_IMAGE_SIGN_PATH,
    timeout: 120000,
    url: TINIFY_IMAGE_API_PATH,
  });
  const data = response.data;
  const body = data?.body;

  if (data?.code === 200 && body?.errcode && body.errcode !== 0) {
    throw new Error(
      body.errmsg ||
        data.message ||
        data.content ||
        'TinyPNG compression failed'
    );
  }

  if (data?.code === 200 && body?.data) {
    return body;
  }

  const message =
    data?.message ||
    data?.content ||
    response.error ||
    'TinyPNG compression failed';
  throw new Error(message);
}

// ===== LLM API =====

/**
 * Call the backend AI content-polishing endpoint.
 * Backend route: POST /smart/v1/llm/postPolishContent
 */
export async function postPolishContent(
  body: PostPolishContentBody
): Promise<PostPolishContentResult> {
  const response = await managerFetch.request<
    LegacyApiPayload<PostPolishContentResult | null>
  >({
    method: 'POST',
    url: '/smart/v1/llm/postPolishContent',
    body,
    timeout: 120000,
  });
  const data = response.data;

  if (data?.code === 200 && data?.body?.content) {
    return data.body;
  }

  const message =
    data?.message ||
    data?.content ||
    response.error ||
    'Content polishing failed';
  throw new Error(message);
}

// ===== Article publisher APIs =====

function normalizeArticleTemplate(value: unknown): ArticleTemplate | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const template = value as Record<string, unknown>;
  const payload = template.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }
  const templatePayload = payload as Record<string, unknown>;
  const imageCover = templatePayload.imageCover;
  const imagesInlineList = templatePayload.imagesInlineList;
  if (
    typeof template.id !== 'string' ||
    !template.id ||
    typeof template.label !== 'string' ||
    typeof template.caption !== 'string' ||
    typeof templatePayload.promptSystem !== 'string' ||
    typeof templatePayload.promptContent !== 'string' ||
    !imageCover ||
    typeof imageCover !== 'object' ||
    Array.isArray(imageCover) ||
    !Array.isArray(imagesInlineList)
  ) {
    return null;
  }
  const normalizedCover = normalizeArticleTemplateImage(imageCover);
  const normalizedInlineImages: OfficialImageConfig[] = [];
  for (const image of imagesInlineList) {
    const normalizedImage = normalizeArticleTemplateImage(image);
    if (!normalizedImage) return null;
    normalizedInlineImages.push(normalizedImage);
  }
  if (!normalizedCover) return null;
  return {
    id: template.id,
    label: template.label,
    caption: template.caption,
    payload: {
      promptSystem: templatePayload.promptSystem,
      promptContent: templatePayload.promptContent,
      imageCover: normalizedCover,
      imagesInlineList: normalizedInlineImages,
    },
  };
}

function normalizeArticleTemplateImage(
  value: unknown
): OfficialImageConfig | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const image = value as Record<string, unknown>;
  if (
    (image.type !== 'ai' && image.type !== 'url' && image.type !== 'base64') ||
    typeof image.value !== 'string'
  ) {
    return null;
  }
  return { type: image.type, value: image.value };
}

export function normalizeArticleTemplateState(
  value: unknown
): ArticleTemplateState | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const templateState = value as Record<string, unknown>;
  if (
    templateState.schemaVersion !== 1 ||
    typeof templateState.defaultTemplateId !== 'string' ||
    !Array.isArray(templateState.templates)
  ) {
    return null;
  }
  const templates = templateState.templates.map(normalizeArticleTemplate);
  if (templates.some(template => !template)) return null;
  const normalizedTemplates = templates as ArticleTemplate[];
  if (
    new Set(normalizedTemplates.map(template => template.id)).size !==
    normalizedTemplates.length
  ) {
    return null;
  }
  return {
    schemaVersion: 1,
    defaultTemplateId: templateState.defaultTemplateId,
    templates: normalizedTemplates,
  };
}

/** Query the server-maintained article templates without requiring login. */
export async function getQueryArticleTemplates(
  options: {
    signal?: AbortSignal;
  } = {}
): Promise<ArticleTemplateState> {
  const response = await managerFetch.request<LegacyApiPayload<unknown>>({
    method: 'GET',
    url: '/smart/v1/article/getQueryArticleTemplates',
    signal: options.signal,
  });
  const data = response.data;
  if (response.statusCode !== 200 || data?.code !== 200) {
    throw new Error(
      data?.message ||
        data?.content ||
        response.error ||
        'Article template request failed'
    );
  }
  const body = data.body as Record<string, unknown> | null | undefined;
  if (body?.schemaVersion !== 1) {
    throw new Error('Article template schema is unsupported');
  }
  const templateState = normalizeArticleTemplateState(body);
  if (!templateState) throw new Error('Article template response is invalid');
  return templateState;
}

/**
 * Generate and persist an article. A WeChat draft or report email is created
 * only when the matching optional request fields are present.
 * Backend route: POST /smart/v1/article/postCreateArticleForLLM
 */
export async function postCreateArticleForLLM(
  body: PostCreateArticleForLLMBody
): Promise<CreateArticleForLLMResult | null> {
  const response = await managerFetch.request<
    LegacyApiPayload<CreateArticleForLLMResult | null>
  >({
    method: 'POST',
    url: '/smart/v1/article/postCreateArticleForLLM',
    body,
    timeout: 600000,
  });
  const data = response.data;
  if (data?.code === 200 && data?.body) {
    return data.body;
  }
  const message =
    data?.message ||
    data?.content ||
    response.error ||
    'Publishing task submission failed';
  throw new Error(message);
}

/** Query the current member's saved article feed. */
export async function getQueryArticleList(
  options: {
    pageNum?: number;
    pageSize?: number;
    mode?: 'subscriber';
    signal?: AbortSignal;
  } = {}
): Promise<ArticleListPage> {
  const { pageNum = 0, pageSize = 15, mode = 'subscriber', signal } = options;
  const response = await managerFetch.request<
    LegacyApiPayload<ArticleListPage>
  >({
    method: 'GET',
    url: '/smart/v1/article/getQueryArticleList',
    query: { mode, pageNum, pageSize },
    signal,
  });
  const data = response.data;
  if (response.statusCode !== 200 || data?.code !== 200) {
    throw new Error(
      data?.message ||
        data?.content ||
        response.error ||
        'Article list request failed'
    );
  }
  const body = response.data?.body;
  if (
    !body ||
    !Array.isArray(body.list) ||
    !Number.isInteger(body.pageNum) ||
    !Number.isInteger(body.pageSize) ||
    !Number.isInteger(body.totalCount) ||
    body.pageNum < 0 ||
    body.pageSize < 1 ||
    body.totalCount < 0
  ) {
    throw new Error('Article list response is invalid');
  }
  return {
    list: body.list.filter((article): article is ArticleInfo =>
      Boolean(
        article &&
        typeof article === 'object' &&
        typeof article._id === 'string' &&
        article._id
      )
    ),
    pageNum: body.pageNum,
    pageSize: body.pageSize,
    totalCount: body.totalCount,
  };
}

/** Query one saved article by its record id. */
export async function getQueryArticleInfo(
  id: string,
  options: { signal?: AbortSignal } = {}
): Promise<ArticleInfo | null> {
  if (!id) return null;
  const response = await managerFetch.request<LegacyApiPayload<ArticleInfo[]>>({
    method: 'GET',
    url: '/smart/v1/article/getQueryArticleInfo',
    query: { id },
    signal: options.signal,
  });
  const data = response.data;
  if (response.statusCode !== 200 || data?.code !== 200) {
    throw new Error(
      data?.message ||
        data?.content ||
        response.error ||
        'Article detail request failed'
    );
  }
  if (!Array.isArray(data.body)) {
    throw new Error('Article detail response is invalid');
  }
  const article = data.body[0];
  if (article === undefined) return null;
  if (!article || typeof article._id !== 'string' || !article._id) {
    throw new Error('Article detail response is invalid');
  }
  return article;
}

interface PostCreateArticleForLLMStreamOptions {
  signal?: AbortSignal;
  onConnected?: (event: ArticlePublisherProgressEvent) => void;
  onProgress?: (event: ArticlePublisherProgressEvent) => void;
}

type ArticlePublisherStreamPayload = Partial<ArticlePublisherProgressEvent>;

export class ArticlePublisherStreamError extends Error {
  readonly retryable: boolean;
  readonly terminal: boolean;

  constructor(
    message: string,
    options: { retryable?: boolean; terminal?: boolean } = {}
  ) {
    super(message);
    this.name = 'ArticlePublisherStreamError';
    this.retryable = options.retryable ?? false;
    this.terminal = options.terminal ?? false;
  }
}

function getPublisherError(payload: ArticlePublisherStreamPayload) {
  return (
    payload.message || payload.content || 'Publishing task submission failed'
  );
}

function parsePublisherStreamPayload(
  rawData: string
): ArticlePublisherStreamPayload {
  try {
    const payload: unknown = JSON.parse(rawData);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error();
    }
    return payload as ArticlePublisherStreamPayload;
  } catch {
    throw new ArticlePublisherStreamError(
      'Publishing progress payload parse failed'
    );
  }
}

async function readArticlePublisherStream(
  response: Response,
  options: PostCreateArticleForLLMStreamOptions
): Promise<CreateArticleForLLMStatusResult> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      message?: string;
      content?: string;
    };
    throw new ArticlePublisherStreamError(getPublisherError(payload), {
      retryable:
        response.status === 408 ||
        response.status === 429 ||
        response.status >= 500,
    });
  }

  if (!response.body) {
    throw new ArticlePublisherStreamError(
      'This browser cannot read live publishing progress'
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let streamResult: CreateArticleForLLMStatusResult | null = null;

  function processFrame(frame: string) {
    const lines = frame.split('\n');
    let eventName = 'message';
    const dataLines: string[] = [];

    lines.forEach(line => {
      if (!line || line.startsWith(':')) return;
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    });

    if (!dataLines.length) return;
    const payload = parsePublisherStreamPayload(dataLines.join('\n'));

    if (eventName === 'connected') {
      options.onConnected?.(payload as ArticlePublisherProgressEvent);
    } else if (eventName === 'progress') {
      options.onProgress?.(payload as ArticlePublisherProgressEvent);
    } else if (eventName === 'complete') {
      if (payload.code !== 200) throw new Error(getPublisherError(payload));
      options.onProgress?.(payload as ArticlePublisherProgressEvent);
      streamResult = { status: 'complete', result: payload.body ?? null };
    } else if (eventName === 'not_found') {
      streamResult = { status: 'not_found', result: null };
    } else if (eventName === 'error') {
      throw new ArticlePublisherStreamError(getPublisherError(payload), {
        retryable: payload.retryable,
        terminal: payload.terminal,
      });
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    buffer = (buffer + decoder.decode(value, { stream: !done })).replace(
      /\r\n/g,
      '\n'
    );
    let boundary = buffer.indexOf('\n\n');
    while (boundary >= 0) {
      processFrame(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf('\n\n');
    }
    if (done) break;
  }

  if (buffer.trim()) processFrame(buffer);
  if (!streamResult) {
    throw new ArticlePublisherStreamError(
      'Live publishing connection ended unexpectedly',
      { retryable: true }
    );
  }
  return streamResult;
}

/**
 * Generate and persist an article over SSE.
 * EventSource cannot send a POST body, so fetch reads text/event-stream.
 */
export async function streamPostCreateArticleForLLM(
  body: PostCreateArticleForLLMBody,
  options: PostCreateArticleForLLMStreamOptions = {}
): Promise<CreateArticleForLLMResult | null> {
  const response = await managerFetch.requestStream({
    method: 'POST',
    url: '/smart/v1/article/postCreateArticleForLLM',
    query: { stream: true },
    body,
    header: { Accept: 'text/event-stream' },
    signal: options.signal,
  });
  const streamResult = await readArticlePublisherStream(response, options);
  return streamResult.result;
}

/** Resume a recoverable article publishing task over its signed SSE stream. */
export async function getCreateArticleForLLMStatus(
  createArticleId: string,
  options: PostCreateArticleForLLMStreamOptions = {}
): Promise<CreateArticleForLLMStatusResult> {
  const response = await managerFetch.requestStream({
    method: 'GET',
    url: '/smart/v1/article/getCreateArticleForLLMStatus',
    query: { createArticleId },
    header: { Accept: 'text/event-stream' },
    signal: options.signal,
  });
  return readArticlePublisherStream(response, options);
}
