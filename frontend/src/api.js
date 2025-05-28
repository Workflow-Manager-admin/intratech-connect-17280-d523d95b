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

/**
 * PUBLIC_INTERFACE
 * Fetch userIds that the specified user is following.
 */
export async function fetchUserFollowing(userId) {
  if (!userId) return [];
  const res = await fetch(`/api/auth/follow/${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * PUBLIC_INTERFACE
 * Fetch userIds for followers of the specified user.
 */
export async function fetchUserFollowers(userId) {
  if (!userId) return [];
  const res = await fetch(`/api/auth/followers/${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * PUBLIC_INTERFACE
 * Follow another user (by id). Returns { status: 'followed' } on success.
 */
export async function followUser(followerId, followedId) {
  const res = await fetch(`/api/auth/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followerId, followedId }),
  });
  return await res.json();
}

/**
 * PUBLIC_INTERFACE
 * Unfollow a user (by id). Returns { status: 'unfollowed' } on success.
 */
export async function unfollowUser(followerId, followedId) {
  const res = await fetch(`/api/auth/unfollow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followerId, followedId }),
  });
  return await res.json();
}

/**
 * PUBLIC_INTERFACE
 * Fetch detailed user profile info by user id (from /api/auth/profile/:id)
 */
export async function fetchUserProfile(userId) {
  if (!userId) return null;
  const res = await fetch(`/api/auth/profile/${userId}`);
  if (!res.ok) return null;
  return await res.json();
}

/**
 * PUBLIC_INTERFACE
 * Update user profile (PUT /api/auth/profile/:id).
 * Body: any updatable fields (bio, avatarUrl, name...)
 */
export async function updateUserProfile(userId, updates) {
  if (!userId) throw new Error("User id required");
  const res = await fetch(`/api/auth/profile/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return await res.json();
}

// PUBLIC_INTERFACE
export async function searchArticles(q) {
  const url = new URL("/api/search", window.location.origin);
  if (q) url.searchParams.set("q", q);
  const res = await fetch(url);
  return await res.json();
}
