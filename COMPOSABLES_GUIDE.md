# Composables Pattern Guide

Hướng dẫn viết composables đúng chuẩn trong Vue 3.

## 📋 2 Patterns Chính

### 1. Regular Composable (Mỗi component có state riêng)

```typescript
// ✅ ĐÚNG - State inside function
export const useCounter = () => {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);
  
  const increment = () => {
    count.value++;
  };
  
  return {
    count: computed(() => count.value),
    doubled,
    increment,
  };
};
```

**Khi nào dùng:**
- Form state (mỗi form riêng biệt)
- Component-specific UI state
- Local data fetching
- Component logic không cần share

**Ví dụ:**
```vue
<script setup>
// Component A
const { count, increment } = useCounter();
// count = 0

// Component B
const { count, increment } = useCounter();
// count = 0 (independent)
</script>
```

### 2. Singleton Composable (Share state globally)

```typescript
// ✅ ĐÚNG - Singleton pattern with plain variables
let userState: User | null = null;
let isLoadingState = false;

export const useAuth = () => {
  // Local refs that reference singleton state
  const user = ref<User | null>(userState);
  const isLoading = ref(isLoadingState);
  
  const login = async (credentials: Credentials) => {
    isLoadingState = true;
    isLoading.value = true;
    
    try {
      const data = await api.login(credentials);
      userState = data.user;
      user.value = data.user;
    } finally {
      isLoadingState = false;
      isLoading.value = false;
    }
  };
  
  const logout = () => {
    userState = null;
    user.value = null;
  };
  
  return {
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    login,
    logout,
  };
};
```

**Khi nào dùng:**
- User authentication state
- User permissions
- Global modal state
- App-wide settings
- Cached data cần share

**Ví dụ:**
```vue
<script setup>
// Component A
const { user, login } = useAuth();
await login({ email, password });
// user = { id: 1, name: 'John' }

// Component B
const { user } = useAuth();
// user = { id: 1, name: 'John' } (same user)
</script>
```

---

## ❌ SAI - Anti-patterns

### 1. Global refs outside function

```typescript
// ❌ SAI - Tất cả components share cùng ref
const count = ref(0);

export const useCounter = () => {
  return { count };
};
```

**Vấn đề:**
- State bị share giữa tất cả components (không mong muốn)
- Khó test
- Memory leaks
- Không clear khi component unmount

### 2. Không return computed cho reactive state

```typescript
// ❌ SAI - Return raw ref
export const useCounter = () => {
  const count = ref(0);
  return { count }; // Bên ngoài có thể mutate trực tiếp
};

// ✅ ĐÚNG - Return computed (read-only)
export const useCounter = () => {
  const count = ref(0);
  return { 
    count: computed(() => count.value) // Read-only
  };
};
```

---

## 📚 Examples từ Project

### usePermissions (Singleton)

```typescript
// Singleton state
let userPermissionsState: UserPermissions | null = null;
let isLoadingState = false;

export const usePermissions = () => {
  // Local reactive refs
  const userPermissions = ref<UserPermissions | null>(userPermissionsState);
  const isLoading = ref(isLoadingState);
  
  const loadPermissions = async () => {
    isLoadingState = true;
    isLoading.value = true;
    
    const data = await api.getPermissions();
    userPermissionsState = data;
    userPermissions.value = data;
    
    isLoadingState = false;
    isLoading.value = false;
  };
  
  const hasPermission = (resource: string, action: string) => {
    return userPermissionsState?.permissions
      .some(p => p.resource === resource && p.actions.includes(action));
  };
  
  return {
    userPermissions: computed(() => userPermissions.value),
    isLoading: computed(() => isLoading.value),
    loadPermissions,
    hasPermission,
  };
};
```

**Tại sao Singleton?**
- Permissions được load 1 lần, share toàn app
- Không cần reload cho mỗi component
- State consistent across app

### useErrorModal (Singleton)

```typescript
// Singleton state
let errorModalStateValue: ErrorModalState = {
  isOpen: false,
  message: '',
};

export const useErrorModal = () => {
  const errorModalState = ref<ErrorModalState>(errorModalStateValue);
  
  const showError = (statusCode: number, message?: string) => {
    errorModalStateValue = {
      isOpen: true,
      statusCode,
      message,
    };
    errorModalState.value = errorModalStateValue;
  };
  
  const hideError = () => {
    errorModalStateValue.isOpen = false;
    errorModalState.value = errorModalStateValue;
  };
  
  return {
    errorModalState: computed(() => errorModalState.value),
    showError,
    hideError,
  };
};

// Export standalone functions for non-Vue contexts
export const showError = (code: number) => {
  const { showError: show } = useErrorModal();
  show(code);
};
```

**Tại sao Singleton?**
- Modal state phải global
- Cần show từ interceptors (non-Vue context)
- Chỉ có 1 modal instance trong app

### useLanguageOptions (Regular)

```typescript
// ✅ Regular composable - No global state needed
export const useLanguageOptions = () => {
  const { t } = useI18n();
  
  const languageOptions = computed(() =>
    supportedLanguageCodes.map((code) => ({
      code,
      label: t(`language.${code}`),
    })),
  );

  return { languageOptions };
};
```

**Tại sao Regular?**
- Chỉ là computed từ i18n
- Không cần global state
- Mỗi component có thể có instance riêng

---

## 🎯 Checklist Khi Viết Composable

### Quyết định Pattern

1. **State có cần share globally không?**
   - Có → Singleton
   - Không → Regular

2. **State có cần access từ non-Vue context không?** (interceptors, utils)
   - Có → Singleton
   - Không → Tùy chọn

3. **Mỗi component cần independent state không?**
   - Có → Regular
   - Không → Singleton

### Structure

```typescript
// Regular Composable
export const useXXX = () => {
  // 1. State (refs inside)
  const data = ref(...);
  
  // 2. Computed
  const computed1 = computed(() => ...);
  
  // 3. Methods
  const method1 = () => { ... };
  
  // 4. Lifecycle (if needed)
  onMounted(() => { ... });
  
  // 5. Return
  return {
    data: computed(() => data.value), // Read-only
    computed1,
    method1,
  };
};
```

```typescript
// Singleton Composable
let globalState = ...;
let globalLoading = false;

export const useXXX = () => {
  // 1. Local refs that reference global state
  const state = ref(globalState);
  const isLoading = ref(globalLoading);
  
  // 2. Sync function (optional)
  const sync = () => {
    state.value = globalState;
    isLoading.value = globalLoading;
  };
  
  // 3. Methods that update both global and local
  const update = (newValue) => {
    globalState = newValue;
    state.value = newValue;
  };
  
  // 4. Return
  return {
    state: computed(() => state.value),
    isLoading: computed(() => isLoading.value),
    update,
  };
};
```

---

## 🚀 Best Practices

### 1. Always Return Computed for State

```typescript
// ✅ Good - Read-only
return {
  count: computed(() => count.value),
};

// ❌ Bad - Mutable
return { count };
```

### 2. Clear State on Cleanup (Singleton)

```typescript
export const useAuth = () => {
  const logout = () => {
    userState = null;
    user.value = null;
    // Clear all related state
  };
  
  return { logout };
};
```

### 3. Use TypeScript

```typescript
interface User {
  id: number;
  name: string;
}

let userState: User | null = null;

export const useAuth = (): {
  user: ComputedRef<User | null>;
  login: (cred: Credentials) => Promise<void>;
} => {
  // ...
};
```

### 4. Document Pattern Choice

```typescript
/**
 * usePermissions - Singleton pattern
 * 
 * Permissions state is shared globally across all components.
 * Load once, use everywhere.
 */
export const usePermissions = () => {
  // ...
};
```

### 5. Export Standalone Functions for Non-Vue Contexts

```typescript
// For use in interceptors, utils, etc.
export const showError = (code: number) => {
  const { showError: show } = useErrorModal();
  show(code);
};
```

---

## 📖 Summary

| Pattern | State Location | Use Case | Example |
|---------|---------------|----------|---------|
| **Regular** | Inside function | Component-specific, independent state | `useForm`, `useCounter` |
| **Singleton** | Outside function (plain variables) | Global state, shared across app | `useAuth`, `usePermissions`, `useErrorModal` |

✅ **Key Takeaways:**
1. Regular composables: State INSIDE function
2. Singleton composables: Plain variables OUTSIDE + refs INSIDE
3. Always return computed for read-only access
4. Document your pattern choice
5. Use TypeScript for better DX

🎯 **Current Project:**
- ✅ `usePermissions` - Singleton (global permissions)
- ✅ `useErrorModal` - Singleton (global modal state)
- ✅ `useLanguageOptions` - Regular (no state, just computed)
- ✅ `useForm` - Regular (each form independent)

