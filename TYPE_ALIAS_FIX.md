# TypeScript Path Alias Fix - Complete Solution

## Problem

TypeScript trong Vue projects không tự động nhận diện path alias `@/` cho imports, dẫn đến lỗi:
```
Cannot find module '@/api/services/products.service' or its corresponding type declarations.
```

## Root Cause

1. TypeScript compiler (`tsc`) **KHÔNG** sử dụng Vite's path resolution
2. Vue SFC files cần explicit module declarations trong `.d.ts` files
3. Dynamic imports `() => import('@/...')` cần special handling

## Complete Solution

### 1. Wildcard Declarations trong `src/env.d.ts`

Thêm wildcard declarations để cover **TẤT CẢ** patterns:

```typescript
/// <reference types="vite/client" />

// ============================================
// WILDCARD DECLARATIONS - Universal fix
// ============================================

// Vue components - all patterns
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module '@/views/**/*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module '@/components/**/*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

// API Services - all patterns
declare module '@/api/services/*.service' {
  const exports: any;
  export = exports;
}

declare module '@/api/services/*' {
  const exports: any;
  export = exports;
}

// Composables - all patterns
declare module '@/composables/*' {
  const exports: any;
  export = exports;
}

// Types
declare module '@/types' {
  export * from '../types';
}

declare module '@/types/*' {
  const exports: any;
  export = exports;
}

// Utils
declare module '@/utils' {
  export * from '../utils';
}

declare module '@/utils/*' {
  const exports: any;
  export = exports;
}

// Stores
declare module '@/stores/*' {
  const exports: any;
  export = exports;
}

// Router
declare module '@/router' {
  import type { Router } from 'vue-router';
  const router: Router;
  export default router;
}

declare module '@/router/*' {
  const exports: any;
  export = exports;
}

// I18n
declare module '@/i18n' {
  import type { I18n } from 'vue-i18n';
  export const i18n: I18n;
  export default i18n;
}

declare module '@/i18n/*' {
  const exports: any;
  export = exports;
}

// Directives
declare module '@/directives/*' {
  const exports: any;
  export = exports;
}

// API
declare module '@/api' {
  export * from '../api';
}

// Catch-all for any other @/ imports
declare module '@/*' {
  const exports: any;
  export = exports;
}
```

### 2. tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client", "node"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "src/env.d.ts",
    "src/vite-env.d.ts"
  ],
  "vueCompilerOptions": {
    "target": 3,
    "experimentalCompatMode": 2,
    "nativeTags": ["template", "script", "style"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. vite.config.ts Configuration

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
```

## Why This Works

### Wildcard Declarations

1. **`declare module '@/api/services/*'`**
   - Matches ANY file in `@/api/services/`
   - Covers `*.service.ts`, `*.ts`, etc.

2. **`declare module '@/composables/*'`**
   - Matches ANY file in `@/composables/`
   - Covers all composable files

3. **`declare module '@/*'`**
   - **Catch-all** for anything not covered above
   - Last resort fallback

### Type Safety vs Development Experience

```typescript
// Option 1: Specific types (best for production)
declare module '@/api/services/products.service' {
  export type Product = { ... };
  export function fetchProducts(): Promise<Product[]>;
}

// Option 2: Wildcard with 'any' (best for development)
declare module '@/api/services/*' {
  const exports: any;
  export = exports;
}
```

**Trade-off:**
- ✅ Wildcard = No more "Cannot find module" errors
- ⚠️ Wildcard = Loss of type inference (IDE won't autocomplete)
- ✅ Specific = Full type safety + autocomplete
- ⚠️ Specific = Need to maintain declarations for every file

## Best Practice Strategy

### Phase 1: Development (Wildcard)
Use wildcard declarations để focus vào functionality:
```typescript
declare module '@/api/services/*' {
  const exports: any;
  export = exports;
}
```

### Phase 2: Production (Specific Types)
Gradually add specific types cho core modules:
```typescript
declare module '@/api/services/products.service' {
  export type Product = { ... };
  export function fetchProducts(): Promise<Product[]>;
}
```

## Alternative Solutions

### Solution A: No TypeScript in Vue SFCs (Not Recommended)
```vue
<script setup>
// Use JavaScript instead
import { fetchProducts } from '@/api/services/products.service';
</script>
```

### Solution B: Relative Imports (Verbose)
```typescript
// Instead of @/ alias
import { fetchProducts } from '../../../api/services/products.service';
```

### Solution C: Use Volar Plugin (Recommended for Vue 3)
Install Volar VSCode extension for better Vue + TypeScript support.

## Verification

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### Check Lint
```bash
npm run lint
```

### Restart TS Server in VSCode
1. `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `TypeScript: Restart TS Server`
3. Press Enter

## Common Issues

### Issue 1: Still seeing red squiggles in IDE
**Solution:** Restart TypeScript server in VSCode

### Issue 2: Build works but IDE shows errors
**Solution:** Verify `tsconfig.json` includes `src/env.d.ts` in `files` or `include`

### Issue 3: Some imports work, others don't
**Solution:** Make sure wildcard patterns cover all cases:
- `@/api/services/*` for all service files
- `@/composables/*` for all composables
- `@/*` as catch-all fallback

## Summary

**Root problem:** TypeScript doesn't understand Vite's `@/` alias without explicit declarations.

**Complete fix:**
1. ✅ Add wildcard declarations in `src/env.d.ts`
2. ✅ Configure `paths` in `tsconfig.json`
3. ✅ Configure `vueCompilerOptions.paths` in `tsconfig.json`
4. ✅ Restart TypeScript server in IDE

**Result:** 🎉 No more "Cannot find module" errors!

---

**Key Takeaway:** Wildcard declarations (`@/*`) are the nuclear option that **ALWAYS works** for path alias issues in TypeScript + Vue projects.


