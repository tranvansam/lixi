import type { Directive } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import type { PermissionResource, PermissionAction } from '@/types/permission';

/**
 * v-permission directive
 * Usage: v-permission="{ resource: 'users', action: 'edit' }"
 * 
 * Ẩn element nếu không có permission
 */
export const vPermission: Directive<HTMLElement, { resource: PermissionResource; action: PermissionAction }> = {
  mounted(el, binding) {
    const { resource, action } = binding.value;
    const { hasPermission } = usePermissions();

    if (!hasPermission(resource, action)) {
      // Ẩn element
      el.style.display = 'none';
      
      // Hoặc remove hoàn toàn khỏi DOM
      // el.parentNode?.removeChild(el);
    }
  },
};

/**
 * v-role directive
 * Usage: v-role="'admin'" hoặc v-role="['admin', 'manager']"
 * 
 * Ẩn element nếu không có role
 */
export const vRole: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const requiredRole = binding.value;
    const { hasRole } = usePermissions();

    if (!hasRole(requiredRole as any)) {
      el.style.display = 'none';
    }
  },
};

