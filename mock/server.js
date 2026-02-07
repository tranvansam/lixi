/* eslint-disable no-console */
import jsonServer from 'json-server';

import { mockContext } from './lib/context.js';
import { registerAuthModule } from './modules/auth.js';
import { registerUserModule } from './modules/user.js';
import { registerSystemModule } from './modules/system.js';
import { registerPostsModule } from './modules/posts.js';
import { registerProductsModule } from './modules/products.js';
import { registerErrorsModule } from './modules/errors.js';
import { registerPermissionsModule } from './modules/permissions.js';

const server = jsonServer.create();
const router = jsonServer.router({
  users: mockContext.db.users,
  systemStatus: mockContext.db.systemStatus,
});
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Register custom routes BEFORE json-server router
registerAuthModule(server, mockContext);
registerUserModule(server, mockContext);
registerSystemModule(server, mockContext);
registerPostsModule(server, mockContext);
registerProductsModule(server, mockContext);
registerErrorsModule(server);
registerPermissionsModule(server, mockContext);

// Use json-server router for default REST API (only for users and systemStatus)
server.use(router);

const getPreferredPort = () => {
  const raw = process.env.MOCK_PORT || process.env.PORT || 4000;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? 4000 : parsed;
};

const startServer = (port) => {
  const instance = server.listen(port, () => {
    console.log(`Mock API running at http://localhost:${port}`);
    console.log('Available accounts:');
    mockContext.db.users.forEach((user) => console.log(` - ${user.email} / ${user.password}`));
  });

  instance.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }
    throw error;
  });
};

startServer(getPreferredPort());

