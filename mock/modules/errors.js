export const registerErrorsModule = (app) => {
  // Test error endpoints - return specific status codes
  app.get('/test/error/:code', (req, res) => {
    const code = Number(req.params.code);
    const validCodes = [401, 403, 404, 422, 429, 500, 502, 503, 504];
    
    if (!validCodes.includes(code)) {
      return res.status(400).json({ 
        message: `Invalid error code. Valid codes: ${validCodes.join(', ')}` 
      });
    }
    
    return res.status(code).json({
      message: `Test error ${code}`,
      code,
      timestamp: new Date().toISOString(),
    });
  });
};

