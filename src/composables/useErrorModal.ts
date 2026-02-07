import { ref } from 'vue';
import { i18n } from '@/i18n';
import type { ErrorModalState, ErrorCode } from '@/types/error-modal';

/**
 * Composable for managing error modal state
 * 
 * Sử dụng singleton pattern - TẤT CẢ components/functions share CÙNG một ref
 */

// Singleton state - GLOBAL ref được share
const errorModalState = ref<ErrorModalState>({
  isOpen: false,
  message: '',
});

/**
 * Get error configuration based on status code
 */
const getErrorConfig = (statusCode: ErrorCode, t: (key: string) => string) => {
  const errorKey = `errors.${statusCode}`;
  
  return {
    title: t(`${errorKey}.title`) !== `${errorKey}.title` ? t(`${errorKey}.title`) : t('errors.default.title'),
    message: t(`${errorKey}.message`) !== `${errorKey}.message` ? t(`${errorKey}.message`) : t('errors.default.message'),
    description: t(`${errorKey}.description`) !== `${errorKey}.description` ? t(`${errorKey}.description`) : undefined,
    buttonText: t('errors.buttonText'),
    iconColor: getIconColor(statusCode),
    buttonColor: 'primary' as const,
  };
};

/**
 * Get icon color based on status code
 */
const getIconColor = (statusCode: ErrorCode): string => {
  if (statusCode >= 400 && statusCode < 500) {
    return 'warning';
  }
  if (statusCode >= 500) {
    return 'danger';
  }
  return 'danger';
};

/**
 * Show error modal - GLOBAL function
 */
export const showError = (statusCode: ErrorCode, customMessage?: string) => {
  console.log('🚨 showError called with statusCode:', statusCode);
  const t = i18n.global.t;
  const errorConfig = getErrorConfig(statusCode, t);

  errorModalState.value = {
    isOpen: true,
    statusCode,
    message: customMessage || errorConfig.message,
    description: errorConfig.description,
    title: errorConfig.title,
    buttonText: errorConfig.buttonText,
    iconColor: errorConfig.iconColor,
    buttonColor: errorConfig.buttonColor,
  };

  console.log('✅ Error modal state updated:', errorModalState.value);
};

/**
 * Hide error modal - GLOBAL function
 */
export const hideError = () => {
  console.log('🔒 hideError called');
  errorModalState.value = {
    ...errorModalState.value,
    isOpen: false,
  };
};

/**
 * Composable để access global state
 */
export const useErrorModal = () => {
  return {
    // Return GLOBAL ref
    errorModalState,
    showError,
    hideError,
  };
};
