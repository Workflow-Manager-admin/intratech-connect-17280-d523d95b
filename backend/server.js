const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer"); // For avatar uploads
const { v4: uuidv4 } = require("uuid");
// AUTH SUPPORT LIBS
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const DATA_DIR = path.resolve(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function loadData(name, defaultData) {
  const file = path.resolve(DATA_DIR, name + ".json");
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2), "utf-8");
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function saveData(name, data) {
  const file = path.resolve(DATA_DIR, name + ".json");
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}
const initial = {
  articles: [],
  comments: [],
  categories: [],
  tags: [],
  users: []
};

const getDb = () => {
  // Reload for every request for simplicity
  return {
    articles: loadData("articles", initial.articles),
    comments: loadData("comments", initial.comments),
    categories: loadData("categories", initial.categories),
    tags: loadData("tags", initial.tags),
    users: loadData("users", initial.users)
  };
};

const setDb = (db) => {
  Object.entries(db).forEach(([k, v]) => saveData(k, v));
};

// --- AUTH UTILS ----
const JWT_SECRET = process.env.JWT_SECRET || "devsecret42changeme";
const JWT_EXPIRY = "7d";

function findUserByEmail(email, users) {
  return users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
}

// Select which user fields to expose to client
function exposedUser(user) {
  if (!user) return null;
  // Omit passwordHash from output
  const { passwordHash, ...rest } = user;
  return rest;
}

// Generate JWT for a user
function createToken(user) {
  // Only minimally encode user: id, name, email, role.
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ---- Avatar upload storage ---
// Save to ./uploads and generate unique filename
const UPLOADS_PATH = path.resolve(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_PATH)) fs.mkdirSync(UPLOADS_PATH);

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_PATH);
  },
  filename: function (req, file, cb) {
    // Unique filename: user-UUID.ext
    const ext = path.extname(file.originalname).toLowerCase();
    const fname = "avatar-" + req.user.id + "-" + uuidv4() + ext;
    cb(null, fname);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB max
  fileFilter: function (req, file, cb) {
    // Accept images only
    const mimeOk = ["image/png", "image/jpeg", "image/jpg"];
    if (mimeOk.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only png and jpg allowed."));
  }
});

// ---- JWT AUTH MIDDLEWARE ----
function requireAuth(req, res, next) {
  // Header format: Authorization: Bearer <token>
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Missing auth token." });
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Malformed auth header." });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid or expired token." });
    req.user = decoded; // contains {id, name, email, role}
    next();
  });
}

// Utility for admin-only endpoints
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin privileges required." });
  }
  next();
}

// ---- AUTH ROUTES ----

// PUBLIC_INTERFACE
app.post("/api/auth/register", async (req, res) => {
  /**
   * Request body: { name, email, password }
   * Response: { token, user } or error message
   */
  const { name, email, password } = req.body || {};
  // Basic validation
  if (
    !name || typeof name !== "string" || name.trim().length < 2 ||
    !email || typeof email !== "string" || !/^[^@]+@[^@]+\.[^@]+$/.test(email) ||
    !password || typeof password !== "string" || password.length < 5
  ) {
    return res.status(400).json({ error: "Invalid registration fields." });
  }

  let db = getDb();
  let { users } = db;

  if (findUserByEmail(email, users)) {
    return res.status(409).json({ error: "Email already registered." });
  }

  // Hash password
  let passwordHash;
  try {
    passwordHash = await bcrypt.hash(password, 10);
  } catch {
    return res.status(500).json({ error: "Failed to hash password." });
  }

  const id = Date.now();
  const user = {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: "user",
    passwordHash,
    bio: "",
    avatar: ""
  };
  users.push(user);
  setDb({ ...db, users });

  // Issue JWT
  const token = createToken(user);
  res.status(201).json({ token, user: exposedUser(user) });
});

// PUBLIC_INTERFACE
app.post("/api/auth/login", async (req, res) => {
  /**
   * Request body: { email, password }
   * Response: { token, user } or error message
   */
  const { email, password } = req.body || {};
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    return res.status(400).json({ error: "Missing email or password." });
  }

  let { users } = getDb();
  const user = findUserByEmail(email, users);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  // Compare hash
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = createToken(user);
  res.json({ token, user: exposedUser(user) });
});

// ---- ARTICLES ----

// PUBLIC_INTERFACE
app.get("/api/articles", (req, res) => {
  /**
   * Query params: search, category, tag, author
   */
  const { search, category, tag, author } = req.query;
  let { articles } = getDb();

  if (search)
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase())
    );

  if (category)
    articles = articles.filter((a) => a.category === category);

  if (tag)
    articles = articles.filter((a) => a.tags && a.tags.includes(tag));

  if (author)
    articles = articles.filter((a) => a.authorId == author);

  res.json(articles);
});

// PUBLIC_INTERFACE
app.get("/api/articles/:id", (req, res) => {
  const { id } = req.params;
  const { articles } = getDb();
  const article = articles.find((a) => a.id == id);
  if (!article) return res.status(404).json({ error: "Not found" });
  res.json(article);
});

/*
 * All article modifications require authentication.
 */
// PUBLIC_INTERFACE
app.post("/api/articles", requireAuth, (req, res) => {
  const db = getDb();
  let { articles } = db;
  const article = {
    ...req.body,
    authorId: req.user.id, // always set from JWT payload, ignore client
    id: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
  };
  articles.push(article);
  setDb({ ...db, articles });
  res.status(201).json(article);
});

// PUBLIC_INTERFACE
app.put("/api/articles/:id", requireAuth, (req, res) => {
  const db = getDb();
  let { articles } = db;
  const idx = articles.findIndex((a) => a.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  // Only author or admin can edit
  if (articles[idx].authorId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not allowed." });
  }
  articles[idx] = {
    ...articles[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  setDb({ ...db, articles });
  res.json(articles[idx]);
});

// PUBLIC_INTERFACE
app.delete("/api/articles/:id", requireAuth, (req, res) => {
  const db = getDb();
  let { articles, comments } = db;
  const article = articles.find((a) => a.id == req.params.id);
  if (!article) return res.sendStatus(204);
  // Only author or admin can delete
  if (article.authorId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not allowed." });
  }
  articles = articles.filter((a) => a.id != req.params.id);
  comments = comments.filter((c) => c.articleId != req.params.id);
  setDb({ ...db, articles, comments });
  res.sendStatus(204);
});

// ---- COMMENTS ----

// PUBLIC_INTERFACE
app.get("/api/articles/:articleId/comments", (req, res) => {
  const { articleId } = req.params;
  const { comments } = getDb();
  res.json(comments.filter((c) => c.articleId == articleId));
});

/*
 * Comment posting requires authentication.
 */
// PUBLIC_INTERFACE
app.post("/api/articles/:articleId/comments", requireAuth, (req, res) => {
  const db = getDb();
  let { comments, articles } = db;
  const comment = {
    id: Date.now(),
    articleId: Number(req.params.articleId),
    authorId: req.user.id,
    content: req.body.content,
    createdAt: new Date().toISOString(),
  };
  comments.push(comment);
  // Also track comment IDs in the article object
  const idx = articles.findIndex((a) => a.id == req.params.articleId);
  if (idx !== -1) {
    articles[idx].comments = articles[idx].comments || [];
    articles[idx].comments.push(comment.id);
  }
  setDb({ ...db, comments, articles });
  res.status(201).json(comment);
});

// ---- CATEGORIES ----

// PUBLIC_INTERFACE
app.get("/api/categories", (req, res) => {
  const { categories } = getDb();
  res.json(categories);
});

/*
 * Category creation requires admin auth.
 */
 // PUBLIC_INTERFACE
app.post("/api/categories", requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  let { categories } = db;
  const cat = { id: Date.now(), ...req.body };
  categories.push(cat);
  setDb({ ...db, categories });
  res.status(201).json(cat);
});

// PUBLIC_INTERFACE
app.put("/api/categories/:id", requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  let { categories } = db;
  const idx = categories.findIndex(cat => cat.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Category not found" });
  categories[idx] = { ...categories[idx], ...req.body };
  setDb({ ...db, categories });
  res.json(categories[idx]);
});

// PUBLIC_INTERFACE
app.delete("/api/categories/:id", requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  let { categories, articles } = db;
  const idx = categories.findIndex(cat => cat.id == req.params.id);
  if (idx === -1) return res.sendStatus(204);
  const deleted = categories[idx];
  categories = categories.filter(cat => cat.id != req.params.id);
  // Optionally, nullify/remove the category from articles
  articles = articles.map(article =>
    article.category === deleted.name ? { ...article, category: "" } : article
  );
  setDb({ ...db, categories, articles });
  res.sendStatus(204);
});

// ---- TAGS ----

// PUBLIC_INTERFACE
app.get("/api/tags", (req, res) => {
  const { tags } = getDb();
  res.json(tags);
});

/*
 * Tag creation requires admin auth.
 */
 // PUBLIC_INTERFACE
app.post("/api/tags", requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  let { tags } = db;
  const tag = { id: Date.now(), ...req.body };
  tags.push(tag);
  setDb({ ...db, tags });
  res.status(201).json(tag);
});

// PUBLIC_INTERFACE
app.put("/api/tags/:id", requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  let { tags } = db;
  const idx = tags.findIndex(tag => tag.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Tag not found" });
  tags[idx] = { ...tags[idx], ...req.body };
  setDb({ ...db, tags });
  res.json(tags[idx]);
});

// PUBLIC_INTERFACE
app.delete("/api/tags/:id", requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  let { tags, articles } = db;
  const idx = tags.findIndex(tag => tag.id == req.params.id);
  if (idx === -1) return res.sendStatus(204);
  const deleted = tags[idx];
  tags = tags.filter(tag => tag.id != req.params.id);
  // Remove tag from all articles
  articles = articles.map(article => ({
    ...article,
    tags: Array.isArray(article.tags)
      ? article.tags.filter(t => t !== deleted.name)
      : article.tags,
  }));
  setDb({ ...db, tags, articles });
  res.sendStatus(204);
});

/**
 * Avatar image upload. POST /api/users/:id/avatar
 * Only the authenticated user or admin can upload/change avatar for themselves.
 * Saves file to uploads, sets user.avatar to /uploads/filename.ext and persists.
 */
// PUBLIC_INTERFACE
app.post("/api/users/:id/avatar", requireAuth, avatarUpload.single("avatar"), (req, res) => {
  const { id } = req.params;
  let db = getDb();
  let { users } = db;
  const idx = users.findIndex((u) => u.id == id);

  if (idx === -1) return res.status(404).json({ error: "Not found" });

  // Only user OR admin
  if (req.user.id != id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not allowed to update avatar." });
  }
  // Only accept a file named "avatar"
  if (!req.file) return res.status(400).json({ error: "No file uploaded. Use 'avatar' field." });

  // Generate relative path (how frontend accesses it)
  const avatarUrl = "/uploads/" + req.file.filename;
  users[idx].avatar = avatarUrl;
  setDb({ ...db, users });

  res.json(exposedUser(users[idx]));
});

// ---- USERS ----

// PUBLIC_INTERFACE
app.get("/api/users", (req, res) => {
  const { users } = getDb();
  res.json(users);
});

// PUBLIC_INTERFACE
app.get("/api/users/:id", (req, res) => {
  const { users } = getDb();
  const user = users.find((u) => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

/*
 * New user creation (shouldn't be available other than registration).
 * If kept, restrict to admin.
 *
 * Profile update route: PATCH or PUT to /api/users/:id
 */
app.post("/api/users", requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  let { users } = db;
  const user = { id: Date.now(), ...req.body };
  users.push(user);
  setDb({ ...db, users });
  res.status(201).json(user);
});

// PUBLIC_INTERFACE
app.put("/api/users/:id", requireAuth, (req, res) => {
  // Profile editing: only user themself (req.user.id == :id) or admin
  const { id } = req.params;
  const db = getDb();
  let { users } = db;
  const idx = users.findIndex((u) => u.id == id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  // Only user themselves or admin can edit
  if (req.user.id != id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not allowed to edit." });
  }
  // Only allow changing name, bio, avatar (not id/role/email/password!)
  users[idx] = {
    ...users[idx],
    name: req.body.name ?? users[idx].name,
    bio: req.body.bio ?? users[idx].bio,
    // If string, use new avatar; otherwise keep same
    avatar:
      typeof req.body.avatar === "string"
        ? req.body.avatar
        : users[idx].avatar
  };
  setDb({ ...db, users });
  res.json(exposedUser(users[idx]));
});

// ---- SEARCH ----
// PUBLIC_INTERFACE
app.get("/api/search", (req, res) => {
  const { q } = req.query;
  let { articles, users } = getDb();
  const results = {
    articles: [],
    users: []
  };
  if (q) {
    const qLower = q.toLowerCase();
    results.articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(qLower) ||
        a.content.toLowerCase().includes(qLower) ||
        (a.tags && a.tags.some((tg) => tg.toLowerCase().includes(qLower)))
    );
    results.users = users.filter((u) => u.name.toLowerCase().includes(qLower));
  }
  res.json(results);
});

// ---- Serve uploads ----
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- Basic home route ----
app.get("/", (req, res) => {
  res.json({ status: "IntraTech Connect backend running" });
});

// PUBLIC_INTERFACE
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
