export const registerPostsModule = (app, context) => {
  app.get('/posts', (_req, res) => {
    const posts = context.db.posts || [];
    console.log('GET /posts - Returning', posts.length, 'posts');
    return res.json(posts);
  });

  app.get('/posts/:id', (req, res) => {
    const posts = context.db.posts || [];
    const post = posts.find((p) => p.id === Number(req.params.id));
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.json(post);
  });
};

