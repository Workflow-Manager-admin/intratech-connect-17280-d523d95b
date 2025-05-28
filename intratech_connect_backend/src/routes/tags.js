const express = require('express');
const { v4: uuidv4 } = require('uuid');
const filedb = require('../utils/filedb');

const router = express.Router();
const FILE = 'tags.json';

// PUBLIC_INTERFACE
// Get all tags
router.get('/', async (req, res) => {
  const tags = await filedb.readAll(FILE);
  res.json(tags);
});

// PUBLIC_INTERFACE
// Get tag by id
router.get('/:id', async (req, res) => {
  const tag = await filedb.findById(FILE, req.params.id);
  if (!tag) return res.status(404).json({ error: 'Tag not found' });
  res.json(tag);
});

// PUBLIC_INTERFACE
// Create tag
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required.' });
  }
  const tags = await filedb.readAll(FILE);
  const tag = {
    id: uuidv4(),
    name,
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tags.push(tag);
  await filedb.writeAll(FILE, tags);
  res.status(201).json(tag);
});

// PUBLIC_INTERFACE
// Update tag
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  update.updatedAt = new Date().toISOString();
  const updated = await filedb.updateById(FILE, id, update);
  if (!updated) return res.status(404).json({ error: 'Tag not found' });
  res.json(updated);
});

// PUBLIC_INTERFACE
// Delete tag
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const success = await filedb.deleteById(FILE, id);
  if (!success) return res.status(404).json({ error: 'Tag not found' });
  res.json({ message: 'Tag deleted.' });
});

module.exports = router;
