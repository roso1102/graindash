"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getNote, getNoteEntities, getRelatedNotes, listTopics, updateNote, deleteNote } from "@/lib/api";
import type { NoteDetail, EntityRef, Topic } from "@/types";
import TagChip from "@/components/TagChip";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import KnowledgeCard from "@/components/KnowledgeCard";
import MiniGraph from "@/components/MiniGraph";
import { showToast } from "@/components/Toast";

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<NoteDetail | null>(null);
  const [entities, setEntities] = useState<EntityRef[]>([]);
  interface BacklinkRelation {
    source_note_id: string;
    target_note_id: string;
    relation_type: string;
    score: number;
  }
  const [backlinks, setBacklinks] = useState<BacklinkRelation[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editSummary, setEditSummary] = useState("");
  const [showMoveTopic, setShowMoveTopic] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getNote(id), getNoteEntities(id), getRelatedNotes(id), listTopics()])
      .then(([n, e, r, t]) => {
        setNote(n);
        setEntities(n.entities || e.entities);
        setBacklinks((r.relations || []).filter((rel: BacklinkRelation) => rel.target_note_id === id));
        setTopics(t);
        setEditSummary(n.summary || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveSummary = async () => {
    try {
      await updateNote(id, { summary: editSummary });
      setNote((prev) => prev ? { ...prev, summary: editSummary } : prev);
      setEditing(false);
      showToast("Summary updated", "success");
    } catch {
      showToast("Failed to update summary", "error");
    }
  };

  const handleMoveTopic = async (topicId: string) => {
    try {
      await updateNote(id, { topic_id: topicId });
      const topicName = topics.find((t) => t.id === topicId)?.name || "General";
      setNote((prev) => prev ? { ...prev, topic_id: topicId, topic_name: topicName } : prev);
      setShowMoveTopic(false);
      showToast("Topic updated", "success");
    } catch {
      showToast("Failed to update topic", "error");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteNote(id);
      showToast("Note deleted", "success");
      router.push("/dashboard");
    } catch {
      showToast("Failed to delete note", "error");
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!note) return <div className="text-center py-12 text-text-secondary">Note not found.</div>;

  const entityColors: Record<string, string> = {
    concept: "accent",
    technology: "info",
    project: "success",
    person: "warning",
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link href="/dashboard" className="hover:text-accent transition-colors no-underline text-text-muted">Dashboard</Link>
        <span>/</span>
        <span className="text-text-primary">Note</span>
      </div>

      <KnowledgeCard
        note={note}
        topics={topics}
        onEditSummary={() => { setEditing(true); setEditSummary(note.summary || ""); }}
        onMoveTopic={() => setShowMoveTopic(true)}
        onDelete={() => setShowDelete(true)}
      />

      {entities.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">🏷️ Entities</h2>
          <div className="flex flex-wrap gap-2">
            {entities.map((entity) => (
              <Link
                key={entity.id}
                href={`/entities/${entity.id}`}
                className="no-underline"
              >
                <TagChip
                  label={entity.name}
                  variant={(entityColors[entity.type] as any) || "default"}
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {backlinks.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">↩️ Backlinks</h2>
          <div className="space-y-2">
            {backlinks.map((bl, i) => (
              <Link
                key={i}
                href={`/notes/${bl.source_note_id}`}
                className="block no-underline"
              >
                <div className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between hover:border-accent transition-colors">
                  <span className="text-sm text-text-primary">{bl.source_note_id.slice(0, 8)}...</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-info/15 text-info">{bl.relation_type}</span>
                    <span className="text-xs text-text-muted">{(bl.score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {backlinks.length > 0 && (
        <MiniGraph
          centerNodeId={id}
          nodes={[
            { id, title: note.title || "Untitled", topic_name: note.topic_name, topic_id: note.topic_id },
            ...backlinks.map((bl) => ({
              id: bl.source_note_id,
              title: bl.source_note_id.slice(0, 8) + "...",
              topic_name: "",
              topic_id: null,
            })),
          ]}
          links={backlinks.map((bl) => ({
            source: bl.source_note_id,
            target: id,
            relation_type: bl.relation_type,
            score: bl.score,
          }))}
        />
      )}

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Summary">
        <textarea
          value={editSummary}
          onChange={(e) => setEditSummary(e.target.value)}
          rows={10}
          className="w-full bg-bg-page border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors resize-y mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 text-sm rounded-md bg-surface border border-border text-text-secondary hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSummary}
            className="px-4 py-2 text-sm rounded-md bg-accent text-bg-page font-semibold hover:bg-accent-hover transition-colors"
          >
            Save
          </button>
        </div>
      </Modal>

      <Modal open={showMoveTopic} onClose={() => setShowMoveTopic(false)} title="Move to Topic">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => handleMoveTopic(t.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                t.id === note.topic_id
                  ? "bg-accent/15 text-accent"
                  : "bg-bg-page text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        message="This action cannot be undone. The note will be permanently deleted."
        loading={deleting}
      />
    </div>
  );
}
