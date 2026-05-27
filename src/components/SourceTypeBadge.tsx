"use client";

const SOURCE_ICONS: Record<string, string> = {
  telegram_text: "💬",
  link: "🔗",
  pdf: "📄",
  screenshot: "📸",
  manual: "✏️",
};

export default function SourceTypeBadge({ sourceType }: { sourceType: string | null }) {
  if (!sourceType) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-surface text-text-secondary">
      <span>{SOURCE_ICONS[sourceType] || "📝"}</span>
      <span>{sourceType.replace("_", " ")}</span>
    </span>
  );
}
