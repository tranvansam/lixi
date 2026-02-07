import { useForm, useField } from 'vee-validate';
import type { ObjectSchema } from 'yup';

export const useFormValidation = <T extends Record<string, any>>(
  validationSchema?: ObjectSchema<T>,
  initialValues?: any // Use 'any' to match vee-validate's flexible type
) => {
  const { handleSubmit, errors, resetForm, values, setFieldValue } = useForm({
    validationSchema,
    initialValues: initialValues || {},
  });

  // Return direct refs from vee-validate
  return {
    handleSubmit,
    errors,      // Direct ref
    resetForm,
    values,      // Direct ref
    setFieldValue,
  };
};

export const useFormField = (name: string) => {
  const { value, errorMessage, handleChange, handleBlur } = useField(name);

  // Return direct refs from vee-validate
  return {
    value,        // Direct ref
    errorMessage, // Direct ref
    handleChange,
    handleBlur,
  };
};

