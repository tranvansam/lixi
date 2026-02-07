import * as yup from 'yup';
import { emailSchema, passwordSchema, confirmPasswordSchema, checkboxSchema } from './common.schema';

// Login schema
export const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});

// Register schema
export const registerSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema('password'),
  acceptTerms: checkboxSchema,
});

// Forgot password schema
export const forgotPasswordSchema = yup.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = yup.object({
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema('password'),
});

// Change password schema
export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: confirmPasswordSchema('newPassword'),
});

