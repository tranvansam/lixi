import { useForm as useVeeValidateForm } from 'vee-validate';
import type { ObjectSchema } from 'yup';

export interface UseFormOptions<T> {
  validationSchema?: ObjectSchema<any>;
  initialValues?: any; // Use 'any' to match vee-validate's flexible type
  onSubmit?: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, any>>(options: UseFormOptions<T> = {}) => {
  const {
    handleSubmit,
    resetForm,
    setFieldValue,
    setValues,
    values,
    errors,
    isSubmitting,
    meta,
  } = useVeeValidateForm({
    validationSchema: options.validationSchema,
    initialValues: options.initialValues,
  });

  const onSubmit = handleSubmit(async (formValues) => {
    if (options.onSubmit) {
      await options.onSubmit(formValues as T);
    }
  });

  // Return direct refs from vee-validate
  return {
    values,        // Direct ref
    errors,        // Direct ref
    isSubmitting,  // Direct ref
    meta,          // Direct ref
    handleSubmit: onSubmit,
    resetForm,
    setFieldValue,
    setValues,
  };
};

