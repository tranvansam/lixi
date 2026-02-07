import Cookies from 'js-cookie';

import { httpClient, apiConfig, tokenCookieKeys, cookieOptions } from '@/api';

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

export type LoginResponse = {
  user: {
    id: number;
    email: string;
    name: string;
  };
  tokens: AuthTokens;
};

const persistTokens = ({ accessToken, refreshToken }: AuthTokens) => {
  Cookies.set(tokenCookieKeys.access, accessToken, cookieOptions);
  Cookies.set(tokenCookieKeys.refresh, refreshToken, cookieOptions);
};

export const login = async (payload: LoginPayload) => {
  const { data } = await httpClient.post<LoginResponse>(apiConfig.endpoints.login, payload);
  if (data?.tokens) {
    persistTokens(data.tokens);
  }
  return data;
};

export const logout = () => {
  Cookies.remove(tokenCookieKeys.access);
  Cookies.remove(tokenCookieKeys.refresh);
};

export const getProfile = async () => {
  const { data } = await httpClient.get(apiConfig.endpoints.profile);
  return data;
};


