import { useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  plan: "Free" | "Pro" | "Lifetime";
  createdAt: string;
}

const STORAGE_KEY = "academy-auth-user";

const DEFAULT_USER: User = {
  id: "usr-1",
  name: "D. Lakshmipathi Balaji",
  email: "balaji@example.com",
  role: "AI Engineer",
  plan: "Pro",
  createdAt: "2026-01-15T00:00:00.000Z",
};

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // If not set yet, initialize with default user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function saveStoredUser(user: User | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loginWithEmail = async (email: string, _password: string, name?: string): Promise<User> => {
    setLoading(true);
    // Simulate real auth handshake
    await new Promise((res) => setTimeout(res, 600));
    
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name || email.split("@")[0] || "AI Engineer",
      email,
      role: "AI Engineer Candidate",
      plan: "Pro",
      createdAt: new Date().toISOString(),
    };
    saveStoredUser(newUser);
    setUser(newUser);
    setLoading(false);
    return newUser;
  };

  const loginWithOAuth = async (provider: "google" | "github"): Promise<User> => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 600));

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: provider === "github" ? "GitHub Developer" : "Google Cloud Engineer",
      email: provider === "github" ? "dev@github.com" : "engineer@google.com",
      role: "Senior AI Engineer",
      plan: "Pro",
      createdAt: new Date().toISOString(),
    };
    saveStoredUser(newUser);
    setUser(newUser);
    setLoading(false);
    return newUser;
  };

  const logout = () => {
    saveStoredUser(null);
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    loginWithEmail,
    loginWithOAuth,
    logout,
  };
}

