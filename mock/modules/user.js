import { createAuthGuard, getUserPayload } from '../lib/context.js';

export const registerUserModule = (app, context) => {
  const requireAuth = createAuthGuard();

  app.get('/me', requireAuth, (req, res) => {
    const user = context.db.users.find((item) => item.id === req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(getUserPayload(user));
  });
};


