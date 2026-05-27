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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("session_token") : null,
  loading: true,
  setAuth: (user, token) => {
    localStorage.setItem("session_token", token);
    document.cookie = `session_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    set({ user, token, loading: false });
  },
  logout: () => {
    localStorage.removeItem("session_token");
    document.cookie = "session_token=; path=/; max-age=0";
    set({ user: null, token: null, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));
