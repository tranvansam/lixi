import type { RouteRecordRaw } from 'vue-router';

export const adminRoutes: RouteRecordRaw[] = [
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
  },
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
  },
];

