import managerFetch, { type FetchResponse } from '@/utils/manager/fetch';
import md5 from 'blueimp-md5';
import type {
  MemberInfo,
  MemberListPageBody,
  MemberSummaryBody,
  OfficialDraftResult,
  OfficialPublisherProgressEvent,
  PostOfficialPublisherBody,
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
  refreshToken?: string;
  timer?: number;
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
      brand: 'zero',
    },
  });
};

/**
 * Query user profile.
 * @returns Promise
 */
export const getQueryMemberInfo = async (): Promise<
  FetchResponse<LegacyApiPayload<MemberInfoBody>>
> => {
  return managerFetch.request({
    method: 'GET',
    url: '/smart/v1/member/getQueryMemberInfo',
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

// ===== Official publisher APIs =====

/**
 * Call the backend endpoint that generates and creates a WeChat draft.
 * Backend route: POST /smart/v1/official/postOfficialPublisher
 */
export async function postOfficialPublisher(
  body: PostOfficialPublisherBody
): Promise<OfficialDraftResult | null> {
  const response = await managerFetch.request<
    LegacyApiPayload<OfficialDraftResult | null>
  >({
    method: 'POST',
    url: '/smart/v1/official/postOfficialPublisher',
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

interface PostOfficialPublisherStreamOptions {
  signal?: AbortSignal;
  onConnected?: (event: OfficialPublisherProgressEvent) => void;
  onProgress?: (event: OfficialPublisherProgressEvent) => void;
}

interface OfficialPublisherStreamPayload {
  code?: number;
  body?: OfficialDraftResult | null;
  message?: string;
  content?: string;
}

function getPublisherError(payload: OfficialPublisherStreamPayload) {
  return (
    payload.message || payload.content || 'Publishing task submission failed'
  );
}

function parsePublisherStreamPayload(
  rawData: string
): OfficialPublisherStreamPayload {
  try {
    return JSON.parse(rawData) as OfficialPublisherStreamPayload;
  } catch {
    throw new Error('Publishing progress payload parse failed');
  }
}

/**
 * Generate a WeChat draft over SSE.
 * EventSource cannot send a POST body, so fetch reads text/event-stream.
 */
export async function streamPostOfficialPublisher(
  body: PostOfficialPublisherBody,
  options: PostOfficialPublisherStreamOptions = {}
): Promise<OfficialDraftResult | null> {
  const response = await managerFetch.requestStream({
    method: 'POST',
    url: '/smart/v1/official/postOfficialPublisher',
    query: { stream: true },
    body,
    header: { Accept: 'text/event-stream' },
    signal: options.signal,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      message?: string;
      content?: string;
    };
    throw new Error(getPublisherError(payload));
  }

  if (!response.body) {
    throw new Error('This browser cannot read live publishing progress');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let isCompleted = false;
  let result: OfficialDraftResult | null = null;

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
      options.onConnected?.(payload as OfficialPublisherProgressEvent);
    } else if (eventName === 'progress') {
      options.onProgress?.(payload as OfficialPublisherProgressEvent);
    } else if (eventName === 'complete') {
      if (payload.code !== 200) throw new Error(getPublisherError(payload));
      isCompleted = true;
      result = payload.body ?? null;
    } else if (eventName === 'error') {
      throw new Error(getPublisherError(payload));
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n');
    let boundary = buffer.indexOf('\n\n');
    while (boundary >= 0) {
      processFrame(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf('\n\n');
    }
    if (done) break;
  }

  if (buffer.trim()) processFrame(buffer);
  if (!isCompleted) {
    throw new Error('Live publishing connection ended unexpectedly');
  }
  return result;
}
