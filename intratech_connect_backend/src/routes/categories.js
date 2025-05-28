const express = require('express');
const { v4: uuidv4 } = require('uuid');
const filedb = require('../utils/filedb');

const router = express.Router();
const FILE = 'categories.json';

// PUBLIC_INTERFACE
// Get all categories
router.get('/', async (req, res) => {
  const categories = await filedb.readAll(FILE);
  res.json(categories);
});

// PUBLIC_INTERFACE
// Get category by id
router.get('/:id', async (req, res) => {
  const category = await filedb.findById(FILE, req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category);
});

// PUBLIC_INTERFACE
// Create category
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required.' });
  }
  const categories = await filedb.readAll(FILE);
  const category = {
    id: uuidv4(),
    name,
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  categories.push(category);
  await filedb.writeAll(FILE, categories);
  res.status(201).json(category);
});

// PUBLIC_INTERFACE
// Update category
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  update.updatedAt = new Date().toISOString();
  const updated = await filedb.updateById(FILE, id, update);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

// PUBLIC_INTERFACE
// Delete category
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const success = await filedb.deleteById(FILE, id);
  if (!success) return res.status(404).json({ error: 'Category not found' });
  res.json({ message: 'Category deleted.' });
});

module.exports = router;
