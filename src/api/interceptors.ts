import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios';
import Cookies from 'js-cookie';

import {
  apiConfig,
  tokenCookieKeys,
  getApiRequestHeaders,
  defaultRetryOptions,
  errorCodesToShowModal,
  type RetryOptions,
  type RequestRetryConfig,
} from './config';

type RefreshQueueItem = {
  resolve: (value: string) => void;
  reject: (error: AxiosError) => void;
};

let isRefreshing = false;
const refreshQueue: RefreshQueueItem[] = [];

const enqueueRefresh = (item: RefreshQueueItem) => {
  refreshQueue.push(item);
};

const resolveQueue = (token?: string, error?: AxiosError) => {
  while (refreshQueue.length) {
    const queued = refreshQueue.shift();
    if (!queued) continue;
    if (token) {
      queued.resolve(token);
    } else if (error) {
      queued.reject(error);
    }
  }
};

const baseRequest = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  retry?: RequestRetryConfig;
  __retryCount?: number;
};

const attachAccessToken = (config: RetryableRequestConfig) => {
  const token = Cookies.get(tokenCookieKeys.access);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const customHeaders = getApiRequestHeaders();
  if (Object.keys(customHeaders).length) {
    Object.entries(customHeaders).forEach(([key, value]) => {
      if (config.headers) {
        config.headers[key] = value;
      }
    });
  }
  return config;
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = Cookies.get(tokenCookieKeys.refresh);
  if (!refreshToken) {
    throw new AxiosError('Refresh token missing', AxiosError.ERR_BAD_REQUEST);
  }
  const response = await baseRequest.post(apiConfig.endpoints.refresh, {
    refreshToken,
  });
  const { accessToken, refreshToken: newRefreshToken } = response.data ?? {};
  if (!accessToken) {
    throw new AxiosError('Unable to refresh token', AxiosError.ERR_BAD_RESPONSE);
  }
  Cookies.set(tokenCookieKeys.access, accessToken);
  if (newRefreshToken) {
    Cookies.set(tokenCookieKeys.refresh, newRefreshToken);
  }
  return accessToken;
};

const normalizeRetryOptions = (retry?: RequestRetryConfig): RetryOptions | null => {
  if (!retry) return null;
  
  if (retry === true) {
    return {
      ...defaultRetryOptions,
      enabled: true,
    };
  }
  
  return {
    ...defaultRetryOptions,
    enabled: true,
    ...retry,
  };
};

const shouldRetryRequest = (error: AxiosError, config: RetryableRequestConfig) => {
  const retryOptions = normalizeRetryOptions(config.retry);
  if (!retryOptions || !retryOptions.enabled) return null;

  const attempts = config.__retryCount ?? 0;
  if (attempts >= retryOptions.attempts) return null;

  // Check network errors
  if (!error.response && retryOptions.retryOnNetworkError) {
    return retryOptions;
  }

  // Check HTTP status codes
  const status = error.response?.status;
  if (status && retryOptions.retryOnStatuses.includes(status)) {
    return retryOptions;
  }

  return null;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createHttpClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
  });

  instance.interceptors.request.use(attachAccessToken);

  instance.interceptors.response.use(
    (response: any) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig & { _retry?: boolean };
      if (!originalRequest) return Promise.reject(error);

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await refreshAccessToken();
            resolveQueue(newToken);
          } catch (refreshError) {
            resolveQueue(undefined, refreshError as AxiosError);
            Cookies.remove(tokenCookieKeys.access);
            Cookies.remove(tokenCookieKeys.refresh);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return new Promise((resolve, reject) => {
          enqueueRefresh({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }
      const retryOptions = shouldRetryRequest(error, originalRequest);
      if (retryOptions) {
        originalRequest.__retryCount = (originalRequest.__retryCount ?? 0) + 1;
        const backoffDelay =
          retryOptions.delayMs * Math.pow(retryOptions.multiplier, originalRequest.__retryCount - 1);
        await wait(backoffDelay);
        return instance(originalRequest);
      }

      // Show error modal for specific error codes (skip 401 as it's handled by token refresh)
      const statusCode = error.response?.status;
      
      console.log('🔍 Interceptor caught error:', statusCode);
      console.log('🔍 Should show modal?', statusCode && errorCodesToShowModal.includes(statusCode as any));
      
      if (statusCode && statusCode !== 401 && errorCodesToShowModal.includes(statusCode as any)) {
        console.log('✅ Triggering error modal for status:', statusCode);
        // Use setTimeout to avoid blocking the error rejection
        setTimeout(() => {
          import('../composables/useErrorModal').then(({ showError }) => {
            console.log('📢 Dynamic import successful, calling showError');
            showError(statusCode as any);
          }).catch((err) => {
            console.error('❌ Failed to show error modal:', err);
          });
        }, 0);
      }
      
      // Show error modal for 401 only if token refresh failed
      if (statusCode === 401 && originalRequest._retry) {
        console.log('✅ Triggering 401 modal after failed token refresh');
        setTimeout(() => {
          import('../composables/useErrorModal').then(({ showError }) => {
            showError(401 as any);
          }).catch((err) => {
            console.error('❌ Failed to show error modal:', err);
          });
        }, 0);
      }

      return Promise.reject(error);
    },
  );

  return instance;
};


