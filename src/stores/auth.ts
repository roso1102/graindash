import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("grain_session_token");
}

function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("grain_session_token", token);
  } else {
    localStorage.removeItem("grain_session_token");
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getStoredToken(),
  loading: true,
  setAuth: (user, token) => {
    setStoredToken(token);
    set({ user, token, loading: false });
  },
  logout: () => {
    setStoredToken(null);
    set({ user: null, token: null, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));
