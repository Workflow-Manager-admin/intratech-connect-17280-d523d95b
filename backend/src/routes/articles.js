const express = require('express');
const { v4: uuidv4 } = require('uuid');
const filedb = require('../utils/filedb');

const router = express.Router();
const FILE = 'articles.json';

// PUBLIC_INTERFACE
// Get all articles (optionally filter by category or tag)
router.get('/', async (req, res) => {
  const { category, tag } = req.query;
  let articles = await filedb.readAll(FILE);

  if (category) {
    articles = articles.filter(article =>
      Array.isArray(article.categories) && article.categories.includes(category)
    );
  }
  if (tag) {
    articles = articles.filter(article =>
      Array.isArray(article.tags) && article.tags.includes(tag)
    );
  }
  res.json(articles);
});

// PUBLIC_INTERFACE
// Get article by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const article = await filedb.findById(FILE, id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
});

// PUBLIC_INTERFACE
// Create article
router.post('/', async (req, res) => {
  const { title, content, authorId, categories, tags } = req.body;
  if (!title || !content || !authorId) {
    return res.status(400).json({ error: 'title, content and authorId are required.' });
  }
  const articles = await filedb.readAll(FILE);
  const article = {
    id: uuidv4(),
    title,
    content,
    authorId,
    categories: categories || [],
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [], // list of comment IDs
    views: 0,
  };
  articles.push(article);
  await filedb.writeAll(FILE, articles);
  res.status(201).json(article);
});

// PUBLIC_INTERFACE
// Update article
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  update.updatedAt = new Date().toISOString();
  const updated = await filedb.updateById(FILE, id, update);
  if (!updated) return res.status(404).json({ error: 'Article not found' });
  res.json(updated);
});

// PUBLIC_INTERFACE
// Delete article
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const success = await filedb.deleteById(FILE, id);
  if (!success) return res.status(404).json({ error: 'Article not found' });
  res.json({ message: 'Article deleted.' });
});

module.exports = router;
