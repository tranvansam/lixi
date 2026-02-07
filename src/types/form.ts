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
