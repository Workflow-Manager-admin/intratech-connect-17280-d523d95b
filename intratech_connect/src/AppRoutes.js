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
import {
  fetchArticles,
  fetchArticleById,
  fetchComments,
  fetchUsers,
  createOrUpdateArticle,
  createComment,
  deleteComment,
  fetchCategories,
  fetchTags,
  fetchUserById,
  searchArticles
} from "./api";

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

// Home (shows recent articles)
function Home() {
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");

  const handleSearch = async (q) => {
    setSearch(q);
    if (q) {
      setArticles(await searchArticles(q));
    } else {
      setArticles(await fetchArticles());
    }
  };

  useEffect(() => {
    (async () => {
      setUsers(await fetchUsers());
      setTags(await fetchTags());
      setArticles(await fetchArticles());
    })();
  }, []);

  return (
    <MainLayout onSearch={handleSearch}>
      <h1 style={{ fontSize: "2.2rem", color: "var(--kavia-orange)", margin: "0 0 24px 0" }}>
        {search ? `Results for "${search}"` : "Latest Articles"}
      </h1>
      <ArticleList articles={articles} users={users} tags={tags} />
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
