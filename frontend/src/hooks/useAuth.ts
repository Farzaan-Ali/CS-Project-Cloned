// useAuth.ts
// bootstraps CSRF cookie on mount, then checks for existing session
// All POST requests include the X-CSRFToken header read from the cookie

import { useState, useEffect } from "react";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const API = "/api";

// reads the csrftoken cookie Django sets after GET /api/csrf/
function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "";
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const init = async () => {
      //1. Get CSRF cookie, needed for subsequent POST reqeusts
      await fetch(`${API}/csrf/`, { credentials: "include" });

      // 2. Check if theres already an active session
      try {
        const res = await fetch(`${API}/me/`, { credentials: "include" });
        const data = res.ok ? await res.json() : null;
        setState({ user: data, loading: false, error: null });
      } catch {
        setState({ user: null, loading: false, error: null });
      }
    };
    init();
  }, []);

  const login = async (username: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/login/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({ email: username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.detail ?? "Invalid username or password.";
        setState((s) => ({ ...s, loading: false, error: msg }));
        return msg;
      }

      const meRes = await fetch(`${API}/me/`, { credentials: "include" });
      const user: AuthUser = await meRes.json();
      setState({ user, loading: false, error: null });
      return null;
    } catch {
      const msg = "Network error. Please try again.";
      setState({ user: null, loading: false, error: msg });
      return msg;
    }
  };

  const logout = async () => {
    await fetch(`${API}/logout/`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    setState({ user: null, loading: false, error: null });
  };

  return { user: state.user, loading: state.loading, error: state.error, login, logout };
}