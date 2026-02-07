import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readJson = (relativePath) => {
  const filePath = path.resolve(__dirname, '..', relativePath);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
};

const db = {
  users: readJson('data/users.json'),
  systemStatus: readJson('data/system.json'),
  posts: readJson('data/posts.json'),
  products: readJson('data/products.json'),
};

const tokenStore = {
  accessTokens: new Map(),
  refreshTokens: new Map(),
};

const createToken = (prefix, userId) => `${prefix}-${userId}-${Date.now()}`;

export const issueTokens = (userId) => {
  const accessToken = createToken('access', userId);
  const refreshToken = createToken('refresh', userId);
  tokenStore.accessTokens.set(accessToken, userId);
  tokenStore.refreshTokens.set(refreshToken, userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: 900,
  };
};

export const getUserPayload = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

export const createAuthGuard = () => (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Missing access token' });
  }
  const userId = tokenStore.accessTokens.get(token);
  if (!userId) {
    return res.status(401).json({ message: 'Invalid access token' });
  }
  req.userId = userId;
  return next();
};

export const mockContext = {
  db,
  tokenStore,
  issueTokens,
  getUserPayload,
  createAuthGuard,
};


