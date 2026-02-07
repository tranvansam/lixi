export const registerSystemModule = (app, context) => {
  app.get('/system/status', (_req, res) => {
    return res.json(context.db.systemStatus);
  });
};


