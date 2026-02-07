import { httpClient, apiConfig } from '@/api';

export type SystemStatus = {
  status: 'ok' | 'degraded';
  version: string;
  uptime: number;
};

export const fetchSystemStatus = async (retry?: boolean | Partial<{ attempts: number; delayMs: number; multiplier: number; retryOnStatuses: number[]; retryOnNetworkError: boolean }>) => {
  const { data } = await httpClient.get<SystemStatus>(apiConfig.endpoints.systemStatus, {
    retry: retry ?? false, // Mặc định không retry, có thể truyền true hoặc config tùy chỉnh
  });
  return data;
};


