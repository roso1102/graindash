"use client";

import { useEffect, useState } from "react";
import { getFacets, listNotes } from "@/lib/api";
import type { Facets, Note } from "@/types";
import NoteCard from "@/components/NoteCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function FacetsPage() {
  const [facets, setFacets] = useState<Facets>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    getFacets()
      .then(setFacets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedKey || !selectedValue) {
      setNotes([]);
      setTotal(0);
      return;
    }
    setNotesLoading(true);
    listNotes({ facet_key: selectedKey, facet_value: selectedValue, per_page: 20 })
      .then((res) => {
        setNotes(res.notes);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setNotesLoading(false));
  }, [selectedKey, selectedValue]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Facets</h1>
      <div className="flex gap-6 min-h-[70vh]">
        <div className="w-[40%] bg-surface border border-border rounded-lg p-4 shrink-0">
          {loading ? (
            <LoadingSpinner />
          ) : Object.keys(facets).length === 0 ? (
            <EmptyState icon="📋" title="No facets yet" description="Facets are extracted automatically from your notes." />
          ) : (
            <div className="space-y-1">
              {Object.entries(facets).map(([key, values]) => (
                <div key={key}>
                  <button
                    onClick={() => {
                      setSelectedKey(selectedKey === key ? null : key);
                      setSelectedValue(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                      selectedKey === key
                        ? "bg-accent/15 text-accent"
                        : "text-text-secondary hover:bg-surface-hover"
                    }`}
                  >
                    <span className="capitalize">{key}</span>
                    <span className="text-xs text-text-muted">{values.length}</span>
                  </button>
                  {selectedKey === key && (
                    <div className="ml-3 mt-1 space-y-0.5">
                      {values.map((val) => (
                        <button
                          key={val}
                          onClick={() => setSelectedValue(val)}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
                            selectedValue === val
                              ? "bg-info/15 text-info"
                              : "text-text-muted hover:bg-surface-hover hover:text-text-secondary"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          {selectedKey && selectedValue ? (
            notesLoading ? (
              <LoadingSpinner />
            ) : notes.length === 0 ? (
              <EmptyState icon="📝" title="No notes with this facet" />
            ) : (
              <>
                <h2 className="text-lg font-semibold text-text-primary mb-3">
                  {selectedKey}: {selectedValue} ({total})
                </h2>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </>
            )
          ) : (
            <EmptyState
              icon="📋"
              title="Select a facet"
              description="Choose a facet key and value from the left panel to view matching notes."
            />
          )}
        </div>
      </div>
    </div>
  );
}
