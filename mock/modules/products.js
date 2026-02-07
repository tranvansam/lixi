export const registerProductsModule = (app, context) => {
  app.get('/products', (_req, res) => {
    const products = context.db.products || [];
    console.log('GET /products - Returning', products.length, 'products');
    return res.json(products);
  });

  app.get('/products/:id', (req, res) => {
    const products = context.db.products || [];
    const product = products.find((p) => p.id === Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  });
};

