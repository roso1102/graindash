"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getEntity } from "@/lib/api";
import type { EntityDetail } from "@/types";
import NoteCard from "@/components/NoteCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

const TYPE_COLORS: Record<string, string> = {
  concept: "bg-accent/15 text-accent",
  technology: "bg-info/15 text-info",
  project: "bg-success/15 text-success",
  person: "bg-warning/15 text-warning",
};

export default function EntityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [entity, setEntity] = useState<EntityDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEntity(id)
      .then(setEntity)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!entity) return <div className="text-center py-12 text-text-secondary">Entity not found.</div>;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link href="/dashboard" className="hover:text-accent transition-colors no-underline text-text-muted">Dashboard</Link>
        <span>/</span>
        <Link href="/entities" className="hover:text-accent transition-colors no-underline text-text-muted">Entities</Link>
        <span>/</span>
        <span className="text-text-primary">{entity.name}</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">{entity.name}</h1>
        <span className={`text-xs px-2.5 py-1 rounded-full ${TYPE_COLORS[entity.type] || "bg-surface text-text-secondary"}`}>
          {entity.type}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-text-primary mb-3">Linked Notes</h2>
      {entity.notes.length === 0 ? (
        <EmptyState icon="📝" title="No linked notes" />
      ) : (
        <div className="space-y-3">
          {entity.notes.map((note) => (
            <NoteCard
              key={note.id}
              note={{
                ...note,
                raw_text: null,
                source_url: null,
                source_type: null,
                topic_id: null,
                facets: null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
