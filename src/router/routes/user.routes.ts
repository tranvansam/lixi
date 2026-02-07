import type { RouteRecordRaw } from 'vue-router';

export const userRoutes: RouteRecordRaw[] = [
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
  },
  {
    path: '/posts',
    name: 'Posts',
    component: () => import('@/views/PostsPage.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: {
        resource: 'posts',
        action: 'view',
      },
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardPage.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: {
        resource: 'dashboard',
        action: 'view',
      },
    },
  },
];

