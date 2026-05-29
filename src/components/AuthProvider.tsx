"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import supabase from "@/lib/supabaseClient";

const PUBLIC_ROUTES = ["/", "/login"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, logout, setLoading, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isPublic) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        setLoading(false);
        return;
      }
      const u = session.user;
      setAuth({
        id: u.id,
        telegram_chat_id: 0,
        display_name: u.email || "User",
        created_at: u.created_at,
      }, session.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { logout(); router.replace("/login"); }
    });

    return () => subscription.unsubscribe();
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
