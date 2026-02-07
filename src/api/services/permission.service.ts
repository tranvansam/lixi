import { httpClient, apiConfig } from '@/api';
import type { UserPermissions } from '@/types/permission';

/**
 * Fetch user permissions from API
 */
export const fetchUserPermissions = async (): Promise<UserPermissions> => {
  const { data } = await httpClient.get<UserPermissions>(
    `${apiConfig.baseURL}/permissions/me`
  );
  return data;
};

/**
 * Check if user has specific permission
 */
export const checkPermission = async (resource: string, action: string): Promise<boolean> => {
  const { data } = await httpClient.post<{ allowed: boolean }>(
    `${apiConfig.baseURL}/permissions/check`,
    { resource, action }
  );
  return data.allowed;
};

