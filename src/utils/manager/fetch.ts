import { notifyApiError } from '@/api/errors';
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosResponseHeaders,
  type RawAxiosResponseHeaders,
} from 'axios';
import md5 from 'blueimp-md5';
import { v4 as uuidV4 } from 'uuid';
import managerCache, { cacheKeys } from './cache';

type WebEnvironment = 'local' | 'uat' | 'prod';
type HttpMethod = NonNullable<AxiosRequestConfig['method']>;
type RequestValues = Record<string, unknown>;
type ResponseHeaders = AxiosResponseHeaders | RawAxiosResponseHeaders;

const webEnvironment =
  (import.meta.env.VITE_APP_ENV as WebEnvironment | undefined) || 'prod';
const platform = 'ORZ2';
const brand = 'zero';
const secretKey = 'I@, ha*ve #187076081$ dream(s)!~';
const defaultTimeoutMs = 20000;

const apiOrigins: Record<WebEnvironment, string> = {
  prod: 'https://orz2.online/api/smart',
  uat: 'https://orz2.online/apiuat/smart',
  local: 'http://localhost:9002/apilocal/smart',
};

function getFallbackBaseUrl(): string {
  return apiOrigins[webEnvironment];
}

function resolveBaseUrl(): string {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (!apiBaseUrl) return getFallbackBaseUrl();

  try {
    return new URL(apiBaseUrl).toString().replace(/\/$/, '');
  } catch {
    return getFallbackBaseUrl();
  }
}

function resolveRequestUrl(baseUrl: string, url: string): string {
  if (url.includes('://')) return url;
  return `${baseUrl}${url.replace(/^\/smart(?=\/)/, '')}`;
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
  console.debug('managerFetch: showLoading');
}

function hideLoading(): void {
  console.debug('managerFetch: hideLoading');
}

function showToast(message: string): void {
  console.debug('managerFetch: showToast', message);
}

export interface FetchRequestConfig extends Omit<
  AxiosRequestConfig,
  'data' | 'headers' | 'method' | 'params' | 'timeout' | 'url'
> {
  method?: HttpMethod;
  url: string;
  header?: Record<string, string>;
  query?: RequestValues;
  body?: object;
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

export interface FetchStreamConfig extends Omit<
  RequestInit,
  'body' | 'headers' | 'method'
> {
  method?: HttpMethod;
  url: string;
  header?: Record<string, string>;
  query?: RequestValues;
  body?: object;
  isRepeatAuth?: boolean;
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
  body: unknown;
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

class managerFetch {
  static instance: managerFetch | null = null;

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

  static getInstance(): managerFetch {
    this.instance ??= new managerFetch();
    return this.instance;
  }

  private async createSignedRequest({
    path,
    url,
    query,
    body,
    header,
    contentType,
  }: {
    path: string;
    url: string;
    query: RequestValues;
    body: unknown;
    header: Record<string, string>;
    contentType?: string;
  }): Promise<{ headers: Record<string, string>; url: string }> {
    const token =
      managerCache.getLocalStorage<string>(cacheKeys.authToken) || '';
    const signature = await createRequestSignature({ path, query, body });
    return {
      url: resolveRequestUrl(this.baseUrl, url),
      headers: createRequestHeaders(signature, token, header, contentType),
    };
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    const refreshToken = managerCache.getLocalStorage<string>(
      cacheKeys.authRefreshToken
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
          managerCache.removeLocalStorage(cacheKeys.authToken);
          managerCache.removeLocalStorage(cacheKeys.authRefreshToken);
          return false;
        }

        managerCache.setLocalStorage(cacheKeys.authToken, tokens.token);
        managerCache.setLocalStorage(
          cacheKeys.authRefreshToken,
          tokens.refreshToken
        );
        return true;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private async shouldRetryAuthentication(
    statusCode: number | undefined,
    isRepeatAuth: boolean
  ): Promise<boolean> {
    return statusCode === 401 && isRepeatAuth && this.refreshAccessToken();
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
    const signedRequest = await this.createSignedRequest({
      path: url,
      url,
      query,
      body,
      header,
      contentType: 'application/json',
    });
    const axiosConfig: AxiosRequestConfig = {
      ...axiosOptions,
      method,
      url: signedRequest.url,
      headers: signedRequest.headers,
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
      if (
        await this.shouldRetryAuthentication(result.statusCode, isRepeatAuth)
      ) {
        return this.request<TData>({ ...config, isRepeatAuth: false });
      }
      if (isShowToast && result.statusCode !== 200) {
        showToast(getErrorMessage(result.data, 'Request failed'));
      }
      notifyApiError(result.data);
      return result;
    } catch (error) {
      const result = getRequestErrorResponse(error) as FetchResponse<TData>;
      if (
        await this.shouldRetryAuthentication(result.statusCode, isRepeatAuth)
      ) {
        return this.request<TData>({ ...config, isRepeatAuth: false });
      }
      if (isShowToast) {
        showToast(
          getErrorMessage(result.data, result.error || 'Network error')
        );
      }
      notifyApiError(result.data);
      return result;
    } finally {
      if (isShowLoading) hideLoading();
    }
  }

  async requestStream(config: FetchStreamConfig): Promise<Response> {
    const {
      method = 'GET',
      url,
      header = {},
      query = {},
      body = {},
      isRepeatAuth = true,
      ...fetchOptions
    } = config;
    const signedRequest = await this.createSignedRequest({
      path: url,
      url,
      query,
      body,
      header,
      contentType: 'application/json',
    });
    const response = await fetch(buildUrlWithQuery(signedRequest.url, query), {
      ...fetchOptions,
      method,
      headers: signedRequest.headers,
      body: isBodyMethod(method) ? JSON.stringify(body) : undefined,
    });

    if (await this.shouldRetryAuthentication(response.status, isRepeatAuth)) {
      return this.requestStream({ ...config, isRepeatAuth: false });
    }

    if (!response.ok) {
      const payload = await response
        .clone()
        .json()
        .catch(() => undefined);
      notifyApiError(payload);
    }

    return response;
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
    const signedRequest = await this.createSignedRequest({
      path: signPath || url,
      url,
      query,
      body: {},
      header,
    });
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
      url: signedRequest.url,
      headers: signedRequest.headers,
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
      if (
        await this.shouldRetryAuthentication(result.statusCode, isRepeatAuth)
      ) {
        return this.upload<TData>({ ...config, isRepeatAuth: false });
      }
      notifyApiError(result.data);
      return result;
    } catch (error) {
      const result = getRequestErrorResponse(error) as FetchResponse<TData>;
      if (
        await this.shouldRetryAuthentication(result.statusCode, isRepeatAuth)
      ) {
        return this.upload<TData>({ ...config, isRepeatAuth: false });
      }
      notifyApiError(result.data);
      return result;
    } finally {
      if (isShowLoading) hideLoading();
    }
  }
}

export default managerFetch.getInstance();
