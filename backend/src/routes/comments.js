const express = require('express');
const { v4: uuidv4 } = require('uuid');
const filedb = require('../utils/filedb');

const router = express.Router();
const FILE = 'comments.json';

// PUBLIC_INTERFACE
// Get all comments (optionally filtered by articleId)
router.get('/', async (req, res) => {
  const { articleId } = req.query;
  let comments = await filedb.readAll(FILE);

  if (articleId) {
    comments = comments.filter(comment => comment.articleId === articleId);
  }
  res.json(comments);
});

// PUBLIC_INTERFACE
// Get a single comment
router.get('/:id', async (req, res) => {
  const comment = await filedb.findById(FILE, req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  res.json(comment);
});

// PUBLIC_INTERFACE
// Create comment
router.post('/', async (req, res) => {
  const { articleId, userId, text } = req.body;
  if (!articleId || !userId || !text) {
    return res.status(400).json({ error: 'articleId, userId and text required.' });
  }
  const comments = await filedb.readAll(FILE);
  const comment = {
    id: uuidv4(),
    articleId,
    userId,
    text,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  comments.push(comment);
  await filedb.writeAll(FILE, comments);
  res.status(201).json(comment);
});

// PUBLIC_INTERFACE
// Update comment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  update.updatedAt = new Date().toISOString();
  const updated = await filedb.updateById(FILE, id, update);
  if (!updated) return res.status(404).json({ error: 'Comment not found' });
  res.json(updated);
});

// PUBLIC_INTERFACE
// Delete comment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const success = await filedb.deleteById(FILE, id);
  if (!success) return res.status(404).json({ error: 'Comment not found' });
  res.json({ message: 'Comment deleted.' });
});

module.exports = router;
