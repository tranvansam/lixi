# Composables Best Practices

Hướng dẫn cách return state đúng trong composables.

## ❌ SAI - Return computed cho refs

```typescript
// ❌ BAD - Phải .value 2 lần
export const useCounter = () => {
  const count = ref(0);
  
  return {
    count: computed(() => count.value), // ❌ Tệ
  };
};

// Usage
const { count } = useCounter();
console.log(count.value); // Phải .value vì computed
// computed(() => count.value) → computed returns ref → phải .value
```

**Vấn đề:**
1. `computed(() => count.value)` returns một `ComputedRef`
2. Để lấy giá trị phải: `count.value` (2 lần unwrap)
3. Không hiệu quả, dư thừa

---

## ✅ ĐÚNG - 3 Cách Return State

### 1. Return Direct Ref (Mutable)

```typescript
// ✅ Good - Cho phép mutation từ bên ngoài
export const useCounter = () => {
  const count = ref(0);
  
  return {
    count, // Direct ref
  };
};

// Usage
const { count } = useCounter();
console.log(count.value); // .value 1 lần
count.value++; // ✅ Có thể mutate
```

**Khi nào dùng:**
- State cần update từ component
- Dữ liệu form, input fields
- Local component state

### 2. Return Readonly Ref (Recommended)

```typescript
// ✅ Best - Readonly, không thể mutate từ bên ngoài
export const useCounter = () => {
  const count = ref(0);
  
  const increment = () => {
    count.value++;
  };
  
  return {
    count: readonly(count), // Readonly ref
    increment,
  };
};

// Usage
const { count, increment } = useCounter();
console.log(count.value); // .value 1 lần
count.value++; // ❌ Error: readonly
increment(); // ✅ Chỉ có thể update qua method
```

**Khi nào dùng:**
- State chỉ update qua methods
- Singleton state (permissions, auth, etc.)
- Prevent accidental mutations

### 3. Return Computed (Cho derived values)

```typescript
// ✅ Good - Computed cho derived values
export const useCounter = () => {
  const count = ref(0);
  
  const doubled = computed(() => count.value * 2); // Derived value
  
  return {
    count: readonly(count),
    doubled, // Computed ref
  };
};

// Usage
const { count, doubled } = useCounter();
console.log(count.value); // 5
console.log(doubled.value); // 10 (auto-calculated)
```

**Khi nào dùng:**
- Derived/calculated values
- Values phụ thuộc vào other refs
- Lazy evaluation

---

## 📊 So sánh

| Method | Syntax | Mutability | Use Case |
|--------|--------|------------|----------|
| **Direct Ref** | `count` | ✅ Mutable | Form inputs, local state |
| **Readonly Ref** | `readonly(count)` | ❌ Readonly | Singleton state, controlled updates |
| **Computed** | `computed(() => ...)` | ❌ Readonly | Derived values, calculations |

---

## 🎯 Updated Composables

### useDevice

```typescript
// ❌ Trước
return {
  deviceInfo: computed(() => deviceInfo.value), // Bad
};

// ✅ Sau
return {
  deviceInfo: readonly(deviceInfo), // Good
};

// Usage
const { deviceInfo } = useDevice();
console.log(deviceInfo.value?.platform); // ✅ .value 1 lần
```

### usePermissions

```typescript
// ❌ Trước
return {
  userPermissions: computed(() => userPermissions.value),
};

// ✅ Sau
return {
  userPermissions: readonly(userPermissions),
};

// Usage
const { userPermissions } = usePermissions();
console.log(userPermissions.value?.role); // ✅ .value 1 lần
```

### useErrorModal

```typescript
// ❌ Trước
return {
  errorModalState: computed(() => errorModalState.value),
};

// ✅ Sau
return {
  errorModalState: readonly(errorModalState),
};

// Usage
const { errorModalState } = useErrorModal();
console.log(errorModalState.value?.isOpen); // ✅ .value 1 lần
```

---

## 🎨 Complete Example

```typescript
import { ref, computed, readonly } from 'vue';

export const useAuth = () => {
  // Internal refs
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  
  // Computed - derived values
  const isAuthenticated = computed(() => !!user.value);
  const userName = computed(() => user.value?.name ?? 'Guest');
  
  // Methods
  const login = async (credentials: Credentials) => {
    isLoading.value = true;
    try {
      const data = await api.login(credentials);
      user.value = data.user;
    } finally {
      isLoading.value = false;
    }
  };
  
  const logout = () => {
    user.value = null;
  };
  
  return {
    // State - readonly refs
    user: readonly(user),
    isLoading: readonly(isLoading),
    
    // Computed - derived values
    isAuthenticated,
    userName,
    
    // Methods
    login,
    logout,
  };
};
```

**Usage:**

```vue
<script setup lang="ts">
const { user, isLoading, isAuthenticated, userName, login, logout } = useAuth();

// ✅ Access state
console.log(user.value); // .value 1 lần
console.log(isLoading.value);
console.log(isAuthenticated.value); // computed
console.log(userName.value); // computed

// ❌ Cannot mutate directly
user.value = null; // Error: readonly

// ✅ Can only mutate via methods
await login({ email, password });
logout();
</script>
```

---

## 🔍 Why readonly?

### Without readonly:

```typescript
export const useAuth = () => {
  const user = ref<User | null>(null);
  
  return {
    user, // Direct ref
  };
};

// Component A
const { user } = useAuth();
user.value = null; // ❌ Có thể mutate trực tiếp

// Component B
const { user } = useAuth();
// user có thể bị change bởi Component A mà không biết!
```

### With readonly:

```typescript
export const useAuth = () => {
  const user = ref<User | null>(null);
  
  const logout = () => {
    user.value = null;
  };
  
  return {
    user: readonly(user), // Readonly
    logout,
  };
};

// Component A
const { user, logout } = useAuth();
user.value = null; // ✅ Error: readonly
logout(); // ✅ Phải dùng method

// Component B
const { user } = useAuth();
// user chỉ có thể change qua methods → predictable!
```

---

## ✅ Checklist

Khi viết composable:

- [ ] **State refs**: Return `readonly(ref)` nếu chỉ update qua methods
- [ ] **Mutable state**: Return direct `ref` nếu cần mutate từ component
- [ ] **Derived values**: Return `computed()` cho calculated values
- [ ] **Never**: Return `computed(() => ref.value)` → dư thừa!

---

## 🎯 Summary

| Return Type | Code | Usage | Mutability |
|-------------|------|-------|------------|
| **Direct Ref** | `return { count }` | `count.value` | Mutable |
| **Readonly Ref** | `return { count: readonly(count) }` | `count.value` | Readonly |
| **Computed** | `return { doubled: computed(...) }` | `doubled.value` | Readonly |
| **❌ Computed Ref** | `return { count: computed(() => count.value) }` | `count.value` | ❌ Don't use |

**Rule of thumb:**
- State → `readonly(ref)`
- Derived → `computed()`
- Mutable → `ref`
- Never → `computed(() => ref.value)`

Cảm ơn đã chỉ ra! Giờ đã fix hết rồi. 🎉

