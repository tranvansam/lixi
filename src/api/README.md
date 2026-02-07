# API Client Documentation

Tài liệu hướng dẫn sử dụng API Client với đầy đủ tính năng: authentication, token refresh tự động, custom headers, retry mechanism.

## Mục lục

- [Cấu hình cơ bản](#cấu-hình-cơ-bản)
- [Authentication](#authentication)
- [Custom Headers](#custom-headers)
- [Retry Mechanism](#retry-mechanism)
- [Tạo Service mới](#tạo-service-mới)
- [Sử dụng trong Components](#sử-dụng-trong-components)

---

## Cấu hình cơ bản

### Import HTTP Client

```typescript
import { httpClient, apiConfig } from '@/api';
```

### Import Services

```typescript
import { login, logout, getProfile } from '@/api/services/auth.service';
import { fetchSystemStatus } from '@/api/services/system.service';
```

---

## Authentication

### Login

API tự động lưu access token và refresh token vào cookies sau khi login thành công.

```typescript
import { login } from '@/api/services/auth.service';

// Login với email và password
const response = await login({
  email: 'admin@example.com',
  password: 'admin123',
});

console.log(response.user); // { id: 1, email: '...', name: '...' }
console.log(response.tokens); // { accessToken: '...', refreshToken: '...', expiresIn: 900 }
```

**Lưu ý:** Tokens được tự động lưu vào cookies, không cần xử lý thủ công.

### Logout

Xóa tất cả tokens khỏi cookies.

```typescript
import { logout } from '@/api/services/auth.service';

logout(); // Xóa access token và refresh token
```

### Lấy thông tin user

API tự động gửi access token trong header `Authorization: Bearer <token>`.

```typescript
import { getProfile } from '@/api/services/auth.service';

const user = await getProfile();
console.log(user); // { id: 1, email: '...', name: '...' }
```

### Token Refresh tự động

Khi API trả về `401 Unauthorized`, hệ thống sẽ:
1. Tự động gọi `/auth/refresh` với refresh token
2. Lưu tokens mới vào cookies
3. Retry request ban đầu với token mới
4. Nếu refresh thất bại → xóa tokens và reject request

**Không cần xử lý thủ công**, tất cả được xử lý tự động bởi interceptor.

---

## Custom Headers

### Set headers toàn cục

Headers này sẽ được thêm vào **tất cả** requests tiếp theo.

```typescript
import { setApiRequestHeaders, mergeApiRequestHeaders, clearApiRequestHeaders } from '@/api';

// Set toàn bộ headers (ghi đè tất cả headers cũ)
setApiRequestHeaders({
  'x-tenant-id': 'tenant-123',
  'x-api-version': 'v2',
});

// Merge headers (thêm/bổ sung headers)
mergeApiRequestHeaders({
  'x-user-id': 'user-456',
  'x-locale': 'vi',
});

// Xóa một hoặc nhiều headers
clearApiRequestHeaders('x-tenant-id', 'x-user-id');

// Xóa tất cả headers
clearApiRequestHeaders();
```

### Set headers cho từng request

Headers này chỉ áp dụng cho **request cụ thể** đó.

```typescript
import { httpClient } from '@/api';

// Thêm header cho một request cụ thể
const response = await httpClient.get('/api/data', {
  headers: {
    'x-custom-header': 'custom-value',
    'x-demo': 'demo-value',
  },
});
```

**Lưu ý:** Headers trong request config sẽ merge với headers toàn cục, nhưng request headers có priority cao hơn.

---

## Retry Mechanism

### Cấu hình mặc định

```typescript
{
  enabled: false,              // Mặc định tắt retry
  attempts: 3,                 // Số lần retry tối đa
  delayMs: 500,                // Delay ban đầu (ms)
  multiplier: 2,               // Hệ số tăng delay (exponential backoff)
  retryOnStatuses: [408, 425, 429, 500, 502, 503, 504], // HTTP status codes sẽ retry
  retryOnNetworkError: true,   // Retry khi lỗi mạng (timeout, network error)
}
```

### Sử dụng Retry

#### 1. Không retry (mặc định)

```typescript
import { httpClient } from '@/api';

// Không retry
const response = await httpClient.get('/api/data');
```

#### 2. Retry với config mặc định

```typescript
import { httpClient } from '@/api';

// Retry với config mặc định: 3 lần, delay 500ms, multiplier 2
const response = await httpClient.get('/api/data', {
  retry: true,
});
```

**Delay pattern:** 500ms → 1000ms → 2000ms (exponential backoff)

#### 3. Retry với config tùy chỉnh

```typescript
import { httpClient } from '@/api';

// Retry 5 lần, delay ban đầu 1000ms
const response = await httpClient.get('/api/data', {
  retry: {
    attempts: 5,
    delayMs: 1000,
  },
});

// Retry với multiplier tùy chỉnh
const response2 = await httpClient.post('/api/data', data, {
  retry: {
    attempts: 3,
    delayMs: 300,
    multiplier: 1.5, // Delay: 300ms → 450ms → 675ms
  },
});

// Chỉ retry với các status codes cụ thể
const response3 = await httpClient.get('/api/data', {
  retry: {
    attempts: 3,
    retryOnStatuses: [500, 502, 503], // Chỉ retry khi server error
  },
});

// Tắt retry khi lỗi mạng
const response4 = await httpClient.get('/api/data', {
  retry: {
    attempts: 3,
    retryOnNetworkError: false, // Không retry khi network error
  },
});
```

### Ví dụ trong Service

```typescript
import { httpClient, apiConfig } from '@/api';

export const fetchSystemStatus = async (retry?: boolean | Partial<{
  attempts: number;
  delayMs: number;
  multiplier: number;
  retryOnStatuses: number[];
  retryOnNetworkError: boolean;
}>) => {
  const { data } = await httpClient.get(apiConfig.endpoints.systemStatus, {
    retry: retry ?? false, // Mặc định không retry
  });
  return data;
};

// Sử dụng
await fetchSystemStatus(); // Không retry
await fetchSystemStatus(true); // Retry với config mặc định
await fetchSystemStatus({ attempts: 5, delayMs: 1000 }); // Retry tùy chỉnh
```

---

## Tạo Service mới

### Cấu trúc Service

Tạo file mới trong `src/api/services/`:

```typescript
// src/api/services/orders.service.ts
import { httpClient, apiConfig } from '@/api';

export type Order = {
  id: number;
  userId: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
};

export type CreateOrderPayload = {
  items: Array<{ productId: number; quantity: number }>;
};

// API không cần token (public)
export const getPublicOrders = async () => {
  const { data } = await httpClient.get<Order[]>('/orders/public');
  return data;
};

// API cần token (tự động gửi trong header)
export const getUserOrders = async (userId: number) => {
  const { data } = await httpClient.get<Order[]>(`/orders/user/${userId}`);
  return data;
};

// API với retry
export const createOrder = async (payload: CreateOrderPayload) => {
  const { data } = await httpClient.post<Order>('/orders', payload, {
    retry: true, // Retry nếu lỗi
  });
  return data;
};

// API với retry tùy chỉnh
export const updateOrder = async (orderId: number, updates: Partial<Order>) => {
  const { data } = await httpClient.put<Order>(`/orders/${orderId}`, updates, {
    retry: {
      attempts: 5,
      delayMs: 1000,
      retryOnStatuses: [500, 502, 503],
    },
  });
  return data;
};

// API với custom header cho request này
export const getOrderWithTenant = async (orderId: number, tenantId: string) => {
  const { data } = await httpClient.get<Order>(`/orders/${orderId}`, {
    headers: {
      'x-tenant-id': tenantId,
    },
  });
  return data;
};
```

### Export Service

Thêm vào `src/api/services/index.ts`:

```typescript
export * from './auth.service';
export * from './system.service';
export * from './orders.service'; // Thêm dòng này
```

---

## Sử dụng trong Components

### Vue Component với Composition API

```vue
<template>
  <div>
    <button @click="handleLogin">Login</button>
    <button @click="handleFetchData">Fetch Data</button>
    <button @click="handleFetchWithRetry">Fetch with Retry</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { login, getProfile } from '@/api/services/auth.service';
import { fetchSystemStatus } from '@/api/services/system.service';
import { setApiRequestHeaders, mergeApiRequestHeaders } from '@/api';

const user = ref(null);
const systemStatus = ref(null);

// Login
const handleLogin = async () => {
  try {
    const response = await login({
      email: 'admin@example.com',
      password: 'admin123',
    });
    user.value = response.user;
    console.log('Login thành công!');
  } catch (error) {
    console.error('Login thất bại:', error);
  }
};

// Fetch data (tự động gửi token)
const handleFetchData = async () => {
  try {
    // Set header toàn cục trước khi gọi API
    mergeApiRequestHeaders({
      'x-user-id': '123',
    });

    const profile = await getProfile();
    const status = await fetchSystemStatus();
    
    user.value = profile;
    systemStatus.value = status;
  } catch (error) {
    console.error('Fetch data thất bại:', error);
  }
};

// Fetch với retry
const handleFetchWithRetry = async () => {
  try {
    const status = await fetchSystemStatus(true); // Retry với config mặc định
    systemStatus.value = status;
  } catch (error) {
    console.error('Fetch với retry thất bại:', error);
  }
};
</script>
```

### Vue Component với Pinia Store

```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia';
import { login, logout, getProfile } from '@/api/services/auth.service';
import type { LoginPayload, LoginResponse } from '@/api/services/auth.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as LoginResponse['user'] | null,
    isLoading: false,
  }),

  actions: {
    async loginUser(payload: LoginPayload) {
      this.isLoading = true;
      try {
        const response = await login(payload);
        this.user = response.user;
        return response;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProfile() {
      try {
        const profile = await getProfile();
        this.user = profile;
        return profile;
      } catch (error) {
        console.error('Fetch profile failed:', error);
        throw error;
      }
    },

    logoutUser() {
      logout();
      this.user = null;
    },
  },
});
```

---

## Best Practices

### 1. Error Handling

```typescript
import { AxiosError } from 'axios';

try {
  const data = await fetchSystemStatus();
} catch (error) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      // Token đã hết hạn, đã được refresh tự động
      // Nếu vẫn lỗi → refresh token cũng hết hạn
      console.log('Cần login lại');
    } else if (error.response?.status === 404) {
      console.log('Không tìm thấy resource');
    } else {
      console.log('Lỗi server:', error.response?.status);
    }
  } else {
    console.log('Lỗi network:', error);
  }
}
```

### 2. Sử dụng Retry hợp lý

- **Nên retry:** GET requests, idempotent operations
- **Không nên retry:** POST requests tạo dữ liệu mới (trừ khi API idempotent)
- **Retry với delay lớn hơn:** Khi server đang quá tải (429 Too Many Requests)

```typescript
// ✅ Nên: GET request với retry
await httpClient.get('/api/data', { retry: true });

// ✅ Nên: POST idempotent với retry
await httpClient.post('/api/orders', payload, {
  retry: { attempts: 3, delayMs: 1000 },
});

// ❌ Không nên: POST tạo dữ liệu mới (có thể duplicate)
await httpClient.post('/api/users', userData); // Không retry
```

### 3. Custom Headers

```typescript
// Set headers toàn cục khi app khởi động
import { setApiRequestHeaders } from '@/api';

// Trong main.ts hoặc khi user login
setApiRequestHeaders({
  'x-api-version': 'v1',
  'x-client-version': '1.0.0',
});

// Set headers động khi user thay đổi tenant
import { mergeApiRequestHeaders } from '@/api';

const switchTenant = (tenantId: string) => {
  mergeApiRequestHeaders({
    'x-tenant-id': tenantId,
  });
};
```

### 4. Type Safety

Luôn sử dụng TypeScript types cho request/response:

```typescript
import type { SystemStatus } from '@/api/services/system.service';

const status: SystemStatus = await fetchSystemStatus();
// TypeScript sẽ autocomplete và check types
```

---

## Troubleshooting

### Token không được gửi

- Kiểm tra cookies có `app-access-token` không
- Kiểm tra domain/path của cookies có đúng không

### Retry không hoạt động

- Đảm bảo `retry: true` hoặc truyền config object
- Kiểm tra status code có trong `retryOnStatuses` không
- Kiểm tra `attempts` đã đạt giới hạn chưa

### Headers không được gửi

- Headers toàn cục: Kiểm tra đã gọi `setApiRequestHeaders` hoặc `mergeApiRequestHeaders` chưa
- Headers request: Kiểm tra syntax trong config object

---

## API Endpoints

Chỉ cần config base URL trong file `.env`:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:4000
```

Các endpoints được hardcode trong code:

### Authentication

- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token (tự động)
- `GET /me` - Lấy thông tin user

### System

- `GET /system/status` - Lấy trạng thái hệ thống

### Posts

- `GET /posts` - Lấy danh sách bài viết
- `GET /posts/:id` - Lấy chi tiết bài viết

### Products

- `GET /products` - Lấy danh sách sản phẩm
- `GET /products/:id` - Lấy chi tiết sản phẩm

---

## Mock API

Để test API, chạy mock server:

```bash
npm run mock:server
```

Mock server sẽ chạy tại `http://localhost:4000` (hoặc port khác nếu 4000 bận).

**Test accounts:**
- `admin@example.com` / `admin123`
- `demo@example.com` / `demo123`

