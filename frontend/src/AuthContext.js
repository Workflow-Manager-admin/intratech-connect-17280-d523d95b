import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Auth context for global user state and helpers.
const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    try {
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(false);

  // Restore session if page reloads (optional: could verify token works with backend)
  useEffect(() => {
    if (token && !user) {
      // Try to restore user from saved data
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
      // (optional: could verify token here)
    }
  }, [token, user]);

  // Helper: Save to both state and localStorage
  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoading(false);
  };

  // PUBLIC_INTERFACE -- return the value
  const value = {
    user,
    token,
    login,
    logout,
    loading,
    setLoading,
    isAuthenticated: !!token && !!user,
  };

  // For all requests: set axios default headers!
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
