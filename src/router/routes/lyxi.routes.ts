import type { RouteRecordRaw } from 'vue-router';

export const lyxiRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/room/:roomCode',
    name: 'Room',
    component: () => import('@/views/RoomPage.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/scan',
    name: 'ScanQR',
    component: () => import('@/views/ScanQRPage.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/my-rooms',
    name: 'MyRooms',
    component: () => import('@/views/MyRoomsPage.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/create-room',
    name: 'CreateRoom',
    component: () => import('@/views/CreateRoomPage.vue'),
    meta: {
      requiresAuth: true,
    },
  },
];
