"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

const PUBLIC_ROUTES = ["/", "/login"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout, setLoading, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isPublic) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const storedToken = localStorage.getItem("grain_session_token");

    if (!storedToken) {
      router.replace("/login");
      setLoading(false);
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then((user) => {
        setAuth(user, storedToken);
      })
      .catch(() => {
        localStorage.removeItem("grain_session_token");
        logout();
        router.replace("/login");
      });
  }, [pathname, isPublic, setAuth, logout, setLoading, router]);

  if (!isPublic && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-page">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
