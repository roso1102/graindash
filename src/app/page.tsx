"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const FEATURES = [
  {
    icon: "📤",
    title: "Capture Anything",
    description: "Send links, text, or files via Telegram. Grain extracts, summarizes, and files it.",
  },
  {
    icon: "🧠",
    title: "AI Organizes Automatically",
    description: "Topics snap together. Entities are extracted. Relations are built. No manual filing.",
  },
  {
    icon: "🕸️",
    title: "Explore Your Knowledge Graph",
    description: "Browse connected ideas. Search semantically. Discover hidden links.",
  },
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("session_token");
    if (token) router.replace("/dashboard");
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

          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
            Your Personal Knowledge Operating System
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-12">
            Capture anything. AI organizes automatically. Explore your knowledge graph.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-surface border border-border rounded-lg p-6 text-left transition-all duration-150 hover:border-accent hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(212,165,116,0.1)]"
              >
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="text-base font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-page rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors no-underline"
          >
            Login with Telegram
          </Link>
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-text-muted border-t border-border">
        Grain PKOS &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
