"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTopicNotes, listTopics, updateTopic } from "@/lib/api";
import type { Topic, Note } from "@/types";
import NoteCard from "@/components/NoteCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import Modal from "@/components/Modal";
import { showToast } from "@/components/Toast";

export default function TopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listTopics()
      .then((topics) => {
        const found = topics.find((t) => t.id === id);
        if (found) {
          setTopic(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(console.error);

    getTopicNotes(id, 1, 20)
      .then((res) => {
        setNotes(res.notes);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    getTopicNotes(id, page, 20)
      .then((res) => {
        setNotes(res.notes);
        setTotal(res.total);
      })
      .catch(console.error);
  }, [id, page]);

  const handleSaveTopic = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateTopic(id, { name: editName.trim(), description: editDescription.trim() || undefined });
      setTopic((prev) => prev ? { ...prev, name: editName.trim(), description: editDescription.trim() || null } : prev);
      setEditing(false);
      showToast("Topic updated", "success");
    } catch {
      showToast("Failed to update topic", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link href="/dashboard" className="hover:text-accent transition-colors no-underline text-text-muted">Dashboard</Link>
        <span>/</span>
        <Link href="/topics" className="hover:text-accent transition-colors no-underline text-text-muted">Topics</Link>
        <span>/</span>
        <span className="text-text-primary">{topic?.name || "..."}</span>
      </div>

      {topic && (
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">{topic.name}</h1>
            <button
              onClick={() => { setEditName(topic.name); setEditDescription(topic.description || ""); setEditing(true); }}
              className="px-2 py-1 text-xs bg-surface border border-border rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              ✏️ Edit
            </button>
          </div>
          {topic.description && (
            <p className="text-sm text-text-secondary mt-1">{topic.description}</p>
          )}
          <p className="text-xs text-text-muted mt-1">{total} notes</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : notFound ? (
        <EmptyState
          icon="🔍"
          title="Topic not found"
          description="This topic may have been deleted or doesn't exist."
          action={
            <Link href="/topics" className="px-4 py-2 text-sm bg-accent text-bg-page rounded-md font-semibold hover:bg-accent-hover transition-colors no-underline">
              Back to Topics
            </Link>
          }
        />
      ) : notes.length === 0 ? (
        <EmptyState icon="📝" title="No notes in this topic yet" />
      ) : (
        <>
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
          <Pagination page={page} total={total} perPage={20} onPageChange={setPage} />
        </>
      )}

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Topic">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-bg-page border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full bg-bg-page border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors resize-y"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm rounded-md bg-surface border border-border text-text-secondary hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTopic}
              disabled={saving || !editName.trim()}
              className="px-4 py-2 text-sm rounded-md bg-accent text-bg-page font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
