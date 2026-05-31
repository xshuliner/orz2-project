import axios from 'axios';
import FetchManager from '@/utils/FetchManager';
import md5 from 'blueimp-md5';
import type {
  MemberSummaryBody,
  MemberListPageBody,
  MemberInfo,
  StoryListResult,
} from './orz2.modal';

// ===== API 根路径 & URL 常量 =====

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://www.orz2.online/api/smart/v1';

const MEMBER_PREFIX = `${API_BASE_URL}/member`;
const STORY_PREFIX = `${API_BASE_URL}/story`;

export const MEMBER_SUMMARY_API_URL = `${MEMBER_PREFIX}/getQueryMemberSummaryForSilicon`;
export const MEMBER_LIST_API_URL = `${MEMBER_PREFIX}/getQueryMemberListForSilicon`;
export const MEMBER_INFO_API_URL = `${MEMBER_PREFIX}/getQueryMemberInfoForSilicon`;
export const MEMBER_LOGIN_API_URL = `${MEMBER_PREFIX}/postLoginMemberInfoForSilicon`;
export const STORY_LIST_API_URL = `${STORY_PREFIX}/getQueryStoryListForSilicon`;

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
  const { data } = await axios.get<{ code: number; body?: MemberSummaryBody | null }>(
    MEMBER_SUMMARY_API_URL
  );
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
export async function postLoginMemberInfo(
  nickName: string
): Promise<{ storyInfo?: import('./orz2.modal').StoryItem; memberInfo?: MemberInfo } | null> {
  const { data } = await axios.post<{
    code: number;
    body?: { storyInfo?: import('./orz2.modal').StoryItem; memberInfo?: MemberInfo } | null;
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
