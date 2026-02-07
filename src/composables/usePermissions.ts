import { ref, computed } from 'vue';
import { fetchUserPermissions } from '@/api/services/permission.service';
import type { 
  UserPermissions, 
  PermissionResource, 
  PermissionAction,
  UserRole,
} from '@/types/permission';

/**
 * Composable for managing user permissions
 * 
 * Sử dụng singleton pattern để share state giữa các components
 * Nếu muốn mỗi component có state riêng, move các ref vào trong function
 */

// Singleton state - shared across all components
let userPermissionsState: UserPermissions | null = null;
let isLoadingState = false;
let errorState: string | null = null;

export const usePermissions = () => {
  // Local reactive refs that reference singleton state
  const userPermissions = ref<UserPermissions | null>(userPermissionsState);
  const isLoading = ref(isLoadingState);
  const error = ref<string | null>(errorState);

  /**
   * Sync local state with singleton state
   */
  const syncState = () => {
    userPermissions.value = userPermissionsState;
    isLoading.value = isLoadingState;
    error.value = errorState;
  };

  /**
   * Load user permissions from API
   */
  const loadPermissions = async (force = false) => {
    // Nếu đã load và không force reload thì skip
    if (userPermissionsState && !force) {
      syncState();
      return userPermissionsState;
    }

    isLoadingState = true;
    isLoading.value = true;
    errorState = null;
    error.value = null;

    try {
      const data = await fetchUserPermissions();
      userPermissionsState = data;
      userPermissions.value = data;
      return data;
    } catch (err) {
      errorState = err instanceof Error ? err.message : 'Failed to load permissions';
      error.value = errorState;
      console.error('Error loading permissions:', err);
      return null;
    } finally {
      isLoadingState = false;
      isLoading.value = false;
    }
  };

  /**
   * Check if user has specific permission
   */
  const hasPermission = (resource: PermissionResource, action: PermissionAction): boolean => {
    if (!userPermissionsState) return false;

    const permission = userPermissionsState.permissions.find(
      (p) => p.resource === resource
    );

    return permission ? permission.actions.includes(action) : false;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (
    resource: PermissionResource,
    actions: PermissionAction[]
  ): boolean => {
    return actions.some((action) => hasPermission(resource, action));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (
    resource: PermissionResource,
    actions: PermissionAction[]
  ): boolean => {
    return actions.every((action) => hasPermission(resource, action));
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!userPermissionsState) return false;

    if (Array.isArray(role)) {
      return role.includes(userPermissionsState.role);
    }

    return userPermissionsState.role === role;
  };

  /**
   * Check if user can access route
   */
  const canAccessRoute = (routePath: string): boolean => {
    if (!userPermissionsState) return false;
    return userPermissionsState.routes.includes(routePath);
  };

  /**
   * Clear permissions (e.g., on logout)
   */
  const clearPermissions = () => {
    userPermissionsState = null;
    userPermissions.value = null;
    errorState = null;
    error.value = null;
  };

  // Computed properties
  const currentRole = computed(() => userPermissionsState?.role);
  const isAdmin = computed(() => userPermissionsState?.role === 'admin');
  const isManager = computed(() => userPermissionsState?.role === 'manager');
  const isUser = computed(() => userPermissionsState?.role === 'user');

  // Sync state on init
  syncState();

  return {
    // State - direct refs
    userPermissions,
    isLoading,
    error,
    
    // Computed
    currentRole,
    isAdmin,
    isManager,
    isUser,
    
    // Methods
    loadPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canAccessRoute,
    clearPermissions,
  };
};
