export type ErrorCode = 401 | 403 | 404 | 422 | 429 | 500 | 502 | 503 | 504;

export interface ErrorModalState {
  isOpen: boolean;
  statusCode?: ErrorCode;
  message: string;
  description?: string;
  title?: string;
  buttonText?: string;
  iconColor?: string;
  buttonColor?: string;
}

export interface ErrorModalProps {
  isOpen: boolean;
  statusCode?: ErrorCode;
  message?: string;
  description?: string;
  title?: string;
  buttonText?: string;
  iconColor?: string;
  buttonColor?: string;
}
