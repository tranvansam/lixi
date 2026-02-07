import * as yup from 'yup';

// Common validation schemas - các schema validation cơ bản
export const emailSchema = yup
  .string()
  .required('Email is required')
  .email('Invalid email format');

export const passwordSchema = yup
  .string()
  .required('Password is required')
  .min(6, 'Password must be at least 6 characters');

export const confirmPasswordSchema = (passwordField = 'password') =>
  yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref(passwordField)], 'Passwords must match');

export const requiredStringSchema = (fieldName: string) =>
  yup.string().required(`${fieldName} is required`);

export const phoneSchema = yup
  .string()
  .required('Phone number is required')
  .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format');

export const urlSchema = yup
  .string()
  .required('URL is required')
  .url('Invalid URL format');

export const numberSchema = yup
  .number()
  .required('This field is required')
  .typeError('Must be a number');

export const positiveNumberSchema = yup
  .number()
  .required('This field is required')
  .positive('Must be a positive number')
  .typeError('Must be a number');

export const checkboxSchema = yup
  .boolean()
  .oneOf([true], 'You must accept this');

export const dateSchema = yup
  .date()
  .required('Date is required')
  .typeError('Invalid date format');

export const minLengthSchema = (min: number, fieldName = 'This field') =>
  yup.string().min(min, `${fieldName} must be at least ${min} characters`);

export const maxLengthSchema = (max: number, fieldName = 'This field') =>
  yup.string().max(max, `${fieldName} must be at most ${max} characters`);

