import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import ArticleList from "./components/ArticleList";
import ArticleEditor from "./components/ArticleEditor";
import ArticleView from "./components/ArticleView";
import UserProfile from "./components/UserProfile";
import CategoryList from "./components/CategoryList";
import TagList from "./components/TagList";
import AuthPage from "./components/AuthPage";
import {
  fetchArticles,
  fetchArticleById,
  fetchComments,
  fetchUsers,
  createOrUpdateArticle,
  deleteArticle,
  createComment,
  deleteComment,
  fetchCategories,
  fetchTags,
  fetchUserById,
  searchArticles
} from "./api";
import { useAuth } from "./auth";
import styled from "styled-components";
import { fetchUserFollowing } from "./api";

function MainLayout({ children, onSearch }) {
  // Flex main + sidebar
  return (
    <div style={{
      marginTop: 88,
      display: "flex",
      maxWidth: 1200,
      marginLeft: "auto",
      marginRight: "auto",
      minHeight: "83vh",
      boxSizing: "border-box"
    }}>
      <Sidebar onSearch={onSearch}/>
      <div style={{ flex: 1, minWidth: 0, marginLeft: 30 }}>
        {children}
      </div>
    </div>
  );
}

import { useAuth } from "./auth";
import styled from "styled-components";
import { fetchUserFollowing } from "./api";

// Styled for blue/bright post creation area
const NewPostBox = styled.div`
  background: #f2faff;
  border: 1.5px solid #90caf9;
  border-radius: 14px;
  margin-bottom: 30px;
  padding: 20px 20px 16px 20px;
  box-shadow: 0 3px 18px 0 rgba(33,150,243,0.05);
`;

const TabBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 16px;
`;
const TabButton = styled.button`
  background: ${({active}) => active ? "#1976d2" : "#e3f2fd"};
  color: ${({active}) => active ? "#fff" : "#1976d2"};
  border: none;
  border-radius: 5px 5px 0 0;
  padding: 12px 20px 9px 20px;
  font-size: 1.13rem;
  font-weight: bold;
  cursor: pointer;
  margin-right: 6px;
  border-bottom: ${({active}) => active ? "3px solid #1976d2" : "1.5px solid #bbdefb" };
  transition: all .16s;
`;

const DeleteBtn = styled.button`
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 7px 11px;
  font-size: 0.97rem;
  font-weight: 600;
  margin-left: 16px;
  cursor: pointer;
  &:hover { background: #1976d2ee; }
`;

function Home() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");

  // Tabs: global = all, feed = self+following
  const [tab, setTab] = useState(user ? "feed" : "global");
  const [following, setFollowing] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creatingTitle, setCreatingTitle] = useState("");
  const [creatingContent, setCreatingContent] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  // Load all data
  useEffect(() => {
    (async () => {
      setUsers(await fetchUsers());
      setTags(await fetchTags());
      setArticles(await fetchArticles());
      if (user) {
        setFollowing(await fetchUserFollowing(user.id));
      }
    })();
  }, [user]);

  // Tab select handler
  const handleTab = (which) => {
    setTab(which);
    setSearch("");
  };

  // Search
  const handleSearch = async (q) => {
    setSearch(q);
    if (q) {
      setArticles(await searchArticles(q));
    } else {
      setArticles(await fetchArticles());
    }
  };

  // Create new post
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!creatingTitle.trim() || !creatingContent.trim()) {
      setCreateError("Title and content required.");
      return;
    }
    setPostLoading(true);
    try {
      const post = await createOrUpdateArticle({
        title: creatingTitle.trim(),
        content: creatingContent.trim(),
        authorId: user.id
      });
      setArticles([post, ...articles]);
      setCreatingTitle("");
      setCreatingContent("");
      setCreating(false);
    } catch (err) {
      setCreateError("Failed to submit article.");
    }
    setPostLoading(false);
  };

  // Delete post handler
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    try {
      await deleteArticle(id);
      setArticles(articles.filter(a => a.id !== id));
    } catch {
      // Optionally show error
    }
  };

  // For feed: filter posts by user or followed
  let displayArticles = articles;
  if (tab === "feed" && user) {
    const allowed = new Set([user.id, ...(following||[])]);
    displayArticles = articles.filter(a => allowed.has(a.authorId));
  }

  // Only allow create/delete for logged in users
  // Render create new post box at top (blue theme)
  // Delete button only for users own posts

  return (
    <MainLayout onSearch={handleSearch}>
      <TabBar>
        <TabButton
          onClick={() => handleTab("feed")}
          active={tab==="feed"}
          disabled={!user}
        >
          Your Feed
        </TabButton>
        <TabButton
          onClick={() => handleTab("global")}
          active={tab==="global"}
        >
          Global Feed
        </TabButton>
      </TabBar>

      {user && (
        <NewPostBox>
          <form onSubmit={handleCreate} autoComplete="off">
            <div style={{marginBottom: 8, fontWeight: 600, color:'#1976d2'}}>Create New Post</div>
            <input
              style={{
                width:"98%",fontSize:"1.11rem",padding:"9px 6px",marginBottom:8,borderRadius:6,border:"1.3px solid #90caf9",background:"#fff",color:"#1976d2"
              }}
              type="text"
              placeholder="Post title"
              value={creatingTitle}
              onChange={e=>setCreatingTitle(e.target.value)}
            />
            <textarea
              style={{
                width:"98%",fontSize:"1.03rem",padding:"7px 6px",marginBottom:10,borderRadius:6,border:"1.3px solid #90caf9",background:"#fff",color:"#1976d2",minHeight:64
              }}
              placeholder="What do you want to share?"
              value={creatingContent}
              onChange={e=>setCreatingContent(e.target.value)}
            />
            {createError && <div style={{color:"#c62828",marginBottom:4,fontWeight:500}}>{createError}</div>}
            <button
              className="btn"
              type="submit"
              disabled={postLoading}
              style={{background:"#1976d2",color:"#fff",fontWeight:"bold",padding:"9px 22px",borderRadius:8,fontSize:"1.09rem",border:"none",marginTop:3}}
            >
              {postLoading?"Posting...":"Publish"}
            </button>
          </form>
        </NewPostBox>
      )}

      <h1 style={{ fontSize: "2.1rem", color: "#1976d2", margin: "0 0 24px 0", fontWeight:700 }}>
        {search ? `Results for "${search}"` : tab==="feed" && user ? "Your Feed" : "Global Feed"}
      </h1>

      <ArticleList
        articles={displayArticles}
        users={users}
        tags={tags}
        renderActions={user ? (article) =>
          article.authorId === user.id
            ? <DeleteBtn type="button" onClick={() => handleDelete(article.id)}>Delete</DeleteBtn>
            : null
        : null}
      />

      {!user &&
        <div style={{marginTop:22, fontSize:"1.07rem", color:"#1976d2"}}>
          Want to create posts and follow people? <b><a href="/login" style={{color:"#1976d2"}}>Sign in</a></b> to join the conversation!
        </div>
      }
    </MainLayout>
  );
}

// Article create/edit
function WriteArticle() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchTags().then(setTags);
  }, []);

  const handleSave = async (data) => {
    // TODO: Replace authorId with actual session
    await createOrUpdateArticle({ ...data, authorId: "mock-author" });
    navigate("/");
  };

  return (
    <MainLayout>
      <h1 style={{ color: "var(--kavia-orange)" }}>Write New Article</h1>
      <ArticleEditor
        onSave={handleSave}
        categories={categories}
        tags={tags}
      />
    </MainLayout>
  );
}

// Article view (with comments)
function ViewArticle() {
  const { pathname } = useLocation();
  const articleId = pathname.split("/").pop();
  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [tags, setTags] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentUsers, setCommentUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const art = await fetchArticleById(articleId);
      setArticle(art);
      if (art?.authorId) {
        setAuthor(await fetchUserById(art.authorId));
      }
      setTags(await fetchTags());
      setComments(await fetchComments(articleId));
      const allUsers = await fetchUsers();
      setCommentUsers(allUsers);
    })();
  }, [articleId]);

  const handleAddComment = async ({ articleId, userId, text }) => {
    await createComment({ articleId, userId, text });
    setComments(await fetchComments(articleId));
  };
  const handleDeleteComment = async (id) => {
    await deleteComment(id);
    setComments(await fetchComments(articleId));
  };

  return (
    <MainLayout>
      <ArticleView
        article={article}
        author={author}
        comments={comments}
        commentUsers={commentUsers}
        tags={tags.filter(t => article?.tags?.includes(t.id))}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />
    </MainLayout>
  );
}

// User profile page
function Profile() {
  const [user, setUser] = useState(null);
  const [userArticles, setUserArticles] = useState([]);
  const [tags, setTags] = useState([]);
  useEffect(() => {
    (async () => {
      // TEMP: Show details for first user
      const users = await fetchUsers();
      if (users.length > 0) {
        setUser(users[0]);
        const allArticles = await fetchArticles();
        setUserArticles(allArticles.filter(a => a.authorId === users[0].id));
      }
      setTags(await fetchTags());
    })();
  }, []);
  return (
    <MainLayout>
      <UserProfile user={user} myArticles={userArticles} tags={tags} />
    </MainLayout>
  );
}

// Categories page
function Categories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => { fetchCategories().then(setCategories); }, []);
  return (
    <MainLayout>
      <h1 style={{ color: "var(--kavia-orange)" }}>All Categories</h1>
      <CategoryList categories={categories}/>
    </MainLayout>
  );
}

// Tags page
function Tags() {
  const [tags, setTags] = useState([]);
  useEffect(() => { fetchTags().then(setTags); }, []);
  return (
    <MainLayout>
      <h1 style={{ color: "var(--kavia-orange)" }}>All Tags</h1>
      <TagList tags={tags}/>
    </MainLayout>
  );
}

export default function AppRoutes() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Optionally, protect these with authentication wrapper: */}
        <Route path="/articles/new" element={<WriteArticle />} />
        <Route path="/articles/:id" element={<ViewArticle />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/tags" element={<Tags />} />
        {/* Additional category/tag route can be inserted here */}
      </Routes>
      <Footer />
    </>
  );
}
