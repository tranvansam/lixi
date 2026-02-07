# Permissions & Authorization System

Hệ thống quản lý quyền và authorization đầy đủ với permission checking, role-based access control (RBAC), route guards, và directives.

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Setup](#setup)
3. [Usage](#usage)
4. [API](#api)
5. [Router Configuration](#router-configuration)
6. [Directives](#directives)
7. [Testing](#testing)

---

## Architecture

### Components

```
src/
├── types/permission.ts              # Permission types
├── api/services/permission.service.ts  # API calls
├── composables/usePermissions.ts    # Permission composable
├── router/
│   ├── guards/permission.guard.ts   # Route guard
│   └── routes/
│       ├── auth.routes.ts          # Auth routes
│       ├── admin.routes.ts         # Admin routes
│       ├── user.routes.ts          # User routes
│       ├── common.routes.ts        # Common routes
│       └── index.ts                # Routes aggregator
├── directives/v-permission.ts       # Custom directives
└── views/
    ├── PermissionDemoPage.vue      # Demo page
    ├── ForbiddenPage.vue           # 403 page
    └── NotFoundPage.vue            # 404 page
```

---

## Setup

### 1. Mock Data

File `mock/data/users.json` đã được cập nhật với roles:

```json
[
  { "id": 1, "email": "admin@example.com", "password": "admin123", "role": "admin" },
  { "id": 2, "email": "manager@example.com", "password": "manager123", "role": "manager" },
  { "id": 3, "email": "user@example.com", "password": "user123", "role": "user" },
  { "id": 4, "email": "guest@example.com", "password": "guest123", "role": "guest" }
]
```

### 2. Mock API

Module `mock/modules/permissions.js` cung cấp 2 endpoints:

- `GET /permissions/me` - Lấy permissions của user hiện tại
- `POST /permissions/check` - Kiểm tra permission cụ thể

**Role Permissions:**

| Role    | Resources | Actions |
|---------|-----------|---------|
| admin   | All       | All     |
| manager | users, products, posts, orders, settings, dashboard, reports | view, create, edit, export |
| user    | products, posts, dashboard | view, create (posts only) |
| guest   | None      | None    |

---

## Usage

### 1. Load Permissions

Trong component hoặc page:

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';

const { loadPermissions, userPermissions } = usePermissions();

onMounted(async () => {
  await loadPermissions();
  console.log(userPermissions.value);
});
</script>
```

### 2. Check Permissions in Component

```vue
<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions';

const { hasPermission, hasRole, isAdmin } = usePermissions();

// Check single permission
const canEditUsers = hasPermission('users', 'edit');

// Check role
const isUserAdmin = isAdmin.value;
const isManagerOrAdmin = hasRole(['admin', 'manager']);
</script>

<template>
  <ion-button v-if="canEditUsers" @click="editUser">
    Edit User
  </ion-button>

  <div v-if="isAdmin">
    Admin only content
  </div>
</template>
```

### 3. Using Directives

#### v-permission

Ẩn element nếu không có permission:

```vue
<template>
  <ion-button
    v-permission="{ resource: 'users', action: 'delete' }"
    color="danger"
    @click="deleteUser"
  >
    Delete User
  </ion-button>
</template>
```

#### v-role

Ẩn element nếu không có role:

```vue
<template>
  <!-- Single role -->
  <div v-role="'admin'">
    Admin only section
  </div>

  <!-- Multiple roles -->
  <div v-role="['admin', 'manager']">
    Admin or Manager section
  </div>
</template>
```

### 4. Programmatic Permission Checks

```typescript
import { usePermissions } from '@/composables/usePermissions';

const {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  canAccessRoute,
} = usePermissions();

// Single permission
if (hasPermission('users', 'edit')) {
  // Do something
}

// Any of multiple permissions
if (hasAnyPermission('products', ['create', 'edit'])) {
  // Do something
}

// All permissions required
if (hasAllPermissions('users', ['view', 'edit', 'delete'])) {
  // Do something
}

// Check role
if (hasRole('admin')) {
  // Admin only logic
}

// Check route access
if (canAccessRoute('/admin/users')) {
  // Navigate to route
}
```

---

## API

### usePermissions Composable

```typescript
interface UsePermissions {
  // State
  userPermissions: ComputedRef<UserPermissions | null>;
  isLoading: ComputedRef<boolean>;
  error: ComputedRef<string | null>;
  
  // Computed
  currentRole: ComputedRef<UserRole | undefined>;
  isAdmin: ComputedRef<boolean>;
  isManager: ComputedRef<boolean>;
  isUser: ComputedRef<boolean>;
  
  // Methods
  loadPermissions(force?: boolean): Promise<UserPermissions | null>;
  hasPermission(resource: PermissionResource, action: PermissionAction): boolean;
  hasAnyPermission(resource: PermissionResource, actions: PermissionAction[]): boolean;
  hasAllPermissions(resource: PermissionResource, actions: PermissionAction[]): boolean;
  hasRole(role: UserRole | UserRole[]): boolean;
  canAccessRoute(routePath: string): boolean;
  clearPermissions(): void;
}
```

### Types

```typescript
type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import';

type PermissionResource = 
  | 'users'
  | 'products'
  | 'posts'
  | 'orders'
  | 'settings'
  | 'dashboard'
  | 'reports';

type UserRole = 'admin' | 'manager' | 'user' | 'guest';

interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

interface UserPermissions {
  userId: number;
  role: UserRole;
  permissions: Permission[];
  routes: string[];
}
```

---

## Router Configuration

### Route Meta

```typescript
interface RoutePermissionMeta {
  requiresAuth?: boolean;
  requiredPermission?: {
    resource: PermissionResource;
    action: PermissionAction;
  };
  requiredRole?: UserRole | UserRole[];
  allowedRoutes?: string[];
}
```

### Example Routes

```typescript
// Admin route
{
  path: '/admin/users',
  name: 'AdminUsers',
  component: () => import('@/views/admin/UsersPage.vue'),
  meta: {
    requiresAuth: true,
    requiredRole: 'admin',
    requiredPermission: {
      resource: 'users',
      action: 'view',
    },
  },
}

// Multi-role route
{
  path: '/admin/settings',
  name: 'AdminSettings',
  component: () => import('@/views/admin/SettingsPage.vue'),
  meta: {
    requiresAuth: true,
    requiredRole: ['admin', 'manager'],
    requiredPermission: {
      resource: 'settings',
      action: 'view',
    },
  },
}

// User route with permission
{
  path: '/products',
  name: 'Products',
  component: () => import('@/views/ProductsPage.vue'),
  meta: {
    requiresAuth: true,
    requiredPermission: {
      resource: 'products',
      action: 'view',
    },
  },
}
```

### Route Organization

Routes được tách theo module:

- `auth.routes.ts` - Public/auth routes
- `admin.routes.ts` - Admin only routes
- `user.routes.ts` - User routes with permissions
- `common.routes.ts` - Common routes (404, 403, demos)

### Permission Guard

Global guard tự động kiểm tra:

1. Authentication (token)
2. Role requirements
3. Permission requirements
4. Route access list

```typescript
// Đã tự động apply trong router/index.ts
router.beforeEach(permissionGuard);
```

---

## Directives

### v-permission

```vue
<ion-button
  v-permission="{ resource: 'users', action: 'delete' }"
  @click="handleDelete"
>
  Delete
</ion-button>
```

### v-role

```vue
<!-- Single role -->
<div v-role="'admin'">Admin content</div>

<!-- Multiple roles -->
<div v-role="['admin', 'manager']">Admin/Manager content</div>
```

**Behavior:**
- Element sẽ bị `display: none` nếu không có permission/role
- Có thể customize để remove khỏi DOM hoàn toàn

---

## Testing

### Demo Page

Navigate to `/permission-demo` để test:

1. **Current User Info** - Hiển thị role và user ID
2. **Permission Status** - Check admin/manager/user status
3. **Permissions List** - Xem tất cả permissions của user
4. **Action Buttons** - Buttons được hiển thị dựa trên permissions
5. **v-permission Directive** - Test directive
6. **v-role Directive** - Test role-based sections

### Test Scenarios

1. **Login as Admin** (`admin@example.com` / `admin123`)
   - Có tất cả permissions
   - Có thể access tất cả routes

2. **Login as Manager** (`manager@example.com` / `manager123`)
   - Limited permissions
   - Có thể access một số admin routes

3. **Login as User** (`user@example.com` / `user123`)
   - Minimal permissions
   - Chỉ access được user routes

4. **Try Accessing Forbidden Routes**
   - Navigate to `/admin/users` với user role
   - Sẽ redirect to Forbidden page

---

## Best Practices

### 1. Load Permissions Early

```typescript
// In App.vue or Layout component
onMounted(async () => {
  const hasToken = Boolean(Cookies.get('app-access-token'));
  if (hasToken) {
    await loadPermissions();
  }
});
```

### 2. Clear on Logout

```typescript
import { usePermissions } from '@/composables/usePermissions';
import { logout } from '@/api/services/auth.service';

const { clearPermissions } = usePermissions();

const handleLogout = () => {
  logout();
  clearPermissions();
  router.push({ name: 'Home' });
};
```

### 3. Handle Permission Load Errors

```typescript
const { loadPermissions, error } = usePermissions();

onMounted(async () => {
  await loadPermissions();
  
  if (error.value) {
    // Show error message
    console.error('Failed to load permissions:', error.value);
  }
});
```

### 4. Use Computed for Reactive Checks

```typescript
const { hasPermission } = usePermissions();

// ✅ Good - reactive
const canEdit = computed(() => hasPermission('users', 'edit'));

// ❌ Bad - not reactive
const canEdit = hasPermission('users', 'edit');
```

---

## Summary

✅ **Implemented:**
- Permission types & interfaces
- API service for permissions
- `usePermissions` composable
- Permission guard for routes
- Route organization by module
- `v-permission` & `v-role` directives
- Demo page với full examples
- 403 & 404 pages
- Mock API với 4 roles
- Complete documentation

✅ **Features:**
- Role-based access control (RBAC)
- Resource-based permissions
- Route protection
- Component-level permission checks
- Directive-based UI hiding
- Extensible & maintainable structure

🎯 **Ready to use!**

