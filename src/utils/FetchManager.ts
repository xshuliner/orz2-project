import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import md5 from 'blueimp-md5';
import { v4 as uuidV4 } from 'uuid';
import CacheManager from './CacheManager';
import Utils from './utils';

const webenv =
  (import.meta.env.VITE_APP_ENV as 'local' | 'uat' | 'prod') || 'prod';
const env = 'EXTENSION';
const brand = 'gatling';
const secretKey = 'I@, ha*ve #187076081$ dream(s)!~';

const web = {
  prod: {
    baseUrl: 'https://www.orz2.online/api',
  },
  uat: {
    baseUrl: 'https://www.orz2.online/apiuat',
  },
  local: {
    baseUrl: 'http://localhost:9002/apilocal',
  },
};

interface RequestConfig {
  method?: string;
  url: string;
  header?: Record<string, string>;
  query?: Record<string, any>;
  body?: Record<string, any>;
  isShowLoading?: boolean;
  isShowToast?: boolean;
  isRepeatAuth?: boolean;
  timeout?: number;
  [key: string]: any;
}

interface UploadConfig extends RequestConfig {
  signPath?: string;
  file?: {
    blob?: Blob;
    fieldName?: string;
    filename?: string;
    filePath?: string;
    [key: string]: any;
  };
}

interface ApiResponse {
  statusCode?: number;
  data?: any;
  [key: string]: any;
}

const getApiHeaders = async (params: {
  path: string;
  query: Record<string, any>;
  body: Record<string, any>;
  token: string;
}): Promise<{
  urlAndQuery: string;
  token: string;
  t: string;
  k: string;
  requestid: string;
}> => {
  const { path: url, query: queryReq = {}, body: bodyReq = {} } = params || {};
  const queryReqReal = Utils.traverseObject({
    obj: queryReq,
    modifier: (key, value) => {
      return String(value);
    },
  });
  const urlAndQuery = Utils.router2url(url, queryReqReal) as string;
  const token = CacheManager.getLocalStorage<string>('token') || '';
  const requestid = uuidV4();
  const t = String(new Date().getTime());
  const k = md5(
    `${requestid.slice(-10)}${t}${url[url.length - 2]}${env}${secretKey}${requestid.slice(0, 10)}${url[url.length - 3]}${t}${brand}` +
      `\t${JSON.stringify(queryReqReal)}\t${JSON.stringify(bodyReq)}`
  );

  return {
    urlAndQuery,
    token,
    t,
    k,
    requestid,
  };
};

const showLoading = (): void => {
  console.debug('FetchManager: showLoading');
};

const hideLoading = (): void => {
  console.debug('FetchManager: hideLoading');
};

const showToast = (message: string): void => {
  console.debug('FetchManager: showToast', message);
};

class FetchManager {
  static instance: FetchManager | null = null;

  private baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    const objWeb = web[webenv] ? web[webenv] : web['prod'];
    const { baseUrl } = objWeb || {};

    this.baseUrl = baseUrl || '';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('FetchManager getInstance', webenv, objWeb);
  }

  static getInstance(): FetchManager {
    if (!this.instance) {
      this.instance = new FetchManager();
    }
    return this.instance;
  }

  request = async (objConfig: RequestConfig): Promise<ApiResponse> => {
    let result: ApiResponse;

    const {
      method = 'GET',
      url,
      header = {},
      query = {},
      body = {},
      isShowLoading = false,
      isShowToast = false,
      isRepeatAuth: _isRepeatAuth = true,
      timeout = 20000,
      ...otherConfig
    } = objConfig || {};

    const token = CacheManager.getLocalStorage<string>('token') || '';

    const { t, k, requestid } = await getApiHeaders({
      path: url,
      query,
      body,
      token,
    });

    const fullUrl = url.includes('://') ? url : `${this.baseUrl}${url}`;

    const headers: Record<string, string> = {
      platform: env,
      brand: brand,
      authorization: token ? `Bearer ${token}` : '',
      requestid,
      t,
      k,
      'Content-Type': 'application/json',
      ...header,
    };

    const axiosConfig: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: fullUrl,
      headers,
      params: method === 'GET' || method === 'HEAD' ? query : undefined,
      data: method !== 'GET' && method !== 'HEAD' ? body : undefined,
      timeout,
      ...otherConfig,
    };

    console.debug('FetchManager options', JSON.stringify(axiosConfig, null, 2));

    try {
      if (isShowLoading) {
        showLoading();
      }

      const response: AxiosResponse =
        await this.axiosInstance.request(axiosConfig);

      result = {
        statusCode: response.status,
        data: response.data,
        headers: response.headers as Record<string, any>,
      };

      if (isShowLoading) {
        hideLoading();
      }

      if (isShowToast && result?.statusCode !== 200) {
        showToast(result?.data?.message || 'Request failed');
      }
    } catch (error: any) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as any;
      result = {
        statusCode: axiosError.response?.status || 0,
        data: axiosError.response?.data || error,
        error: axiosError.message || 'Network error',
        headers: (axiosError.response?.headers as Record<string, any>) || {},
      };
      if (isShowLoading) {
        hideLoading();
      }
      if (isShowToast) {
        showToast(errorData?.message || axiosError.message || 'Network error');
      }
    }

    console.debug('FetchManager request', result);
    return result;
  };

  upload = async (objConfig: UploadConfig): Promise<ApiResponse> => {
    let result: ApiResponse;

    const {
      method = 'POST',
      signPath,
      url,
      header = {},
      query = {},
      body = {},
      file = {},
      isShowLoading = false,
      isRepeatAuth: _isRepeatAuth = true,
      timeout = 20000,
      ...otherConfig
    } = objConfig || {};

    const {
      blob,
      fieldName = 'file',
      filename,
      filePath,
      ...otherParams
    } = file || {};

    const token = CacheManager.getLocalStorage<string>('token') || '';

    const { t, k, requestid } = await getApiHeaders({
      path: signPath || url,
      query,
      body: {},
      token,
    });
    const queryReqReal = Utils.traverseObject({
      obj: query,
      modifier: (key, value) => {
        return String(value);
      },
    });
    const urlAndQuery = Utils.router2url(url, queryReqReal) as string;

    console.log('verifyLegal', {
      requestid,
      t,
      url,
      platform: env,
      secretKey,
      brand,
      queryReq: JSON.stringify(query),
      bodyReq: JSON.stringify(body),
    });

    const fullUrl = urlAndQuery.includes('://')
      ? urlAndQuery
      : `${this.baseUrl}${urlAndQuery}`;

    const headers: Record<string, string> = {
      platform: env,
      brand: brand,
      authorization: token ? `Bearer ${token}` : '',
      requestid,
      t,
      k,
      ...header,
    };

    const formData = new FormData();

    if (blob) {
      formData.append(fieldName, blob, filename);
    } else if (filePath) {
      try {
        const fileBlob = await fetch(filePath).then(r => r.blob());
        formData.append(fieldName, fileBlob, filename);
      } catch (error) {
        console.error('Failed to load file:', error);
      }
    }

    Object.keys(otherParams).forEach(key => {
      formData.append(key, String(otherParams[key]));
    });

    Object.keys(body).forEach(key => {
      formData.append(key, String(body[key]));
    });

    const axiosConfig: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: fullUrl,
      headers: {
        ...headers,
      },
      data: formData,
      params: query,
      timeout,
      ...otherConfig,
    };

    try {
      if (isShowLoading) {
        showLoading();
      }

      const response: AxiosResponse = await axios.request(axiosConfig);

      result = {
        statusCode: response.status,
        data: response.data,
        headers: response.headers as Record<string, any>,
      };
    } catch (error: any) {
      const axiosError = error as AxiosError;
      result = {
        statusCode: axiosError.response?.status || 0,
        data: axiosError.response?.data || error,
        error: axiosError.message || 'Network error',
        headers: (axiosError.response?.headers as Record<string, any>) || {},
      };
    }

    if (isShowLoading) {
      hideLoading();
    }

    console.debug(
      'FetchManager upload',
      JSON.stringify(objConfig),
      JSON.stringify(result)
    );
    return result;
  };

  stream = async (objConfig: RequestConfig): Promise<ApiResponse> => {
    let result: ApiResponse;

    const {
      method = 'GET',
      url,
      header = {},
      query = {},
      body = {},
      isShowLoading = false,
      isShowToast = false,
      timeout = 20000,
      ...otherConfig
    } = objConfig || {};

    const token = CacheManager.getLocalStorage<string>('token') || '';

    const { urlAndQuery, t, k, requestid } = await getApiHeaders({
      path: url,
      query,
      body,
      token,
    });

    const fullUrl = urlAndQuery.includes('://')
      ? urlAndQuery
      : `${this.baseUrl}${urlAndQuery}`;

    const headers: Record<string, string> = {
      platform: env,
      brand: brand,
      authorization: token ? `Bearer ${token}` : '',
      requestid,
      t,
      k,
      'Content-Type': 'application/json',
      ...header,
    };

    const axiosConfig: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: fullUrl,
      headers,
      params: method === 'GET' || method === 'HEAD' ? query : undefined,
      data: method !== 'GET' && method !== 'HEAD' ? body : undefined,
      timeout,
      responseType: 'blob',
      ...otherConfig,
    };

    console.debug('FetchManager options', JSON.stringify(axiosConfig, null, 2));

    try {
      if (isShowLoading) {
        showLoading();
      }

      const response: AxiosResponse<Blob> =
        await this.axiosInstance.request(axiosConfig);

      const blob = response.data;
      const stream = blob.stream();

      result = {
        statusCode: response.status,
        data: stream,
        headers: response.headers as Record<string, any>,
      };

      if (isShowLoading) {
        hideLoading();
      }
    } catch (error: any) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as any;
      result = {
        statusCode: axiosError.response?.status || 0,
        data: axiosError.response?.data || error,
        error: axiosError.message || 'Network error',
        headers: (axiosError.response?.headers as Record<string, any>) || {},
      };
      if (isShowLoading) {
        hideLoading();
      }
      if (isShowToast) {
        showToast(errorData?.message || axiosError.message || 'Network error');
      }
    }

    console.debug('FetchManager stream', result);
    return result;
  };
}

export default FetchManager.getInstance();
