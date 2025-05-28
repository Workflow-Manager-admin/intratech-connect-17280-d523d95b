const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

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

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

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

// PUBLIC_INTERFACE
app.post("/api/articles", (req, res) => {
  const db = getDb();
  let { articles } = db;
  const article = {
    ...req.body,
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
app.put("/api/articles/:id", (req, res) => {
  const db = getDb();
  let { articles } = db;
  const idx = articles.findIndex((a) => a.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  articles[idx] = {
    ...articles[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  setDb({ ...db, articles });
  res.json(articles[idx]);
});

// PUBLIC_INTERFACE
app.delete("/api/articles/:id", (req, res) => {
  const db = getDb();
  let { articles, comments } = db;
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

// PUBLIC_INTERFACE
app.post("/api/articles/:articleId/comments", (req, res) => {
  const db = getDb();
  let { comments, articles } = db;
  const comment = {
    id: Date.now(),
    articleId: Number(req.params.articleId),
    authorId: req.body.authorId,
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

// PUBLIC_INTERFACE
app.post("/api/categories", (req, res) => {
  const db = getDb();
  let { categories } = db;
  const cat = { id: Date.now(), ...req.body };
  categories.push(cat);
  setDb({ ...db, categories });
  res.status(201).json(cat);
});

// ---- TAGS ----

// PUBLIC_INTERFACE
app.get("/api/tags", (req, res) => {
  const { tags } = getDb();
  res.json(tags);
});

// PUBLIC_INTERFACE
app.post("/api/tags", (req, res) => {
  const db = getDb();
  let { tags } = db;
  const tag = { id: Date.now(), ...req.body };
  tags.push(tag);
  setDb({ ...db, tags });
  res.status(201).json(tag);
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

// PUBLIC_INTERFACE
app.post("/api/users", (req, res) => {
  const db = getDb();
  let { users } = db;
  const user = { id: Date.now(), ...req.body };
  users.push(user);
  setDb({ ...db, users });
  res.status(201).json(user);
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
