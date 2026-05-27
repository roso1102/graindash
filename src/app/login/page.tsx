"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginTelegram, getMe } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, unknown>) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("session_token");
    if (token) {
      getMe()
        .then(() => router.replace("/dashboard"))
        .catch(() => localStorage.removeItem("session_token"));
    }
  }, [router]);

  useEffect(() => {
    window.onTelegramAuth = async (user: Record<string, unknown>) => {
      setLoading(true);
      setError("");
      try {
        const res = await loginTelegram(user);
        setAuth(
          { id: res.user.id, telegram_chat_id: res.user.telegram_chat_id, display_name: res.user.display_name, created_at: new Date().toISOString() },
          res.session_token
        );
        router.push("/dashboard");
      } catch {
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "GrainPKOSBot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "window.onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    const container = document.getElementById("telegram-login-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [setAuth, router]);

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-4">
      <div className="bg-surface border border-border rounded-lg p-8 w-full max-w-[420px] text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#d4a574" strokeWidth="2.5" />
            <path d="M24 10 L24 38 M18 16 L24 10 L30 16 M14 28 L24 38 L34 28" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xl font-semibold text-text-primary">Grain</span>
        </div>

        <h1 className="text-xl font-semibold text-text-primary mb-6">Welcome to Grain</h1>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-secondary">Logging in...</span>
          </div>
        ) : (
          <>
            <div id="telegram-login-container" className="flex justify-center py-4" />
            {error && (
              <p className="text-sm text-danger mt-4">{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
