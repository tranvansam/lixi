/// <reference types="vite/client" />

declare module 'qrcode' {
  export function toCanvas(canvas: HTMLCanvasElement, text: string, options?: Record<string, unknown>): Promise<void>;
  export function toDataURL(text: string, options?: Record<string, unknown>): Promise<string>;
}

// Type declarations for path aliases in Vue SFC files
// This file must be included in tsconfig.json for TypeScript to recognize @/ paths

// ============================================
// GLOBAL TYPE AUGMENTATIONS
// ============================================

// Browser Bluetooth API types
interface RequestDeviceOptions {
  filters?: Array<{
    services?: string[];
    name?: string;
    namePrefix?: string;
  }>;
  optionalServices?: string[];
  acceptAllDevices?: boolean;
}

interface Navigator {
  bluetooth?: {
    requestDevice(options?: RequestDeviceOptions): Promise<any>;
    getAvailability(): Promise<boolean>;
  };
}

// ============================================
// WILDCARD DECLARATIONS - Universal fix for all @/ imports
// ============================================

// Vue components - all patterns
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module '@/views/*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module '@/views/**/*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module '@/components/**/*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

// API Services - all patterns
declare module '@/api/services/*.service' {
  const exports: any;
  export = exports;
}

declare module '@/api/services/*' {
  const exports: any;
  export = exports;
}

// Composables - all patterns
declare module '@/composables/*' {
  const exports: any;
  export = exports;
}

// Types - all patterns
declare module '@/types' {
  export * from '../types';
}

declare module '@/types/form' {
  export interface FormFieldOption {
    label: string;
    value: string | number;
    disabled?: boolean;
  }
  
  export interface BaseFormFieldProps {
    name: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
  }
  
  export interface InputProps extends BaseFormFieldProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    modelValue?: string | number;
  }
  
  export interface CheckboxProps extends BaseFormFieldProps {
    modelValue?: boolean;
    helperText?: string;
  }
  
  export interface RadioProps extends BaseFormFieldProps {
    options: FormFieldOption[];
    modelValue?: string | number;
  }
  
  export interface SelectProps extends BaseFormFieldProps {
    options: FormFieldOption[];
    modelValue?: string | number;
    multiple?: boolean;
  }
  
  export interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
    fill?: 'clear' | 'outline' | 'solid' | 'default';
    size?: 'small' | 'default' | 'large';
    expand?: 'block' | 'full';
    disabled?: boolean;
    loading?: boolean;
  }
}

declare module '@/types/*' {
  const exports: any;
  export = exports;
}

// Utils - all patterns
declare module '@/utils' {
  export * from '../utils';
  export * from '../utils/schemas';
  export * from '../utils/functions';
  export * from '../utils/constants';
  export { loginSchema, registerSchema } from '../utils/schemas/auth.schema';
  export { emailSchema, passwordSchema, phoneSchema } from '../utils/schemas/common.schema';
}

declare module '@/utils/*' {
  const exports: any;
  export = exports;
}

// Stores - all patterns
declare module '@/stores/*' {
  const exports: any;
  export = exports;
}

// Router - all patterns
declare module '@/router' {
  import type { Router } from 'vue-router';
  const router: Router;
  export default router;
}

declare module '@/router/*' {
  const exports: any;
  export = exports;
}

// I18n
declare module '@/i18n' {
  import type { I18n } from 'vue-i18n';
  export const i18n: I18n;
  export default i18n;
}

declare module '@/i18n/*' {
  const exports: any;
  export = exports;
}

// Directives
declare module '@/directives/*' {
  const exports: any;
  export = exports;
}

// API
declare module '@/api' {
  import type { AxiosInstance, AxiosRequestConfig } from 'axios';
  
  export const httpClient: AxiosInstance;
  export const apiConfig: any;
  export const tokenCookieKeys: any;
  export const cookieOptions: any;
  export const defaultRetryOptions: any;
  export const errorCodesToShowModal: number[];
  
  export type RequestRetryConfig = AxiosRequestConfig & {
    retry?: boolean | {
      attempts?: number;
      delay?: number;
      multiplier?: number;
      retryOnStatuses?: number[];
      retryOnNetworkError?: boolean;
    };
  };
  
  export * from '../api/config';
}

// Catch-all for any other @/ imports
declare module '@/*' {
  const exports: any;
  export = exports;
}

// ============================================
// SPECIFIC DECLARATIONS (for better IDE support)
// ============================================

declare module '@/composables/useLanguages' {
  import type { ComputedRef } from 'vue';
  
  export const LANGUAGE_STORAGE_KEY: string;
  export const supportedLanguageCodes: readonly ['en', 'ko', 'zh'];
  export type LanguageCode = 'en' | 'ko' | 'zh';
  export function isSupportedLanguage(value: string | null): value is LanguageCode;
  export function getInitialLanguage(): LanguageCode;
  export function useLanguageOptions(): {
    languageOptions: ComputedRef<Array<{ code: LanguageCode; label: string }>>;
  };
}

declare module '@/composables/usePermissions' {
  import type { Ref, ComputedRef } from 'vue';
  export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import';
  export type PermissionResource = 'users' | 'products' | 'posts' | 'orders' | 'settings' | 'dashboard' | 'reports';
  export type UserRole = 'admin' | 'manager' | 'user' | 'guest';
  export interface UserPermissions {
    userId: number;
    role: UserRole;
    permissions: Array<{ resource: PermissionResource; actions: PermissionAction[] }>;
    routes: string[];
  }
  export function usePermissions(): {
    userPermissions: Ref<UserPermissions | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
    currentRole: ComputedRef<UserRole | undefined>;
    isAdmin: ComputedRef<boolean>;
    isManager: ComputedRef<boolean>;
    isUser: ComputedRef<boolean>;
    isGuest: ComputedRef<boolean>;
    isAuthenticated: ComputedRef<boolean>;
    loadPermissions: (force?: boolean) => Promise<UserPermissions | null>;
    hasPermission: (resource: PermissionResource, action: PermissionAction) => boolean;
    hasAnyPermission: (resource: PermissionResource, actions: PermissionAction[]) => boolean;
    hasAllPermissions: (resource: PermissionResource, actions: PermissionAction[]) => boolean;
    hasRole: (role: UserRole | UserRole[]) => boolean;
    canAccessRoute: (routePath: string) => boolean;
    clearPermissions: () => void;
  };
}

declare module '@/composables/useErrorModal' {
  import type { Ref } from 'vue';
  export type ErrorCode = 401 | 403 | 404 | 422 | 429 | 500 | 502 | 503 | 504;
  export interface ErrorModalState {
    isOpen: boolean;
    statusCode?: number;
    message: string;
    description?: string;
    title?: string;
    buttonText?: string;
    iconColor?: string;
    buttonColor?: string;
  }
  export function showError(statusCode: ErrorCode, customMessage?: string): void;
  export function hideError(): void;
  export function useErrorModal(): {
    errorModalState: Ref<ErrorModalState>;
    showError: typeof showError;
    hideError: typeof hideError;
  };
}

declare module '@/composables/useDevice' {
  import type { Ref, ComputedRef } from 'vue';
  export function useDevice(): {
    deviceInfo: Ref<any>;
    networkInfo: Ref<any>;
    batteryInfo: Ref<any>;
    isOnline: Ref<boolean>;
    isNativeApp: ComputedRef<boolean>;
    isWebBrowser: ComputedRef<boolean>;
    isPWA: ComputedRef<boolean>;
    isMobile: ComputedRef<boolean>;
    isTablet: ComputedRef<boolean>;
    isDesktop: ComputedRef<boolean>;
    refresh: () => Promise<void>;
    getCurrentPosition: () => Promise<any>;
    requestBluetoothDevice: (options?: any) => Promise<any>;
    getNetworkInfo: () => any;
  };
}

declare module '@/composables/useForm' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface UseFormOptions<T> {
    validationSchema?: any;
    initialValues?: any;
    onSubmit?: (values: T) => void | Promise<void>;
  }
  export function useForm<T extends Record<string, any>>(options?: UseFormOptions<T>): {
    values: any;
    errors: any;
    isSubmitting: any;
    meta: any;
    handleSubmit: any;
    resetForm: any;
    setFieldValue: any;
    setValues: any;
  };
}

declare module '@/composables/useFormValidation' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export function useFormValidation<T extends Record<string, any>>(
    validationSchema?: any,
    initialValues?: any
  ): {
    handleSubmit: any;
    errors: any;
    resetForm: any;
    values: any;
    setFieldValue: any;
  };
  export function useFormField(name: string): {
    value: any;
    errorMessage: any;
    handleChange: any;
    handleBlur: any;
  };
}

declare module '@/stores/preferences' {
  export type AccentKey = 'indigo' | 'teal' | 'orange';
  export type Language = 'en' | 'ko' | 'zh';
  
  export function usePreferencesStore(): {
    darkMode: boolean;
    accent: AccentKey;
    language: Language;
    availableAccents: Array<{ key: AccentKey; hex: string }>;
    initTheme(): void;
    init(): void;
    setDarkMode(enabled: boolean): void;
    toggleDarkMode(): void;
    setAccent(accent: AccentKey): void;
    setLanguage(language: Language): void;
    initLanguage(): void;
  };
}

declare module '@/i18n' {
  import type { I18n } from 'vue-i18n';
  export const i18n: I18n;
  export default i18n;
}

declare module '@/api' {
  import type { AxiosInstance } from 'axios';
  export const httpClient: AxiosInstance;
  export const apiConfig: {
    baseURL: string;
    timeout: number;
    endpoints: {
      login: string;
      refresh: string;
      profile: string;
      systemStatus: string;
      posts: string;
      products: string;
      testError: string;
      permissions: string;
    };
  };
  export type RequestRetryConfig = boolean | Partial<{
    attempts: number;
    delayMs: number;
    multiplier: number;
    retryOnStatuses: number[];
    retryOnNetworkError: boolean;
  }>;
  export function setApiRequestHeaders(headers: Record<string, string>): void;
  export function mergeApiRequestHeaders(headers: Record<string, string | undefined>): void;
  export function clearApiRequestHeaders(...headerKeys: string[]): void;
  export function getApiRequestHeaders(): Record<string, string>;
}

declare module '@/api/services/system.service' {
  export type SystemStatus = {
    status: 'ok' | 'degraded';
    version: string;
    uptime: number;
  };
  export function fetchSystemStatus(): Promise<SystemStatus>;
}

declare module '@/api/services/auth.service' {
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
  export function login(payload: LoginPayload): Promise<LoginResponse>;
  export function logout(): void;
  export function getProfile(): Promise<LoginResponse['user']>;
}

declare module '@/api/services/posts.service' {
  export type Post = {
    id: number;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    views: number;
  };
  export function fetchPosts(): Promise<Post[]>;
  export function fetchPostById(id: number): Promise<Post>;
}

declare module '@/api/services/products.service' {
  export type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
    inStock: boolean;
  };
  export function fetchProducts(): Promise<Product[]>;
  export function fetchProductById(id: number): Promise<Product>;
}

declare module '@/api/services/errors.service' {
  export type ErrorCode = 401 | 403 | 404 | 422 | 429 | 500 | 502 | 503 | 504;
  export function testError(code: ErrorCode): Promise<any>;
}

declare module '@/types/form' {
  export * from './types/form';
}


