import FetchManager from '@/utils/FetchManager';
import axios from 'axios';
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

// ===== API roots and URL constants =====

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://orz2.online/api/smart/v1';

const MEMBER_PREFIX = `${API_BASE_URL}/member`;
const STORY_PREFIX = `${API_BASE_URL}/story`;
const OFFICIAL_PREFIX = `${API_BASE_URL}/official`;
const LLM_PREFIX = `${API_BASE_URL}/llm`;
const TINIFY_IMAGE_API_PATH = '/smart/v1/tool/postTinifyImage';
const TINIFY_IMAGE_SIGN_PATH = `${new URL(API_BASE_URL).pathname}/tool/postTinifyImage`;

export const MEMBER_SUMMARY_API_URL = `${MEMBER_PREFIX}/getQueryMemberSummaryForSilicon`;
export const MEMBER_LIST_API_URL = `${MEMBER_PREFIX}/getQueryMemberListForSilicon`;
export const MEMBER_INFO_API_URL = `${MEMBER_PREFIX}/getQueryMemberInfoForSilicon`;
export const MEMBER_LOGIN_API_URL = `${MEMBER_PREFIX}/postLoginMemberInfoForSilicon`;
export const STORY_LIST_API_URL = `${STORY_PREFIX}/getQueryStoryListForSilicon`;
export const OFFICIAL_PUBLISHER_API_URL = `${OFFICIAL_PREFIX}/postOfficialPublisher`;
export const POLISH_CONTENT_API_URL = `${LLM_PREFIX}/postPolishContent`;

/**
 * Query QR-code login status.
 * @param params.uuid.required QR-code UUID.
 * @returns Promise
 */
export const getQueryMiniCodeLogin = async (params: {
  uuid: string;
}): Promise<any> => {
  const query = {
    uuid: params.uuid,
  };

  return await FetchManager.request({
    method: 'GET',
    url: '/smart/v1/minicode/getQueryMiniCodeLogin',
    query,
  });
};

/**
 * Create QR-code login.
 * @returns Promise
 */
export const postCreateMiniCodeLogin = async (): Promise<any> => {
  return await FetchManager.request({
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
export const getQueryMemberInfo = async (): Promise<any> => {
  return await FetchManager.request({
    method: 'GET',
    url: '/smart/v1/member/getQueryMemberInfo',
  });
};

/**
 * Password login.
 * @param params.username.required Username.
 * @param params.password.required Password.
 * @returns Promise<memberInfo, token>
 */
export const postLoginMemberInfoForPassword = async (params: {
  username: string;
  password: string;
}): Promise<any> => {
  const body = {
    username: params.username,
    password: md5(params.password),
  };

  return await FetchManager.request({
    method: 'POST',
    url: '/smart/v1/member/postLoginMemberInfoForPassword',
    body,
  });
};

// ===== Silicon APIs =====

/** Query member summary. */
export async function getMemberSummary(): Promise<MemberSummaryBody | null> {
  const { data } = await axios.get<{
    code: number;
    body?: MemberSummaryBody | null;
  }>(MEMBER_SUMMARY_API_URL);
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
  const searchParams = new URLSearchParams({
    pageNum: String(params.pageNum),
    pageSize: String(params.pageSize),
  });
  const { data } = await axios.get<{
    code: number;
    body: MemberListPageBody;
  }>(`${MEMBER_LIST_API_URL}?${searchParams.toString()}`);
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
      ? `id=${encodeURIComponent(id)}`
      : token != null && token !== ''
        ? `token=${encodeURIComponent(token)}`
        : null;
  if (!query) return null;
  const { data } = await axios.get<{
    code: number;
    body?: { memberInfo?: MemberInfo | null } | null;
  }>(`${MEMBER_INFO_API_URL}?${query}`);
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
  const params = new URLSearchParams({
    pageNum: String(pageNum),
    pageSize: String(pageSize),
  });
  if (memberId) params.set('memberId', memberId);
  const { data } = await axios.get<{
    code: number;
    body: {
      pageNum: number;
      pageSize: number;
      totalCount: number;
      list: import('./orz2.modal').StoryItem[];
    };
  }>(`${STORY_LIST_API_URL}?${params.toString()}`);
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
  const { data } = await axios.post<{
    code: number;
    body?: {
      storyInfo?: import('./orz2.modal').StoryItem;
      memberInfo?: MemberInfo;
    } | null;
  }>(
    MEMBER_LOGIN_API_URL,
    { nickName },
    {
      headers: {
        mode: 'human',
      },
    }
  );
  if (data?.code === 200 && data?.body) {
    return data.body;
  }
  return null;
}

export default {
  getQueryMiniCodeLogin,
  postCreateMiniCodeLogin,
  getQueryMemberInfo,
  postLoginMemberInfoForPassword,
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
  const response = await FetchManager.upload({
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
  const data = response.data as {
    code?: number;
    body?: TinifyImageResult | null;
    message?: string;
    content?: string;
  };
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
  const { data } = await axios.post<{
    code?: number;
    body?: PostPolishContentResult | null;
    message?: string;
    content?: string;
  }>(POLISH_CONTENT_API_URL, body, {
    headers: {
      brand: 'orz2',
      platform: 'WEB',
    },
    timeout: 120000,
  });

  if (data?.code === 200 && data?.body?.content) {
    return data.body;
  }

  const message = data?.message || data?.content || 'Content polishing failed';
  throw new Error(message);
}

// ===== Official publisher APIs =====

/**
 * Call the backend endpoint that generates and creates a WeChat draft.
 * Backend route: POST /smart/v1/official/postOfficialPublisher
 * Backend headers accept brand=zero|weather|carbon and platform=WEAPP|WEB|OTHER.
 * This caller overrides them with brand='orz2' and platform='WEB'.
 */
export async function postOfficialPublisher(
  body: PostOfficialPublisherBody
): Promise<OfficialDraftResult | null> {
  const { data } = await axios.post<{
    code?: number;
    body?: OfficialDraftResult | null;
    message?: string;
    content?: string;
  }>(OFFICIAL_PUBLISHER_API_URL, body, {
    headers: {
      brand: 'orz2',
      platform: 'WEB',
    },
    timeout: 600000,
  });
  if (data?.code === 200 && data?.body) {
    return data.body;
  }
  const message =
    data?.message || data?.content || 'Publishing task submission failed';
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
  const response = await fetch(`${OFFICIAL_PUBLISHER_API_URL}?stream=true`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      brand: 'orz2',
      platform: 'WEB',
    },
    body: JSON.stringify(body),
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
