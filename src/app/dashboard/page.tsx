"use client";

import { useEffect, useState } from "react";
import { getStats, listNotes, listTopics, ingestNote, createTelegramLinkToken } from "@/lib/api";
import type { Stats, Note, Topic } from "@/types";
import NoteCard from "@/components/NoteCard";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import { showToast } from "@/components/Toast";

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-4 w-16 bg-border rounded-full" />
        <div className="h-4 w-20 bg-border rounded-full" />
      </div>
      <div className="h-4 w-3/4 bg-border rounded mb-2" />
      <div className="h-3 w-full bg-border rounded mb-1" />
      <div className="h-3 w-2/3 bg-border rounded" />
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 animate-pulse">
      <div className="h-3 w-16 bg-border rounded mb-2" />
      <div className="h-8 w-12 bg-border rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureText, setCaptureText] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [linkingTelegram, setLinkingTelegram] = useState(false);
  const [nowMs] = useState(() => Date.now());

  useEffect(() => {
    Promise.all([getStats(), listNotes({ sort: "created_at", order: "desc", per_page: 10 }), listTopics()])
      .then(([s, n, t]) => {
        setStats(s);
        setNotes(n.notes);
        setTopics(t);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCapture = async () => {
    if (!captureText.trim()) return;
    setCapturing(true);
    try {
      await ingestNote(captureText.trim(), "manual");
      setCaptureText("");
      showToast("Note captured successfully!", "success");
      const [s, n] = await Promise.all([getStats(), listNotes({ sort: "created_at", order: "desc", per_page: 10 })]);
      setStats(s);
      setNotes(n.notes);
    } catch {
      showToast("Failed to capture note", "error");
    } finally {
      setCapturing(false);
    }
  };

  const handleLinkTelegram = async () => {
    setLinkingTelegram(true);
    try {
      const res = await createTelegramLinkToken();
      window.open(res.telegram_url, "_blank", "noopener,noreferrer");
      showToast("Telegram link opened", "success");
    } catch {
      showToast("Failed to create Telegram link", "error");
    } finally {
      setLinkingTelegram(false);
    }
  };

  const timeAgo = (dateStr: string | null): string => {
    if (!dateStr) return "Never";
    const seconds = Math.floor((nowMs - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <div className="w-72">
          <SearchBar />
        </div>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => <SkeletonStat key={i} />)}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-lg p-5">
              <div className="text-xs text-text-muted mb-1">📝 Notes</div>
              <div className="text-2xl font-bold text-text-primary">{stats?.note_count ?? 0}</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-5">
              <div className="text-xs text-text-muted mb-1">📂 Topics</div>
              <div className="text-2xl font-bold text-text-primary">{stats?.topic_count ?? 0}</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-5">
              <div className="text-xs text-text-muted mb-1">🏷️ Entities</div>
              <div className="text-2xl font-bold text-text-primary">{stats?.entity_count ?? 0}</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-5">
              <div className="text-xs text-text-muted mb-1">🕐 Last Capture</div>
              <div className="text-2xl font-bold text-text-primary">{timeAgo(stats?.last_capture_at ?? null)}</div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 mb-6">
            <textarea
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              placeholder="Paste a link or type a thought..."
              rows={3}
              className="w-full bg-bg-page border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors resize-none mb-3"
            />
            <button
              onClick={handleCapture}
              disabled={capturing || !captureText.trim()}
              className="px-4 py-2 bg-accent text-bg-page text-sm font-semibold rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {capturing ? "Capturing..." : "Capture"}
            </button>
            <button
              onClick={handleLinkTelegram}
              disabled={linkingTelegram}
              className="ml-3 px-4 py-2 bg-surface border border-border text-text-primary text-sm font-semibold rounded-md hover:bg-surface-hover transition-colors disabled:opacity-50"
            >
              {linkingTelegram ? "Opening Telegram..." : "Link Telegram"}
            </button>
          </div>

          {notes.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No notes yet"
              description="Send something to your Telegram bot or use the capture box above to get started."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <h2 className="text-lg font-semibold text-text-primary mb-3">Recent Notes</h2>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-text-primary mb-3">Top Topics</h2>
                <div className="bg-surface border border-border rounded-lg">
                  {topics
                    .sort((a, b) => b.note_count - a.note_count)
                    .slice(0, 10)
                    .map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-surface-hover transition-colors"
                      >
                        <span className="text-sm text-text-primary">{topic.name}</span>
                        <span className="text-xs text-text-muted bg-bg-page px-2 py-0.5 rounded">
                          {topic.note_count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
