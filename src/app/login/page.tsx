"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { requestCode, verifyCode } from "@/lib/api";

type Step = "chatid" | "code";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<Step>("chatid");
  const [chatId, setChatId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("grain_session_token");
    if (stored) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const numericId = parseInt(chatId.trim(), 10);
    if (isNaN(numericId) || numericId <= 0) {
      setError("Please enter a valid Telegram Chat ID (numbers only).");
      setLoading(false);
      return;
    }

    try {
      await requestCode(numericId);
      setSuccess("Code sent! Check your Telegram.");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setError("Please enter the 6-digit code.");
      setLoading(false);
      return;
    }

    const numericId = parseInt(chatId.trim(), 10);

    try {
      const res = await verifyCode(numericId, trimmedCode);
      setAuth(res.user, res.session_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
      setLoading(false);
    }
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

        <h1 className="text-xl font-semibold text-text-primary mb-2">Welcome to Grain</h1>
        <p className="text-sm text-text-secondary mb-6">
          {step === "chatid"
            ? "Enter your Telegram Chat ID to receive a login code."
            : "Enter the 6-digit code sent to your Telegram."}
        </p>

        {step === "chatid" ? (
          <form onSubmit={handleRequestCode} className="space-y-4 text-left">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Telegram Chat ID</label>
              <input
                type="text"
                inputMode="numeric"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full bg-bg-page border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                placeholder="e.g. 123456789"
                required
              />
              <p className="mt-1 text-xs text-text-muted">
                Send /start to @higrain_bot, then forward any message to @userinfobot to find your Chat ID.
              </p>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm rounded-md bg-accent text-bg-page font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Login Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4 text-left">
            {success && <p className="text-sm text-accent">{success}</p>}

            <div>
              <label className="block text-sm text-text-secondary mb-1">Login Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-bg-page border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
                autoFocus
                required
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm rounded-md bg-accent text-bg-page font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("chatid"); setCode(""); setError(""); setSuccess(""); }}
              className="w-full text-xs text-text-muted hover:underline"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
