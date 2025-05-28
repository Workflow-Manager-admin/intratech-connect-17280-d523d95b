import { useState, useEffect, useCallback } from "react";

// API endpoints base URL
const API = "/api/auth";

/**
 * PUBLIC_INTERFACE
 * Auth utility for React frontend (login/register/logout/session).
 * Handles session persistence via localStorage, redirects, and error state.
 */
export function useAuth() {
  // React state for session and error
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("sessionUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Save/remove user in localStorage
  const setSession = useCallback(u => {
    if (u) {
      setUser(u);
      localStorage.setItem("sessionUser", JSON.stringify(u));
    } else {
      setUser(null);
      localStorage.removeItem("sessionUser");
    }
  }, []);

  // Login using backend API
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed");
        setSession(null);
        setLoading(false);
        return false;
      }
      setSession(data);
      setLoading(false);
      return data;
    } catch (e) {
      setError("Network error or server unavailable.");
      setSession(null);
      setLoading(false);
      return false;
    }
  }, [setSession]);

  // Register using backend API
  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Registration failed");
        setSession(null);
        setLoading(false);
        return false;
      }
      setSession(data);
      setLoading(false);
      return data;
    } catch (e) {
      setError("Network error or server unavailable.");
      setSession(null);
      setLoading(false);
      return false;
    }
  }, [setSession]);

  // Logout
  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  // Listen to localStorage changes (e.g. in other tabs)
  useEffect(() => {
    function syncAuth(e) {
      if (e.key === "sessionUser") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    }
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  return { user, loading, error, login, register, logout, setError };
}
