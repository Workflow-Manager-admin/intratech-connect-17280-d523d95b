const fs = require('fs-extra');
const path = require('path');

// Resolve data path inside the backend folder
const dataDir = path.resolve(__dirname, '..', 'data');

/**
 * Ensures that the data directory and data file exist.
 * @param {string} filename 
 */
async function ensureFile(filename) {
  await fs.ensureDir(dataDir);
  const filePath = path.join(dataDir, filename);
  if (!(await fs.pathExists(filePath))) {
    await fs.writeJson(filePath, []);
  }
  return filePath;
}

/**
 * Reads all items from a JSON file.
 * @param {string} filename 
 */
async function readAll(filename) {
  const filePath = await ensureFile(filename);
  return await fs.readJson(filePath);
}

/**
 * Write all items to a JSON file.
 * @param {string} filename 
 * @param {Array|Object} data 
 */
async function writeAll(filename, data) {
  const filePath = await ensureFile(filename);
  await fs.writeJson(filePath, data, { spaces: 2 });
  return data;
}

/**
 * Find one by ID from file.
 * @param {string} filename 
 * @param {string} id 
 */
async function findById(filename, id) {
  const items = await readAll(filename);
  return items.find(item => item.id === id);
}

/**
 * Replace/update one by ID.
 * @param {string} filename 
 * @param {string} id 
 * @param {Object} update
 * @returns {Object|null} Updated item or null if not found
 */
async function updateById(filename, id, update) {
  const items = await readAll(filename);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  const updated = { ...items[index], ...update, id };
  items[index] = updated;
  await writeAll(filename, items);
  return updated;
}

/**
 * Delete one by ID.
 * @param {string} filename 
 * @param {string} id 
 * @returns {boolean} true if deleted
 */
async function deleteById(filename, id) {
  const items = await readAll(filename);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return false;
  items.splice(index, 1);
  await writeAll(filename, items);
  return true;
}

module.exports = {
  dataDir,
  ensureFile,
  readAll,
  writeAll,
  findById,
  updateById,
  deleteById,
};
