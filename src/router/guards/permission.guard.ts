import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { usePermissions } from '@/composables/usePermissions';
import { currentUser } from '@/composables/useAuth';
import Cookies from 'js-cookie';
import { tokenCookieKeys } from '@/api/config';
import type { RoutePermissionMeta } from '@/types/permission';

/**
 * Permission guard - kiểm tra quyền truy cập route
 */
export const permissionGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const meta = to.meta as RoutePermissionMeta;
  const { loadPermissions, hasPermission, hasRole, canAccessRoute } = usePermissions();

  // Kiểm tra authentication - ưu tiên Firebase auth, fallback về cookies
  const hasToken = Boolean(Cookies.get(tokenCookieKeys.access)) || Boolean(currentUser.value);

  if (meta.requiresAuth && !hasToken) {
    console.warn(`Route ${to.path} requires authentication`);
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // Nếu có token, load permissions
  if (hasToken) {
    try {
      await loadPermissions();
    } catch (error) {
      console.error('Failed to load permissions:', error);
      return next({ name: 'Home', query: { error: 'permission_load_failed' } });
    }
  }

  // Kiểm tra role requirement
  if (meta.requiredRole) {
    if (!hasRole(meta.requiredRole)) {
      console.warn(`Route ${to.path} requires role: ${meta.requiredRole}`);
      return next({ name: 'Forbidden' });
    }
  }

  // Kiểm tra specific permission
  if (meta.requiredPermission) {
    const { resource, action } = meta.requiredPermission;
    if (!hasPermission(resource, action)) {
      console.warn(`Route ${to.path} requires permission: ${resource}:${action}`);
      return next({ name: 'Forbidden' });
    }
  }

  // Kiểm tra route trong danh sách allowed routes
  if (meta.allowedRoutes) {
    if (!canAccessRoute(to.path)) {
      console.warn(`Route ${to.path} is not in allowed routes`);
      return next({ name: 'Forbidden' });
    }
  }

  next();
};

