/* eslint-disable no-console */

/**
 * Mock permissions module
 */

// Sample permissions for different roles
const rolePermissions = {
  admin: {
    permissions: [
      { resource: 'users', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'products', actions: ['view', 'create', 'edit', 'delete', 'export', 'import'] },
      { resource: 'posts', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'settings', actions: ['view', 'edit'] },
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'reports', actions: ['view', 'export'] },
    ],
    routes: ['/', '/admin/users', '/admin/settings', '/products', '/posts', '/dashboard', '/permission-demo'],
  },
  manager: {
    permissions: [
      { resource: 'users', actions: ['view', 'edit'] },
      { resource: 'products', actions: ['view', 'create', 'edit', 'export'] },
      { resource: 'posts', actions: ['view', 'create', 'edit'] },
      { resource: 'orders', actions: ['view', 'edit'] },
      { resource: 'settings', actions: ['view'] },
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'reports', actions: ['view'] },
    ],
    routes: ['/', '/admin/settings', '/products', '/posts', '/dashboard', '/permission-demo'],
  },
  user: {
    permissions: [
      { resource: 'products', actions: ['view'] },
      { resource: 'posts', actions: ['view', 'create'] },
      { resource: 'dashboard', actions: ['view'] },
    ],
    routes: ['/', '/products', '/posts', '/dashboard', '/permission-demo'],
  },
  guest: {
    permissions: [],
    routes: ['/'],
  },
};

export const registerPermissionsModule = (app, mockContext) => {
  const authGuard = mockContext.createAuthGuard();

  /**
   * GET /permissions/me - Get current user's permissions
   */
  app.get('/permissions/me', authGuard, (req, res) => {
    const userId = req.userId;
    const user = mockContext.db.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = user.role || 'user';
    const roleData = rolePermissions[userRole] || rolePermissions.guest;

    console.log(`Fetched permissions for user ${userId} (${userRole})`);

    return res.status(200).json({
      userId: user.id,
      role: userRole,
      permissions: roleData.permissions,
      routes: roleData.routes,
    });
  });

  /**
   * POST /permissions/check - Check specific permission
   */
  app.post('/permissions/check', authGuard, (req, res) => {
    const userId = req.userId;
    const { resource, action } = req.body;

    const user = mockContext.db.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = user.role || 'user';
    const roleData = rolePermissions[userRole] || rolePermissions.guest;

    const permission = roleData.permissions.find((p) => p.resource === resource);
    const allowed = permission ? permission.actions.includes(action) : false;

    console.log(`Permission check: user ${userId} (${userRole}) - ${resource}:${action} = ${allowed}`);

    return res.status(200).json({
      allowed,
      resource,
      action,
    });
  });

  console.log('Permissions module registered');
};

