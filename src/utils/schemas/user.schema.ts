import * as yup from 'yup';
import { emailSchema, phoneSchema } from './common.schema';

// User profile schema
export const userProfileSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  bio: yup.string().max(500, 'Bio must be at most 500 characters').optional(),
  avatar: yup.string().url('Invalid avatar URL').optional(),
});

// User settings schema
export const userSettingsSchema = yup.object({
  language: yup.string().required('Language is required'),
  timezone: yup.string().required('Timezone is required'),
  notifications: yup.boolean(),
});

