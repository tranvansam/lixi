import type { RouteRecordRaw } from 'vue-router';
import { authRoutes } from './auth.routes';
import { adminRoutes } from './admin.routes';
import { userRoutes } from './user.routes';
import { commonRoutes } from './common.routes';
import { lyxiRoutes } from './lyxi.routes';

export const routes: RouteRecordRaw[] = [
  ...lyxiRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...userRoutes,
  ...commonRoutes,
];

