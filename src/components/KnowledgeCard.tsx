"use client";

import Link from "next/link";
import type { NoteDetail, Topic } from "@/types";
import StatusBadge from "./StatusBadge";
import SourceTypeBadge from "./SourceTypeBadge";
import TagChip from "./TagChip";

interface ParsedSummary {
  core: string;
  facts: string[];
  whyThisMatters: string;
  status: string;
  linksTo: string;
  body: string;
}

function parseSummary(summary: string | null): ParsedSummary {
  if (!summary) return { core: "", facts: [], whyThisMatters: "", status: "", linksTo: "", body: "" };

  const result: ParsedSummary = { core: "", facts: [], whyThisMatters: "", status: "", linksTo: "", body: "" };
  const lines = summary.split("\n");
  let currentSection = "body";
  const bodyLines: string[] = [];

  for (const line of lines) {
    const coreMatch = line.match(/^\*\*Core:\*\*\s*(.+)/i);
    const factsMatch = line.match(/^\*\*Facts:\*\*/i);
    const whyMatch = line.match(/^\*\*Why This Matters:\*\*\s*(.+)/i);
    const statusMatch = line.match(/^\*\*Status:\*\*\s*(.+)/i);
    const linksMatch = line.match(/^\*\*Links To:\*\*\s*(.+)/i);

    if (coreMatch) {
      result.core = coreMatch[1].trim();
    } else if (factsMatch) {
      currentSection = "facts";
    } else if (whyMatch) {
      result.whyThisMatters = whyMatch[1].trim();
      currentSection = "body";
    } else if (statusMatch) {
      result.status = statusMatch[1].trim();
    } else if (linksMatch) {
      result.linksTo = linksMatch[1].trim();
    } else if (currentSection === "facts" && (line.startsWith("•") || line.startsWith("-"))) {
      result.facts.push(line.replace(/^[•\-]\s*/, "").trim());
    } else if (!coreMatch && currentSection === "body" && line.trim()) {
      bodyLines.push(line);
    }
  }

  if (!result.core && bodyLines.length > 0) {
    result.core = bodyLines.shift() || "";
  }
  result.body = bodyLines.join("\n").trim();
  return result;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface KnowledgeCardProps {
  note: NoteDetail;
  topics?: Topic[];
  onEditSummary?: () => void;
  onMoveTopic?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function KnowledgeCard({ note, onEditSummary, onMoveTopic, onDelete, showActions = true }: KnowledgeCardProps) {
  const parsed = parseSummary(note.summary);

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <SourceTypeBadge sourceType={note.source_type} />
        {parsed.status && <StatusBadge status={parsed.status} />}
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted mb-2">
        <span>📂 {note.topic_name}</span>
        <span className="font-mono">{note.id.slice(0, 6)}</span>
      </div>

      <hr className="border-border my-4" />

      {parsed.core && (
        <div className="mb-4">
          <div className="text-xs text-accent font-semibold mb-1">🔑 Core</div>
          <p className="text-base text-text-primary leading-relaxed">{parsed.core}</p>
        </div>
      )}

      {parsed.body && (
        <div className="mb-4">
          {parsed.body.split("\n").filter(Boolean).map((para, i) => (
            <p key={i} className="text-sm text-text-secondary leading-relaxed mb-2">{para}</p>
          ))}
        </div>
      )}

      {parsed.facts.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-text-primary mb-2">Facts</div>
          <ul className="space-y-1">
            {parsed.facts.map((fact, i) => (
              <li key={i} className="text-sm text-text-secondary flex gap-2">
                <span className="text-accent">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {parsed.whyThisMatters && (
        <div className="mb-4">
          <div className="text-xs text-accent font-semibold mb-1">💡 Why This Matters</div>
          <p className="text-sm text-text-secondary leading-relaxed">{parsed.whyThisMatters}</p>
        </div>
      )}

      {parsed.linksTo && (
        <div className="mb-4">
          <div className="text-xs text-accent font-semibold mb-1">🔗 Links To</div>
          <p className="text-sm text-text-secondary leading-relaxed">{parsed.linksTo}</p>
        </div>
      )}

      {note.personal_insight && (
        <div className="mb-4 border-l-2 border-accent/40 pl-3">
          <div className="text-xs text-accent font-semibold mb-1">💭 Personal Insight</div>
          <p className="text-sm text-text-secondary italic leading-relaxed">{note.personal_insight}</p>
        </div>
      )}

      {note.facets && Object.keys(note.facets).length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-text-primary mb-2">Tags</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(note.facets).map(([key, values]) =>
              values.map((val) => (
                <TagChip key={`${key}:${val}`} label={`${key}: ${val}`} variant="info" />
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-text-muted mt-4 pt-4 border-t border-border">
        {note.source_url && (
          <a
            href={note.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors no-underline text-text-muted"
          >
            🔗 Source
          </a>
        )}
        <span className="ml-auto">{timeAgo(note.created_at)}</span>
      </div>

      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border flex-wrap">
          {onEditSummary && (
            <button
              onClick={onEditSummary}
              className="px-3 py-1.5 text-xs bg-surface border border-border rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              ✏️ Edit Summary
            </button>
          )}
          {onMoveTopic && (
            <button
              onClick={onMoveTopic}
              className="px-3 py-1.5 text-xs bg-surface border border-border rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              📂 Move Topic
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1.5 text-xs bg-surface border border-border rounded-md text-danger hover:bg-danger/10 transition-colors"
            >
              🗑️ Delete
            </button>
          )}
          <Link
            href={`/graph?highlight=${note.id}`}
            className="px-3 py-1.5 text-xs bg-surface border border-border rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors no-underline"
          >
            🕸️ View Graph
          </Link>
        </div>
      )}
    </div>
  );
}
