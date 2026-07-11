import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosResponseHeaders,
  type RawAxiosResponseHeaders,
} from 'axios';
import md5 from 'blueimp-md5';
import { v4 as uuidV4 } from 'uuid';
import CacheManager from './CacheManager';

type WebEnvironment = 'local' | 'uat' | 'prod';
type HttpMethod = NonNullable<AxiosRequestConfig['method']>;
type RequestValues = Record<string, unknown>;
type ResponseHeaders = AxiosResponseHeaders | RawAxiosResponseHeaders;

const webEnvironment =
  (import.meta.env.VITE_APP_ENV as WebEnvironment | undefined) || 'prod';
const platform = 'ORZ2';
const brand = 'zero';
const secretKey = 'I@, ha*ve #187076081$ dream(s)!~';
const tokenStorageKey = 'token';
const refreshTokenStorageKey = 'refreshToken';
const defaultTimeoutMs = 20000;

const apiOrigins: Record<WebEnvironment, string> = {
  prod: 'https://orz2.online/api',
  uat: 'https://orz2.online/apiuat',
  local: 'http://localhost:9002/apilocal',
};

function getFallbackBaseUrl(): string {
  return apiOrigins[webEnvironment];
}

function resolveBaseUrl(): string {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (!apiBaseUrl) return getFallbackBaseUrl();

  try {
    const parsedUrl = new URL(apiBaseUrl);
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/smart\/v1\/?$/, '');
    return parsedUrl.toString().replace(/\/$/, '');
  } catch {
    return getFallbackBaseUrl();
  }
}

function stringifyRequestValues(values: RequestValues): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, String(value)])
  );
}

function buildUrlWithQuery(path: string, query: RequestValues): string {
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function isBodyMethod(method: HttpMethod): boolean {
  return method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD';
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data !== 'object' || data === null) return fallback;
  const record = data as Record<string, unknown>;
  return typeof record.message === 'string' ? record.message : fallback;
}

function getResponseHeaders(response: AxiosResponse): ResponseHeaders {
  return response.headers;
}

function getRequestErrorResponse(error: unknown): FetchResponse {
  if (!axios.isAxiosError(error)) {
    return {
      statusCode: 0,
      data: error,
      error: error instanceof Error ? error.message : 'Network error',
      headers: {},
    };
  }

  return {
    statusCode: error.response?.status || 0,
    data: error.response?.data || error,
    error: error.message || 'Network error',
    headers: error.response?.headers || {},
  };
}

interface RefreshTokenResponse {
  body?: {
    refreshToken?: unknown;
    token?: unknown;
  };
}

function getRefreshedTokens(data: unknown): {
  refreshToken: string;
  token: string;
} | null {
  if (typeof data !== 'object' || data === null) return null;
  const body = (data as RefreshTokenResponse).body;
  if (
    typeof body?.token !== 'string' ||
    typeof body.refreshToken !== 'string'
  ) {
    return null;
  }
  return { token: body.token, refreshToken: body.refreshToken };
}

function showLoading(): void {
  console.debug('FetchManager: showLoading');
}

function hideLoading(): void {
  console.debug('FetchManager: hideLoading');
}

function showToast(message: string): void {
  console.debug('FetchManager: showToast', message);
}

export interface FetchRequestConfig extends Omit<
  AxiosRequestConfig,
  'data' | 'headers' | 'method' | 'params' | 'timeout' | 'url'
> {
  method?: HttpMethod;
  url: string;
  header?: Record<string, string>;
  query?: RequestValues;
  body?: RequestValues;
  isShowLoading?: boolean;
  isShowToast?: boolean;
  isRepeatAuth?: boolean;
  timeout?: number;
}

export interface FetchUploadConfig extends FetchRequestConfig {
  signPath?: string;
  file?: {
    blob?: Blob;
    fieldName?: string;
    filename?: string;
    filePath?: string;
    [key: string]: unknown;
  };
}

export interface FetchResponse<TData = unknown> {
  statusCode?: number;
  data?: TData;
  error?: string;
  headers?: ResponseHeaders;
}

interface RequestSignature {
  requestid: string;
  t: string;
  k: string;
}

async function createRequestSignature(params: {
  path: string;
  query: RequestValues;
  body: RequestValues;
}): Promise<RequestSignature> {
  const queryForSignature = stringifyRequestValues(params.query);
  const requestid = uuidV4();
  const t = String(Date.now());
  const path = params.path;
  const k = md5(
    `${requestid.slice(-10)}${t}${path[path.length - 2]}${platform}${secretKey}${requestid.slice(0, 10)}${path[path.length - 3]}${t}${brand}` +
      `\t${JSON.stringify(queryForSignature)}\t${JSON.stringify(params.body)}`
  );

  return { requestid, t, k };
}

function createRequestHeaders(
  signature: RequestSignature,
  token: string,
  header: Record<string, string>,
  contentType?: string
): Record<string, string> {
  return {
    platform,
    brand,
    authorization: token ? `Bearer ${token}` : '',
    requestid: signature.requestid,
    t: signature.t,
    k: signature.k,
    ...(contentType ? { 'Content-Type': contentType } : {}),
    ...header,
  };
}

class FetchManager {
  static instance: FetchManager | null = null;

  private readonly baseUrl: string;
  private readonly axiosInstance: AxiosInstance;
  private refreshPromise: Promise<boolean> | null = null;

  private constructor() {
    this.baseUrl = resolveBaseUrl();
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: defaultTimeoutMs,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static getInstance(): FetchManager {
    this.instance ??= new FetchManager();
    return this.instance;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    const refreshToken = CacheManager.getLocalStorage<string>(
      refreshTokenStorageKey
    );
    if (!refreshToken) return false;

    this.refreshPromise = this.request<RefreshTokenResponse>({
      method: 'POST',
      url: '/smart/v1/member/postRefreshToken',
      body: { refreshToken },
      isRepeatAuth: false,
    })
      .then(response => {
        const tokens =
          response.statusCode === 200
            ? getRefreshedTokens(response.data)
            : null;
        if (!tokens) {
          CacheManager.removeLocalStorage(tokenStorageKey);
          CacheManager.removeLocalStorage(refreshTokenStorageKey);
          return false;
        }

        CacheManager.setLocalStorage(tokenStorageKey, tokens.token);
        CacheManager.setLocalStorage(
          refreshTokenStorageKey,
          tokens.refreshToken
        );
        return true;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  async request<TData = unknown>(
    config: FetchRequestConfig
  ): Promise<FetchResponse<TData>> {
    const {
      method = 'GET',
      url,
      header = {},
      query = {},
      body = {},
      isShowLoading = false,
      isShowToast = false,
      isRepeatAuth = true,
      timeout = defaultTimeoutMs,
      ...axiosOptions
    } = config;
    const token = CacheManager.getLocalStorage<string>(tokenStorageKey) || '';
    const signature = await createRequestSignature({ path: url, query, body });
    const responseUrl = url.includes('://') ? url : `${this.baseUrl}${url}`;
    const axiosConfig: AxiosRequestConfig = {
      ...axiosOptions,
      method,
      url: responseUrl,
      headers: createRequestHeaders(
        signature,
        token,
        header,
        'application/json'
      ),
      params: isBodyMethod(method) ? undefined : query,
      data: isBodyMethod(method) ? body : undefined,
      timeout,
    };

    if (isShowLoading) showLoading();
    try {
      const response = await this.axiosInstance.request<TData>(axiosConfig);
      const result: FetchResponse<TData> = {
        statusCode: response.status,
        data: response.data,
        headers: getResponseHeaders(response),
      };
      if (isRepeatAuth && result.statusCode === 401) {
        const hasRefreshed = await this.refreshAccessToken();
        if (hasRefreshed) {
          return this.request<TData>({ ...config, isRepeatAuth: false });
        }
      }
      if (isShowToast && result.statusCode !== 200) {
        showToast(getErrorMessage(result.data, 'Request failed'));
      }
      return result;
    } catch (error) {
      const result = getRequestErrorResponse(error) as FetchResponse<TData>;
      if (isRepeatAuth && result.statusCode === 401) {
        const hasRefreshed = await this.refreshAccessToken();
        if (hasRefreshed) {
          return this.request<TData>({ ...config, isRepeatAuth: false });
        }
      }
      if (isShowToast) {
        showToast(
          getErrorMessage(result.data, result.error || 'Network error')
        );
      }
      return result;
    } finally {
      if (isShowLoading) hideLoading();
    }
  }

  async upload<TData = unknown>(
    config: FetchUploadConfig
  ): Promise<FetchResponse<TData>> {
    const {
      method = 'POST',
      signPath,
      url,
      header = {},
      query = {},
      body = {},
      file = {},
      isShowLoading = false,
      isRepeatAuth = true,
      timeout = defaultTimeoutMs,
      ...axiosOptions
    } = config;
    const {
      blob,
      fieldName = 'file',
      filename,
      filePath,
      ...fileFields
    } = file;
    const token = CacheManager.getLocalStorage<string>(tokenStorageKey) || '';
    const signature = await createRequestSignature({
      path: signPath || url,
      query,
      body: {},
    });
    const uploadUrl = buildUrlWithQuery(url, query);
    const responseUrl = uploadUrl.includes('://')
      ? uploadUrl
      : `${this.baseUrl}${uploadUrl}`;
    const formData = new FormData();

    if (blob) {
      formData.append(fieldName, blob, filename);
    } else if (filePath) {
      try {
        const fileBlob = await fetch(filePath).then(response =>
          response.blob()
        );
        formData.append(fieldName, fileBlob, filename);
      } catch (error) {
        console.error('Failed to load upload file:', error);
      }
    }

    Object.entries(fileFields).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const axiosConfig: AxiosRequestConfig = {
      ...axiosOptions,
      method,
      url: responseUrl,
      headers: createRequestHeaders(signature, token, header),
      data: formData,
      params: query,
      timeout,
    };

    if (isShowLoading) showLoading();
    try {
      const response = await axios.request<TData>(axiosConfig);
      const result = {
        statusCode: response.status,
        data: response.data,
        headers: getResponseHeaders(response),
      };
      if (isRepeatAuth && result.statusCode === 401) {
        const hasRefreshed = await this.refreshAccessToken();
        if (hasRefreshed) {
          return this.upload<TData>({ ...config, isRepeatAuth: false });
        }
      }
      return result;
    } catch (error) {
      const result = getRequestErrorResponse(error) as FetchResponse<TData>;
      if (isRepeatAuth && result.statusCode === 401) {
        const hasRefreshed = await this.refreshAccessToken();
        if (hasRefreshed) {
          return this.upload<TData>({ ...config, isRepeatAuth: false });
        }
      }
      return result;
    } finally {
      if (isShowLoading) hideLoading();
    }
  }

  async stream<TData = ReadableStream<Uint8Array>>(
    config: FetchRequestConfig
  ): Promise<FetchResponse<TData>> {
    const {
      method = 'GET',
      url,
      header = {},
      query = {},
      body = {},
      isShowLoading = false,
      isShowToast = false,
      isRepeatAuth = true,
      timeout = defaultTimeoutMs,
      ...axiosOptions
    } = config;
    const token = CacheManager.getLocalStorage<string>(tokenStorageKey) || '';
    const signature = await createRequestSignature({ path: url, query, body });
    const urlWithQuery = buildUrlWithQuery(url, stringifyRequestValues(query));
    const responseUrl = urlWithQuery.includes('://')
      ? urlWithQuery
      : `${this.baseUrl}${urlWithQuery}`;
    const axiosConfig: AxiosRequestConfig = {
      ...axiosOptions,
      method,
      url: responseUrl,
      headers: createRequestHeaders(
        signature,
        token,
        header,
        'application/json'
      ),
      params: isBodyMethod(method) ? undefined : query,
      data: isBodyMethod(method) ? body : undefined,
      timeout,
      responseType: 'blob',
    };

    if (isShowLoading) showLoading();
    try {
      const response = await this.axiosInstance.request<Blob>(axiosConfig);
      return {
        statusCode: response.status,
        data: response.data.stream() as TData,
        headers: getResponseHeaders(response),
      };
    } catch (error) {
      const result = getRequestErrorResponse(error) as FetchResponse<TData>;
      if (isRepeatAuth && result.statusCode === 401) {
        const hasRefreshed = await this.refreshAccessToken();
        if (hasRefreshed) {
          return this.stream<TData>({ ...config, isRepeatAuth: false });
        }
      }
      if (isShowToast) {
        showToast(
          getErrorMessage(result.data, result.error || 'Network error')
        );
      }
      return result;
    } finally {
      if (isShowLoading) hideLoading();
    }
  }
}

export default FetchManager.getInstance();
