# Form Components Guide

Hướng dẫn sử dụng các common form components với validation tích hợp sẵn.

## Installation

Dependencies đã được cài đặt:
- `vee-validate` - Form validation
- `yup` - Schema validation

## Components

### 1. FormInput

Input field với validation tích hợp.

```vue
<FormInput
  name="email"
  label="Email"
  type="email"
  placeholder="Enter your email"
  :disabled="false"
  :readonly="false"
/>
```

**Props:**
- `name` (required): Tên field, dùng cho validation
- `label`: Label hiển thị
- `type`: Loại input (`text`, `email`, `password`, `number`, `tel`, `url`, `search`)
- `placeholder`: Placeholder text
- `disabled`: Disable input
- `readonly`: Readonly mode
- `modelValue`: Giá trị input (v-model)

### 2. FormCheckbox

Checkbox với validation.

```vue
<FormCheckbox
  name="acceptTerms"
  label="I accept the terms"
  helper-text="Please read and accept our terms"
  :model-value="false"
/>
```

**Props:**
- `name` (required): Tên field
- `label`: Label hiển thị
- `helperText`: Text hướng dẫn
- `disabled`: Disable checkbox
- `modelValue`: Giá trị boolean (v-model)

### 3. FormRadio

Radio buttons với validation.

```vue
<FormRadio
  name="gender"
  label="Gender"
  :options="genderOptions"
  :model-value="''"
/>

<script setup>
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];
</script>
```

**Props:**
- `name` (required): Tên field
- `label`: Label hiển thị
- `options` (required): Array các options `{ label, value, disabled? }`
- `disabled`: Disable tất cả radio buttons
- `modelValue`: Giá trị được chọn (v-model)

### 4. FormSelect

Select dropdown với validation.

```vue
<FormSelect
  name="country"
  label="Country"
  placeholder="Select your country"
  :options="countryOptions"
  :multiple="false"
/>

<script setup>
const countryOptions = [
  { label: 'Vietnam', value: 'vn' },
  { label: 'Korea', value: 'kr' },
  { label: 'China', value: 'cn' },
];
</script>
```

**Props:**
- `name` (required): Tên field
- `label`: Label hiển thị
- `placeholder`: Placeholder text
- `options` (required): Array các options `{ label, value, disabled? }`
- `multiple`: Cho phép chọn nhiều
- `disabled`: Disable select
- `modelValue`: Giá trị được chọn (v-model)

### 5. FormButton

Button component với loading state.

```vue
<FormButton
  type="submit"
  color="primary"
  fill="solid"
  size="default"
  expand="block"
  :loading="isSubmitting"
  :disabled="false"
  @click="handleClick"
>
  Submit
</FormButton>
```

**Props:**
- `type`: Button type (`button`, `submit`, `reset`)
- `color`: Màu (`primary`, `secondary`, `tertiary`, `success`, `warning`, `danger`, `light`, `medium`, `dark`)
- `fill`: Style (`clear`, `outline`, `solid`, `default`)
- `size`: Kích thước (`small`, `default`, `large`)
- `expand`: Chiều rộng (`block`, `full`)
- `loading`: Hiển thị loading spinner
- `disabled`: Disable button

### 6. TabsWrapper

Tabs component.

```vue
<TabsWrapper v-model="activeTab" :tabs="tabs">
  <div v-if="activeTab === 'tab1'">Tab 1 Content</div>
  <div v-if="activeTab === 'tab2'">Tab 2 Content</div>
</TabsWrapper>

<script setup>
const activeTab = ref('tab1');
const tabs = [
  { label: 'Tab 1', value: 'tab1', icon: homeOutline },
  { label: 'Tab 2', value: 'tab2', icon: settingsOutline, disabled: false },
];
</script>
```

**Props:**
- `tabs` (required): Array các tabs `{ label, value, icon?, disabled? }`
- `modelValue` (required): Tab hiện tại đang active (v-model)

## Validation

### useForm Composable

```typescript
import { useForm } from '@/composables/useForm';
import * as yup from 'yup';

const validationSchema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup.string().required('Password is required').min(6, 'Min 6 chars'),
});

const { handleSubmit, isSubmitting, values, errors } = useForm({
  validationSchema,
  initialValues: {
    email: '',
    password: '',
  },
  onSubmit: async (values) => {
    console.log('Form submitted:', values);
    // Handle form submission
  },
});
```

### Validation Schemas

File `src/utils/schemas/` chứa các schema validation có sẵn:

```typescript
import { loginSchema, registerSchema, emailSchema, passwordSchema } from '@/utils';

// Sử dụng schema có sẵn
const { handleSubmit } = useForm({
  validationSchema: loginSchema,
  onSubmit: handleLogin,
});

// Hoặc tạo schema tùy chỉnh
import * as yup from 'yup';

const customSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: emailSchema,
  phone: phoneSchema,
  age: positiveNumberSchema,
  acceptTerms: checkboxSchema,
});
```

Xem thêm tại [`UTILS_STRUCTURE.md`](./UTILS_STRUCTURE.md) để biết thêm về schemas, functions, và constants.

## Complete Example

```vue
<template>
  <form @submit="handleSubmit">
    <FormInput
      name="email"
      label="Email"
      type="email"
      placeholder="Enter your email"
    />

    <FormInput
      name="password"
      label="Password"
      type="password"
      placeholder="Enter your password"
    />

    <FormCheckbox
      name="rememberMe"
      label="Remember me"
    />

    <FormButton
      type="submit"
      expand="block"
      :loading="isSubmitting"
    >
      Login
    </FormButton>
  </form>
</template>

<script setup lang="ts">
import { FormInput, FormCheckbox, FormButton } from '@/components/common';
import { useForm } from '@/composables/useForm';
import { loginSchema } from '@/utils/validation';

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: '',
    password: '',
    rememberMe: false,
  },
  onSubmit: async (values) => {
    console.log('Login:', values);
    // Call API
  },
});
</script>
```

## Features

- ✅ Tích hợp validation với `vee-validate` + `yup`
- ✅ Tự động hiển thị error messages
- ✅ Type-safe với TypeScript
- ✅ Ionic design system
- ✅ Loading states
- ✅ Disabled states
- ✅ Helper text support
- ✅ Reusable và dễ customize

## Demo Page

Xem demo tại: `src/views/FormExamplePage.vue`

