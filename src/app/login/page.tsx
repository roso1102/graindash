"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { setLoading(false); router.push("/dashboard"); }
  };

  const handleMagicLink = async () => {
    if (!email) { setError("Enter your email first"); return; }
    setMagicLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/auth/callback" },
    });
    if (error) { setError(error.message); } else { setMagicSent(true); }
    setMagicLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) { setError("Enter email and password"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin + "/auth/callback" },
    });
    if (error) { setError(error.message); } else { setMagicSent(true); }
    setLoading(false);
  };

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

        {magicSent ? (
          <div className="py-4">
            <p className="text-sm text-text-secondary">Check your email for a login link.</p>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-bg-page border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-bg-page border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors" placeholder="Your password" required />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}


            <button type="submit" disabled={loading} className="w-full px-4 py-2 text-sm rounded-md bg-accent text-bg-page font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="flex items-center gap-2 text-xs text-text-muted">
              <div className="flex-1 h-px bg-border" />
              <span>or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button type="button" onClick={handleMagicLink} disabled={magicLoading} className="w-full px-4 py-2 text-sm rounded-md bg-surface border border-border text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50">
              {magicLoading ? "Sending..." : "Send Magic Link"}
            </button>

            <button type="button" onClick={handleSignUp} disabled={loading} className="w-full px-4 py-2 text-sm rounded-md bg-surface border border-border text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50">
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}