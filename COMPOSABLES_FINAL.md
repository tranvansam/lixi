# Composables - Final Pattern

Pattern cuối cùng cho tất cả composables trong project.

## ✅ Simple Rule: Return thẳng refs

```typescript
export const useExample = () => {
  const data = ref(null);
  const isLoading = ref(false);
  
  // ✅ Return thẳng refs
  return {
    data,
    isLoading,
  };
};

// Usage
const { data, isLoading } = useExample();
console.log(data.value); // .value 1 lần
```

---

## 📋 All Composables Status

### ✅ useDevice
```typescript
return {
  deviceInfo,      // ✅ Direct ref
  networkInfo,     // ✅ Direct ref
  batteryInfo,     // ✅ Direct ref
  isOnline,        // ✅ Direct ref
  isNativeApp,     // ✅ Computed (derived)
  isWebBrowser,    // ✅ Computed (derived)
  // ...
};
```

### ✅ usePermissions
```typescript
return {
  userPermissions, // ✅ Direct ref
  isLoading,       // ✅ Direct ref
  error,           // ✅ Direct ref
  isAdmin,         // ✅ Computed (derived)
  isManager,       // ✅ Computed (derived)
  // ...
};
```

### ✅ useErrorModal
```typescript
return {
  errorModalState, // ✅ Direct ref
  showError,       // ✅ Method
  hideError,       // ✅ Method
};
```

### ✅ useLanguageOptions
```typescript
return {
  languageOptions, // ✅ Computed (từ i18n)
};
```

### ✅ useForm
```typescript
return {
  values,        // ✅ Direct ref (from vee-validate)
  errors,        // ✅ Direct ref (from vee-validate)
  isSubmitting,  // ✅ Direct ref (from vee-validate)
  meta,          // ✅ Direct ref (from vee-validate)
  // ...
};
```

---

## 🎯 Pattern Summary

### Refs (State)
```typescript
const count = ref(0);

// ✅ Return thẳng
return { count };

// ❌ KHÔNG dùng
return { count: computed(() => count.value) }; // Dư thừa
return { count: readonly(count) }; // Phức tạp không cần thiết
```

### Computed (Derived values)
```typescript
const doubled = computed(() => count.value * 2);

// ✅ Return computed
return { doubled };
```

### Methods
```typescript
const increment = () => count.value++;

// ✅ Return method
return { increment };
```

---

## 📝 Complete Example

```typescript
import { ref, computed } from 'vue';

export const useCounter = () => {
  // State
  const count = ref(0);
  const step = ref(1);
  
  // Computed (derived)
  const doubled = computed(() => count.value * 2);
  const isEven = computed(() => count.value % 2 === 0);
  
  // Methods
  const increment = () => {
    count.value += step.value;
  };
  
  const decrement = () => {
    count.value -= step.value;
  };
  
  const reset = () => {
    count.value = 0;
  };
  
  // ✅ Return thẳng tất cả
  return {
    // State - direct refs
    count,
    step,
    
    // Computed - derived values
    doubled,
    isEven,
    
    // Methods
    increment,
    decrement,
    reset,
  };
};
```

**Usage:**
```vue
<script setup lang="ts">
const { 
  count, 
  step, 
  doubled, 
  isEven, 
  increment, 
  decrement, 
  reset 
} = useCounter();

// Access refs - .value 1 lần
console.log(count.value);
console.log(step.value);

// Access computed - .value 1 lần
console.log(doubled.value);
console.log(isEven.value);

// Call methods
increment();
decrement();
reset();
</script>
```

---

## 🚫 Avoid

### ❌ Wrapped computed
```typescript
// BAD
return {
  count: computed(() => count.value), // Dư thừa
};
```

### ❌ Readonly wrapper
```typescript
// BAD - Phức tạp không cần thiết
return {
  count: readonly(count),
};
```

### ❌ Deep reactive wrapper
```typescript
// BAD - Vue 3 refs đã reactive rồi
return {
  count: toRef(count),
};
```

---

## ✅ Just Keep It Simple

```typescript
// State → Return ref
const data = ref(null);
return { data };

// Computed → Return computed
const doubled = computed(() => data.value * 2);
return { doubled };

// Method → Return function
const update = () => { /* ... */ };
return { update };
```

**That's it! Đơn giản vậy thôi.** 🎉

---

## 🎨 Real World Examples

### API Data Fetching
```typescript
export const useApi = () => {
  const data = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  
  const fetchData = async () => {
    isLoading.value = true;
    try {
      data.value = await api.get('/data');
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  };
  
  return { data, isLoading, error, fetchData };
};
```

### Pagination
```typescript
export const usePagination = () => {
  const page = ref(1);
  const pageSize = ref(10);
  
  const totalPages = computed(() => 
    Math.ceil(total.value / pageSize.value)
  );
  
  const nextPage = () => page.value++;
  const prevPage = () => page.value--;
  
  return { page, pageSize, totalPages, nextPage, prevPage };
};
```

### Modal State
```typescript
export const useModal = () => {
  const isOpen = ref(false);
  
  const open = () => isOpen.value = true;
  const close = () => isOpen.value = false;
  const toggle = () => isOpen.value = !isOpen.value;
  
  return { isOpen, open, close, toggle };
};
```

---

## 📊 Pattern Checklist

Khi viết composable:

- [ ] **Refs**: Return direct ref, không wrap
- [ ] **Computed**: Return computed cho derived values
- [ ] **Methods**: Return functions trực tiếp
- [ ] **No wrappers**: Không dùng `computed(() => ref.value)`
- [ ] **No readonly**: Không cần `readonly()` unless special case
- [ ] **Simple**: Keep it simple, stupid (KISS)

---

## 🎯 Final Words

> **"The best code is simple code."**

Đừng over-engineer. Return thẳng refs là đủ cho 99% use cases.

Chỉ dùng `readonly` khi:
- 🔒 Library/plugin cần enforce immutability
- 🔒 Shared state cần strict control
- 🔒 Public API cần prevent mutation

**Còn lại: Keep it simple!** ✨

