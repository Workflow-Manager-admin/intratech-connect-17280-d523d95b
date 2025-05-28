const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const filedb = require('../utils/filedb');
const path = require('path');

const router = express.Router();
const USERS_FILE = 'users.json';
const FOLLOWS_FILE = 'follows.json';

// ===== HELPER =====
// Get safe user object (without password)
function getSafeUser(user) {
  if (!user) return null;
  // omit password field from copy
  const { password, ...safe } = user;
  return safe;
}

/**
 * Ensure username/email uniqueness.
 */
async function isEmailTaken(email) {
  const users = await filedb.readAll(USERS_FILE);
  return users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

// PUBLIC_INTERFACE
// Register new user (with hashed password)
router.post('/register', async (req, res) => {
  const { name, email, password, bio, avatarUrl } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required.' });
  }
  if (await isEmailTaken(email)) {
    return res.status(400).json({ error: 'Email is already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    name,
    email,
    password: passwordHash,
    bio: bio || "",
    avatarUrl: avatarUrl || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const users = await filedb.readAll(USERS_FILE);
  users.push(user);
  await filedb.writeAll(USERS_FILE, users);
  res.status(201).json(getSafeUser(user));
});

// PUBLIC_INTERFACE
// User login (returns safe user if success)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required.' });
  const users = await filedb.readAll(USERS_FILE);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid email or password.' });

  res.json(getSafeUser(user));
});

// PUBLIC_INTERFACE
// Get user profile (excluding password)
router.get('/profile/:id', async (req, res) => {
  const user = await filedb.findById(USERS_FILE, req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(getSafeUser(user));
});

// PUBLIC_INTERFACE
// Update profile (excluding password)
router.put('/profile/:id', async (req, res) => {
  const updates = req.body;
  delete updates.password; // Do not update password in this endpoint
  updates.updatedAt = new Date().toISOString();
  const updated = await filedb.updateById(USERS_FILE, req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  res.json(getSafeUser(updated));
});

// PUBLIC_INTERFACE
// Change password for user
router.post('/profile/:id/password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: 'oldPassword and newPassword required.' });
  const user = await filedb.findById(USERS_FILE, req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return res.status(400).json({ error: 'Incorrect current password.' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const updated = await filedb.updateById(USERS_FILE, req.params.id, { password: passwordHash, updatedAt: new Date().toISOString() });
  res.json({ status: 'success' });
});

// PUBLIC_INTERFACE
// Get list of users followed by a user
router.get('/follow/:followerId', async (req, res) => {
  const { followerId } = req.params;
  const follows = await filedb.readAll(FOLLOWS_FILE);
  const following = follows
    .filter(f => f.followerId === followerId)
    .map(f => f.followedId);
  res.json(following);
});

// PUBLIC_INTERFACE
// Get list of followers for a user
router.get('/followers/:userId', async (req, res) => {
  const { userId } = req.params;
  const follows = await filedb.readAll(FOLLOWS_FILE);
  const followers = follows
    .filter(f => f.followedId === userId)
    .map(f => f.followerId);
  res.json(followers);
});

// PUBLIC_INTERFACE
// Follow a user
router.post('/follow', async (req, res) => {
  const { followerId, followedId } = req.body;
  if (!followerId || !followedId || followerId === followedId)
    return res.status(400).json({ error: 'Invalid follow/unfollow action.' });

  const follows = await filedb.readAll(FOLLOWS_FILE);
  if (follows.some(f => f.followerId === followerId && f.followedId === followedId)) {
    return res.status(400).json({ error: 'Already following.' });
  }
  follows.push({
    id: uuidv4(),
    followerId,
    followedId,
    createdAt: new Date().toISOString()
  });
  await filedb.writeAll(FOLLOWS_FILE, follows);
  res.json({ status: 'followed' });
});

// PUBLIC_INTERFACE
// Unfollow a user
router.post('/unfollow', async (req, res) => {
  const { followerId, followedId } = req.body;
  if (!followerId || !followedId) return res.status(400).json({ error: 'Invalid unfollow action.' });

  let follows = await filedb.readAll(FOLLOWS_FILE);
  const before = follows.length;
  follows = follows.filter(f => !(f.followerId === followerId && f.followedId === followedId));
  if (follows.length === before) {
    return res.status(400).json({ error: 'Not following.' });
  }
  await filedb.writeAll(FOLLOWS_FILE, follows);
  res.json({ status: 'unfollowed' });
});

module.exports = router;
