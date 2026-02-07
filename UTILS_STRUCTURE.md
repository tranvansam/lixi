# Utils Structure

Tổ chức cấu trúc `src/utils` theo 3 loại: **schemas**, **functions**, và **constants**.

## 📁 Cấu trúc thư mục

```
src/utils/
├── schemas/           # Validation schemas (yup)
│   ├── common.schema.ts
│   ├── auth.schema.ts
│   ├── user.schema.ts
│   └── index.ts
│
├── functions/         # Helper functions
│   ├── format.ts
│   ├── validation.ts
│   ├── helpers.ts
│   └── index.ts
│
├── constants/         # Constants & configs
│   ├── app.ts
│   ├── regex.ts
│   ├── api.ts
│   └── index.ts
│
└── index.ts          # Main entry point
```

---

## 1️⃣ Schemas (Validation)

### `schemas/common.schema.ts`

Các schema validation cơ bản, reusable:

```typescript
import { emailSchema, passwordSchema, phoneSchema, urlSchema } from '@/utils';

// Hoặc import trực tiếp
import { emailSchema } from '@/utils/schemas/common.schema';
```

**Available schemas:**
- `emailSchema` - Email validation
- `passwordSchema` - Password (min 6 chars)
- `confirmPasswordSchema(field)` - Confirm password match
- `requiredStringSchema(name)` - Required string
- `phoneSchema` - Phone number
- `urlSchema` - URL validation
- `numberSchema` - Number
- `positiveNumberSchema` - Positive number
- `checkboxSchema` - Checkbox (must be true)
- `dateSchema` - Date validation
- `minLengthSchema(min, name)` - Min length
- `maxLengthSchema(max, name)` - Max length

### `schemas/auth.schema.ts`

Schemas cho authentication:

```typescript
import { loginSchema, registerSchema, changePasswordSchema } from '@/utils';
```

**Available schemas:**
- `loginSchema` - Email + Password
- `registerSchema` - Full registration
- `forgotPasswordSchema` - Forgot password
- `resetPasswordSchema` - Reset password
- `changePasswordSchema` - Change password

### `schemas/user.schema.ts`

Schemas cho user-related forms:

```typescript
import { userProfileSchema, userSettingsSchema } from '@/utils';
```

**Available schemas:**
- `userProfileSchema` - User profile
- `userSettingsSchema` - User settings

---

## 2️⃣ Functions (Utilities)

### `functions/format.ts`

Functions để format dữ liệu:

```typescript
import { 
  formatCurrency, 
  formatDate, 
  formatPhoneNumber,
  truncateText,
  formatFileSize,
  capitalize,
  toTitleCase,
} from '@/utils';

// Usage
formatCurrency(1000); // "$1,000.00"
formatDate(new Date(), 'long'); // "January 1, 2024"
formatPhoneNumber('1234567890'); // "(123) 456-7890"
truncateText('Long text...', 10); // "Long te..."
formatFileSize(1024); // "1 KB"
capitalize('hello'); // "Hello"
toTitleCase('hello world'); // "Hello World"
```

### `functions/validation.ts`

Functions để kiểm tra validation:

```typescript
import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isStrongPassword,
  isEmpty,
  isNumeric,
  isValidCreditCard,
} from '@/utils';

// Usage
isValidEmail('test@email.com'); // true
isValidPhone('+1234567890'); // true
isValidUrl('https://example.com'); // true
isStrongPassword('Test@123'); // true
isEmpty('  '); // true
isNumeric('123'); // true
isValidCreditCard('4532015112830366'); // true
```

### `functions/helpers.ts`

Helper functions tiện ích:

```typescript
import {
  delay,
  debounce,
  throttle,
  generateId,
  deepClone,
  removeDuplicates,
  groupBy,
  sortBy,
  pick,
  omit,
} from '@/utils';

// Usage
await delay(1000); // Wait 1 second

const debouncedFn = debounce(() => console.log('Called'), 300);
const throttledFn = throttle(() => console.log('Called'), 1000);

generateId(); // "aBc123XyZ9"

const cloned = deepClone(originalObj);

removeDuplicates([1, 2, 2, 3]); // [1, 2, 3]

groupBy(users, 'role'); // { admin: [...], user: [...] }

sortBy(users, 'name', 'asc');

pick(user, ['id', 'name']); // { id: 1, name: 'John' }
omit(user, ['password']); // User without password field
```

---

## 3️⃣ Constants

### `constants/app.ts`

App-level constants:

```typescript
import {
  APP_NAME,
  APP_VERSION,
  DATE_FORMAT,
  PAGINATION,
  FILE_UPLOAD,
  TIMEOUT,
  STORAGE_KEYS,
} from '@/utils';

// Usage
console.log(APP_NAME); // "Ionic Vue Starter"
console.log(DATE_FORMAT.SHORT); // "MM/DD/YYYY"
console.log(PAGINATION.DEFAULT_PAGE_SIZE); // 10
console.log(FILE_UPLOAD.MAX_FILE_SIZE); // 5242880 (5MB)
console.log(TIMEOUT.API_REQUEST); // 30000
console.log(STORAGE_KEYS.ACCESS_TOKEN); // "app-access-token"
```

### `constants/regex.ts`

Regex patterns:

```typescript
import { REGEX_PATTERNS } from '@/utils';

// Usage
REGEX_PATTERNS.EMAIL.test('test@email.com'); // true
REGEX_PATTERNS.PHONE.test('+1234567890'); // true
REGEX_PATTERNS.PASSWORD_STRONG.test('Test@123'); // true
REGEX_PATTERNS.USERNAME.test('john_doe'); // true
REGEX_PATTERNS.HEX_COLOR.test('#FF5733'); // true
```

**Available patterns:**
- `EMAIL`, `PHONE`, `URL`
- `PASSWORD_STRONG`
- `NUMBERS_ONLY`, `ALPHANUMERIC`
- `USERNAME`, `HEX_COLOR`
- `IP_ADDRESS`, `CREDIT_CARD`
- `DATE_ISO`, `TIME_24H`

### `constants/api.ts`

API-related constants:

```typescript
import { HTTP_STATUS, HTTP_METHODS, CONTENT_TYPES } from '@/utils';

// Usage
if (response.status === HTTP_STATUS.OK) { }
if (error.status === HTTP_STATUS.UNAUTHORIZED) { }

fetch(url, { method: HTTP_METHODS.POST });

headers: { 'Content-Type': CONTENT_TYPES.JSON }
```

---

## 🎯 Import Examples

### Import from main entry point (recommended)

```typescript
// Import bất kỳ utils nào từ entry point
import {
  // Schemas
  loginSchema,
  emailSchema,
  passwordSchema,
  
  // Functions
  formatCurrency,
  isValidEmail,
  debounce,
  
  // Constants
  APP_NAME,
  HTTP_STATUS,
  REGEX_PATTERNS,
} from '@/utils';
```

### Import from specific modules

```typescript
// Import từ module cụ thể nếu cần
import { loginSchema } from '@/utils/schemas/auth.schema';
import { formatCurrency } from '@/utils/functions/format';
import { HTTP_STATUS } from '@/utils/constants/api';
```

---

## 📝 Best Practices

### 1. Schemas
- Tạo file schema riêng cho mỗi module (auth, user, product, etc.)
- Reuse common schemas từ `common.schema.ts`
- Export schema dạng object với tên rõ ràng

```typescript
// ✅ Good
export const loginSchema = yup.object({ ... });
export const registerSchema = yup.object({ ... });

// ❌ Bad
export default yup.object({ ... });
```

### 2. Functions
- Nhóm functions theo purpose (format, validation, helpers)
- Mỗi function nên có JSDoc comment
- Type-safe với TypeScript

```typescript
// ✅ Good
/**
 * Format currency value
 */
export const formatCurrency = (value: number, currency = 'USD'): string => { ... }

// ❌ Bad
export const format = (v: any) => { ... }
```

### 3. Constants
- Use UPPER_CASE cho constants
- Group constants theo domain
- Use `as const` cho readonly objects

```typescript
// ✅ Good
export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
} as const;

// ❌ Bad
export let status = { ok: 200 };
```

---

## 🔄 Migration from old structure

Nếu code cũ import từ `@/utils/validation`, update như sau:

```typescript
// Old
import { loginSchema } from '@/utils/validation';

// New
import { loginSchema } from '@/utils';
// hoặc
import { loginSchema } from '@/utils/schemas/auth.schema';
```

Cả 2 cách đều work vì `src/utils/index.ts` re-export tất cả.

---

## 🎨 Summary

| Loại | Mục đích | Example |
|------|----------|---------|
| **schemas/** | Validation với yup | `loginSchema`, `emailSchema` |
| **functions/** | Helper utilities | `formatCurrency`, `debounce` |
| **constants/** | Static values | `HTTP_STATUS`, `APP_NAME` |

Tất cả đều có thể import từ `@/utils` hoặc import trực tiếp từ file cụ thể.

