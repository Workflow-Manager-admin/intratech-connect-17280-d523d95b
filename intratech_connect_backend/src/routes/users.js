const express = require('express');
const { v4: uuidv4 } = require('uuid');
const filedb = require('../utils/filedb');

const router = express.Router();
const FILE = 'users.json';

// PUBLIC_INTERFACE
// Get all users
router.get('/', async (req, res) => {
  const users = await filedb.readAll(FILE);
  res.json(users);
});

// PUBLIC_INTERFACE
// Get user by id
router.get('/:id', async (req, res) => {
  const user = await filedb.findById(FILE, req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUBLIC_INTERFACE
// Create user
router.post('/', async (req, res) => {
  const { name, email, bio, avatarUrl } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required.' });
  }
  const users = await filedb.readAll(FILE);
  const user = {
    id: uuidv4(),
    name,
    email,
    bio: bio || '',
    avatarUrl: avatarUrl || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  users.push(user);
  await filedb.writeAll(FILE, users);
  res.status(201).json(user);
});

// PUBLIC_INTERFACE
// Update user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  update.updatedAt = new Date().toISOString();
  const updated = await filedb.updateById(FILE, id, update);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(updated);
});

// PUBLIC_INTERFACE
// Delete user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const success = await filedb.deleteById(FILE, id);
  if (!success) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted.' });
});

module.exports = router;
