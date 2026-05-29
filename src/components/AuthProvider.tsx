"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { getMe } from "@/lib/api";

const PUBLIC_ROUTES = ["/", "/login"];

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { user, setAuth, logout, setLoading, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isPublic) {
      setLoading(false);
      return;
    }

    const storedToken = localStorage.getItem("session_token");
    if (!storedToken) {
      router.replace("/login");
      setLoading(false);
      return;
    }

    if (user) {
      setLoading(false);
      return;
    }

    getMe()
      .then((u) => {
        setAuth(u, storedToken);
      })
      .catch(() => {
        logout();
        router.replace("/login");
      });
  }, [pathname, isPublic, user, setAuth, logout, setLoading, router]);

  if (!isPublic && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-page">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
