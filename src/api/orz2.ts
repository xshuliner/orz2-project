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
  StoryListResult,
} from './orz2.modal';

// ===== API 根路径 & URL 常量 =====

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://www.orz2.online/api/smart/v1';

const MEMBER_PREFIX = `${API_BASE_URL}/member`;
const STORY_PREFIX = `${API_BASE_URL}/story`;
const OFFICIAL_PREFIX = `${API_BASE_URL}/official`;

export const MEMBER_SUMMARY_API_URL = `${MEMBER_PREFIX}/getQueryMemberSummaryForSilicon`;
export const MEMBER_LIST_API_URL = `${MEMBER_PREFIX}/getQueryMemberListForSilicon`;
export const MEMBER_INFO_API_URL = `${MEMBER_PREFIX}/getQueryMemberInfoForSilicon`;
export const MEMBER_LOGIN_API_URL = `${MEMBER_PREFIX}/postLoginMemberInfoForSilicon`;
export const STORY_LIST_API_URL = `${STORY_PREFIX}/getQueryStoryListForSilicon`;
export const OFFICIAL_PUBLISHER_API_URL = `${OFFICIAL_PREFIX}/postOfficialPublisher`;

/**
 * 查询二维码登录状态
 * @param params.uuid.required 二维码UUID
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
 * 创建二维码登录
 * @returns Promise
 */
export const postCreateMiniCodeLogin = async (): Promise<any> => {
  return await FetchManager.request({
    method: 'POST',
    url: '/smart/v1/minicode/postCreateMiniCodeLogin',
    body: {
      page: 'LG',
      third: 'LN',
      brand: 'zero',
    },
  });
};

/**
 * 查询用户信息
 * @returns Promise
 */
export const getQueryMemberInfo = async (): Promise<any> => {
  return await FetchManager.request({
    method: 'GET',
    url: '/smart/v1/member/getQueryMemberInfo',
  });
};

/**
 * 登录函数
 * @param params.username.required 用户名
 * @param params.password.required 密码
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

// ===== Silicon API 函数 =====

/** 获取成员汇总信息 */
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

/** 获取成员分页列表 */
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
  throw new Error('成员列表加载失败');
}

/** 获取成员详情（支持 id 或 token 二选一） */
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

/** 获取故事列表（支持可选 memberId 分页） */
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

/** 提交昵称，获取下山链接 */
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
};

// ===== 公众号发布 API =====

/**
 * 调用后端生成微信公众号草稿并创建草稿。
 * 后端路由：POST /smart/v1/official/postOfficialPublisher
 * 后端 header 要求 brand=zero|weather|carbon、platform=WEAPP|WEB|OTHER，
 * 这里按 FetchManager 的默认常量覆盖成 brand='orz2'、platform='WEB'。
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
  const message = data?.message || data?.content || '发布任务提交失败';
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
  return payload.message || payload.content || '发布任务提交失败';
}

function parsePublisherStreamPayload(
  rawData: string
): OfficialPublisherStreamPayload {
  try {
    return JSON.parse(rawData) as OfficialPublisherStreamPayload;
  } catch {
    throw new Error('发布进度数据解析失败');
  }
}

/**
 * 以 SSE 模式生成微信公众号草稿。
 * EventSource 不支持 POST body，因此使用 fetch 读取 text/event-stream。
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
    throw new Error('当前浏览器无法读取实时发布进度');
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
  if (!isCompleted) throw new Error('实时发布连接意外中断，请重新提交');
  return result;
}
