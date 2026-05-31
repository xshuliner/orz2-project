import FetchManager from '@/utils/FetchManager';
import md5 from 'blueimp-md5';

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

export default {
  getQueryMiniCodeLogin,
  postCreateMiniCodeLogin,
  getQueryMemberInfo,
  postLoginMemberInfoForPassword,
};
