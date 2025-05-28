import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ArticlePage from "./pages/ArticlePage";
import NewArticlePage from "./pages/NewArticlePage";
import EditArticlePage from "./pages/EditArticlePage";
import UserProfilePage from "./pages/UserProfilePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthPage from "./pages/AuthPage";
import AllPostsPage from "./pages/AllPostsPage"; // To be created

const App = () => (
  <Routes>
    {/* Auth page without layout (centered) */}
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/" element={<Layout />}>
      {/* Dashboard as home */}
      <Route index element={<HomePage />} />
      <Route path="/dashboard" element={<HomePage />} />
      <Route path="/all-posts" element={<AllPostsPage />} />
      <Route path="/articles/new" element={<NewArticlePage />} />
      <Route path="/articles/:id/edit" element={<EditArticlePage />} />
      <Route path="/articles/:id" element={<ArticlePage />} />
      <Route path="/users/:id" element={<UserProfilePage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
