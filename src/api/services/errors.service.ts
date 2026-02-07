import { httpClient } from '@/api';

export type ErrorCode = 401 | 403 | 404 | 422 | 429 | 500 | 502 | 503 | 504;

export const testError = async (code: ErrorCode) => {
  const { data } = await httpClient.get(`/test/error/${code}`);
  return data;
};

