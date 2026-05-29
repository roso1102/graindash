"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#d4a574" strokeWidth="2.5" />
              <path d="M24 10 L24 38 M18 16 L24 10 L30 16 M14 28 L24 38 L34 28" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-3xl font-semibold text-text-primary">Grain</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">Your Personal Knowledge Operating System</h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-12">Capture anything. AI organizes automatically. Explore your knowledge graph.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-page rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors no-underline">Login</Link>
        </div>
      </div>
      <footer className="text-center py-4 text-xs text-text-muted border-t border-border">Grain PKOS</footer>
    </div>
  );
}