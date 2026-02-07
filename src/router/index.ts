import { createRouter, createWebHistory } from '@ionic/vue-router';
import { routes } from './routes';
import { permissionGuard } from './guards/permission.guard';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Apply permission guard globally
router.beforeEach(permissionGuard);

export default router;
