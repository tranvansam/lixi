import { issueTokens, getUserPayload } from '../lib/context.js';

export const registerAuthModule = (app, context) => {
  app.post('/auth/login', (req, res) => {
    const { email, password } = req.body ?? {};
    const user = context.db.users.find((item) => item.email === email && item.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = issueTokens(user.id);
    return res.json({
      user: getUserPayload(user),
      tokens,
    });
  });

  app.post('/auth/refresh', (req, res) => {
    const { refreshToken } = req.body ?? {};
    const userId = context.tokenStore.refreshTokens.get(refreshToken);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const tokens = issueTokens(userId);
    return res.json(tokens);
  });
};


