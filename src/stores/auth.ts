import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}


export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setAuth: (user, _token) => {
    set({ user, loading: false });
  },
  logout: () => {
    set({ user: null, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));