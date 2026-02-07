// App constants - các hằng số của app

export const APP_NAME = 'Ionic Vue Starter';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'A modern Ionic Vue starter template';

// Date formats
export const DATE_FORMAT = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  TIME: 'HH:mm:ss',
  DATETIME: 'MM/DD/YYYY HH:mm:ss',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// File upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Timeouts
export const TIMEOUT = {
  API_REQUEST: 30000, // 30 seconds
  DEBOUNCE: 300, // 300ms
  TOAST_DURATION: 3000, // 3 seconds
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'app-user',
  LANGUAGE: 'app-language',
  THEME: 'app-theme',
  ACCESS_TOKEN: 'app-access-token',
  REFRESH_TOKEN: 'app-refresh-token',
} as const;

