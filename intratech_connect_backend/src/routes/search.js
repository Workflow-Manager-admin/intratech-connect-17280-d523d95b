const express = require('express');
const filedb = require('../utils/filedb');

const router = express.Router();
const ARTICLES_FILE = 'articles.json';

// PUBLIC_INTERFACE
// Search articles by keyword, category, or tag
router.get('/', async (req, res) => {
  const { q, category, tag } = req.query;
  let articles = await filedb.readAll(ARTICLES_FILE);

  if (q) {
    const qLower = q.toLowerCase();
    articles = articles.filter(article =>
      (article.title && article.title.toLowerCase().includes(qLower)) ||
      (article.content && article.content.toLowerCase().includes(qLower))
    );
  }
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

module.exports = router;
