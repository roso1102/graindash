"use client";

import Link from "next/link";
import type { Note } from "@/types";

function truncate(text: string | null, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function NoteCard({ note }: { note: Note }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="block no-underline group"
    >
      <div className="bg-surface border border-border rounded-lg p-5 transition-all duration-150 hover:border-accent hover:bg-surface-hover hover:-translate-y-0.5">
        <div className="flex items-center gap-2 mb-2">
          {note.topic_id && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent">
              Topic
            </span>
          )}
          {note.source_type && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-info/15 text-info">
              {note.source_type}
            </span>
          )}
          <span className="text-xs text-text-muted ml-auto">{timeAgo(note.created_at)}</span>
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-1 truncate group-hover:text-accent transition-colors">
          {note.title || "Untitled"}
        </h3>
        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
          {truncate(note.summary, 120)}
        </p>
      </div>
    </Link>
  );
}
