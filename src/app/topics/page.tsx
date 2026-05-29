"use client";

import { useEffect, useState } from "react";
import { listTopics, getTopicNotes } from "@/lib/api";
import type { Topic, Note } from "@/types";
import TopicTree from "@/components/TopicTree";
import NoteCard from "@/components/NoteCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    listTopics()
      .then(setTopics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTopic) return;
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      setNotesLoading(true);
      getTopicNotes(selectedTopic, page, 20)
        .then((res) => {
          if (cancelled) return;
          setNotes(res.notes);
          setTotal(res.total);
        })
        .catch(console.error)
        .finally(() => {
          if (!cancelled) setNotesLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [selectedTopic, page]);

  const selectedTopicObj = topics.find((t) => t.id === selectedTopic);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Topics</h1>
      <div className="flex gap-6 min-h-[70vh]">
        <div className="w-[40%] bg-surface border border-border rounded-lg p-3 shrink-0">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search topics..."
            className="w-full bg-bg-page border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors mb-2"
          />
          {loading ? (
            <LoadingSpinner />
          ) : topics.length === 0 ? (
            <EmptyState
              icon="📂"
              title="No topics yet"
              description="Topics are created automatically when you capture notes."
            />
          ) : (
            <TopicTree
              topics={topics}
              selectedId={selectedTopic}
              onSelect={(id) => {
                setSelectedTopic(id);
                setPage(1);
              }}
              filter={filter}
            />
          )}
        </div>

        <div className="flex-1">
          {selectedTopic ? (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-text-primary">{selectedTopicObj?.name}</h2>
                {selectedTopicObj?.description && (
                  <p className="text-sm text-text-secondary mt-1">{selectedTopicObj.description}</p>
                )}
                <p className="text-xs text-text-muted mt-1">{total} notes</p>
              </div>
              {notesLoading ? (
                <LoadingSpinner />
              ) : notes.length === 0 ? (
                <EmptyState
                  icon="📝"
                  title="No notes in this topic yet"
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                  <Pagination
                    page={page}
                    total={total}
                    perPage={20}
                    onPageChange={setPage}
                  />
                </>
              )}
            </div>
          ) : (
            <EmptyState
              icon="📂"
              title="Select a topic"
              description="Choose a topic from the left panel to view its notes."
            />
          )}
        </div>
      </div>
    </div>
  );
}
