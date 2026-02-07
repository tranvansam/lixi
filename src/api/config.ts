export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000',
  timeout: 10_000,
  endpoints: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    profile: '/me',
    systemStatus: '/system/status',
    posts: '/posts',
    products: '/products',
  },
};

// Error codes that should trigger error modal
export const errorCodesToShowModal = [401, 403, 404, 422, 429, 500, 502, 503, 504] as const;

export type ErrorCode = (typeof errorCodesToShowModal)[number];

export const tokenCookieKeys = {
  access: 'app-access-token',
  refresh: 'app-refresh-token',
} as const;

export const cookieOptions = {
  secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
  sameSite: 'lax' as const,
  path: '/',
};

type HeaderDictionary = Record<string, string>;

let runtimeHeaders: HeaderDictionary = {};

export type RetryOptions = {
  enabled: boolean;
  attempts: number;
  delayMs: number;
  multiplier: number;
  retryOnStatuses: number[];
  retryOnNetworkError?: boolean;
};

export const defaultRetryOptions: RetryOptions = {
  enabled: false,
  attempts: 3,
  delayMs: 500,
  multiplier: 2,
  retryOnStatuses: [408, 425, 429, 500, 502, 503, 504],
  retryOnNetworkError: true,
};

export type RequestRetryConfig = 
  | boolean 
  | Partial<Pick<RetryOptions, 'attempts' | 'delayMs' | 'multiplier' | 'retryOnStatuses' | 'retryOnNetworkError'>>;

export const setApiRequestHeaders = (headers: HeaderDictionary) => {
  runtimeHeaders = { ...headers };
};

export const mergeApiRequestHeaders = (headers: Partial<Record<string, string | undefined>>) => {
  runtimeHeaders = Object.entries(headers).reduce<HeaderDictionary>((acc, [key, value]) => {
    if (value === undefined) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, { ...runtimeHeaders });
};

export const clearApiRequestHeaders = (...headerKeys: string[]) => {
  if (!headerKeys.length) {
    runtimeHeaders = {};
    return;
  }
  const nextHeaders = { ...runtimeHeaders };
  headerKeys.forEach((key) => {
    delete nextHeaders[key];
  });
  runtimeHeaders = nextHeaders;
};

export const getApiRequestHeaders = (): HeaderDictionary => ({ ...runtimeHeaders });


