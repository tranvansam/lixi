import type { RouteRecordRaw } from 'vue-router';

export const commonRoutes: RouteRecordRaw[] = [
  {
    path: '/form-example',
    name: 'FormExample',
    component: () => import('@/views/FormExamplePage.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/permission-demo',
    name: 'PermissionDemo',
    component: () => import('@/views/PermissionDemoPage.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/device-demo',
    name: 'DeviceDemo',
    component: () => import('@/views/DeviceDemoPage.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/forbidden',
    name: 'Forbidden',
    component: () => import('@/views/ForbiddenPage.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: {
      requiresAuth: false,
    },
  },
];

