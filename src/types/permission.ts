// Permission types

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import';

export type PermissionResource = 
  | 'users'
  | 'products'
  | 'posts'
  | 'orders'
  | 'settings'
  | 'dashboard'
  | 'reports';

export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export interface UserPermissions {
  userId: number;
  role: UserRole;
  permissions: Permission[];
  routes: string[]; // Danh sách routes được phép truy cập
}

export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

export interface PermissionCheckOptions {
  resource: PermissionResource;
  action: PermissionAction;
  requireAll?: boolean; // Nếu có nhiều actions, check tất cả hay chỉ 1
}

export interface RoutePermissionMeta {
  requiresAuth?: boolean;
  requiredPermission?: {
    resource: PermissionResource;
    action: PermissionAction;
  };
  requiredRole?: UserRole | UserRole[];
  allowedRoutes?: string[];
}

