// Extend Axios types to support retry options
import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: boolean | {
      attempts?: number;
      delayMs?: number;
      multiplier?: number;
      retryOnStatuses?: number[];
      retryOnNetworkError?: boolean;
    };
  }
}

