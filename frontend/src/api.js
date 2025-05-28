/**
 * API utilities for IntraTech Connect frontend.
 * Handles CRUD for articles, users, categories, tags, comments, search.
 * The API base URL is relative (assuming proxy or same host).
 */

// PUBLIC_INTERFACE
export async function fetchArticles(params = {}) {
  const url = new URL("/api/articles", window.location.origin);
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  const res = await fetch(url);
  return await res.json();
}

// PUBLIC_INTERFACE
export async function fetchArticleById(id) {
  const res = await fetch(`/api/articles/${id}`);
  if (!res.ok) return null;
  return await res.json();
}

// PUBLIC_INTERFACE
export async function createOrUpdateArticle(article, id) {
  const method = id ? "PUT" : "POST";
  const res = await fetch(id ? `/api/articles/${id}` : `/api/articles`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(article)
  });
  return (await res.json());
}

// PUBLIC_INTERFACE
export async function deleteArticle(id) {
  const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
  return await res.json();
}

// PUBLIC_INTERFACE
export async function fetchUsers() {
  const res = await fetch(`/api/users`);
  return await res.json();
}

// PUBLIC_INTERFACE
export async function fetchUserById(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) return null;
  return await res.json();
}

// PUBLIC_INTERFACE
export async function fetchCategories() {
  const res = await fetch(`/api/categories`);
  return await res.json();
}

// PUBLIC_INTERFACE
export async function fetchTags() {
  const res = await fetch(`/api/tags`);
  return await res.json();
}

// PUBLIC_INTERFACE
export async function fetchComments(articleId) {
  const url = new URL("/api/comments", window.location.origin);
  if (articleId) url.searchParams.set("articleId", articleId);
  const res = await fetch(url);
  return await res.json();
}

// PUBLIC_INTERFACE
export async function createComment({ articleId, userId, text }) {
  const res = await fetch(`/api/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId, userId, text })
  });
  return await res.json();
}

// PUBLIC_INTERFACE
export async function deleteComment(id) {
  const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
  return await res.json();
}

// PUBLIC_INTERFACE
export async function searchArticles(q) {
  const url = new URL("/api/search", window.location.origin);
  if (q) url.searchParams.set("q", q);
  const res = await fetch(url);
  return await res.json();
}
