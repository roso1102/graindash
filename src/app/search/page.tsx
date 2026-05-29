"use client";

import { useEffect, useState } from "react";
import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { searchNotes, listTopics } from "@/lib/api";
import type { SearchResult, Topic } from "@/types";
import NoteCard from "@/components/NoteCard";
import SearchBar from "@/components/SearchBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<Set<string>>(new Set());
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    listTopics()
      .then(setTopics)
      .catch(console.error);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setPage(1);
    setFiltersApplied(false);
    setSelectedTopics(new Set());
    setSelectedStatuses(new Set());
    setSelectedSourceTypes(new Set());
    try {
      const res = await searchNotes(q, 50);
      setResults(res.results || []);
      setTotal(res.total || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialQuery) return;
    const timeoutId = window.setTimeout(() => {
      void doSearch(initialQuery);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [initialQuery, doSearch]);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const toggleStatus = (s: string) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) {
        next.delete(s);
      } else {
        next.add(s);
      }
      return next;
    });
  };
  const toggleSourceType = (s: string) => {
    setSelectedSourceTypes((prev) => {
      const next = new Set(prev);
      if (next.has(s)) {
        next.delete(s);
      } else {
        next.add(s);
      }
      return next;
    });
  };

  const applyFilters = () => {
    setFiltersApplied(true);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedTopics(new Set());
    setSelectedStatuses(new Set());
    setSelectedSourceTypes(new Set());
    setFiltersApplied(false);
    setPage(1);
  };

  const getStatusFromSummary = (summary: string | null): string => {
    if (!summary) return "";
    const match = summary.match(/\*\*Status:\*\*\s*(.+)/i);
    return match ? match[1].trim() : "";
  };

  const filteredResults = filtersApplied
    ? results.filter((r) => {
        if (selectedTopics.size > 0 && (!r.topic_id || !selectedTopics.has(r.topic_id))) return false;
        if (selectedStatuses.size > 0) {
          const status = getStatusFromSummary(r.summary);
          if (!status || !selectedStatuses.has(status)) return false;
        }
        if (selectedSourceTypes.size > 0) {
          const st = r.source_type || "";
          if (!selectedSourceTypes.has(st)) return false;
        }
        return true;
      })
    : results;

  const paginatedResults = filteredResults.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Search</h1>

      <div className="flex gap-6">
        <div className="w-[250px] shrink-0">
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Filters</h3>

            <div className="mb-4">
              <div className="text-xs text-text-muted mb-2">Topic</div>
              {topics.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm text-text-secondary py-1 cursor-pointer">
                  <input type="checkbox" className="accent-accent" checked={selectedTopics.has(t.id)} onChange={() => toggleTopic(t.id)} />
                  {t.name}
                </label>
              ))}
            </div>

            <div className="mb-4">
              <div className="text-xs text-text-muted mb-2">Status</div>
              {["Established", "Hypothesis", "Debate", "Speculative"].map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-text-secondary py-1 cursor-pointer">
                  <input type="checkbox" className="accent-accent" checked={selectedStatuses.has(s)} onChange={() => toggleStatus(s)} />
                  {s}
                </label>
              ))}
            </div>

            <div className="mb-4">
              <div className="text-xs text-text-muted mb-2">Source Type</div>
              {["telegram_text", "link", "manual", "pdf", "screenshot"].map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-text-secondary py-1 cursor-pointer">
                  <input type="checkbox" className="accent-accent" checked={selectedSourceTypes.has(s)} onChange={() => toggleSourceType(s)} />
                  {s.replace("_", " ")}
                </label>
              ))}
            </div>

            <button onClick={applyFilters} className="w-full px-3 py-2 text-xs bg-accent text-bg-page rounded-md font-semibold hover:bg-accent-hover transition-colors mb-2">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="w-full px-3 py-2 text-xs text-text-muted hover:text-text-primary transition-colors">
              Clear All
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <SearchBar
              key={initialQuery}
              defaultValue={initialQuery}
              onSearch={(q) => {
                setQuery(q);
                doSearch(q);
              }}
              large
            />
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : searched ? (
            results.length === 0 ? (
              <EmptyState
                icon="🔍"
                title={`No results found for "${query}"`}
                description="Try different keywords."
              />
            ) : (
              <>
                <p className="text-sm text-text-muted mb-4">
                  {filtersApplied
                    ? `Showing ${filteredResults.length} of ${results.length} notes`
                    : `Found ${total} notes for "${query}"`}
                </p>
                {filtersApplied && filteredResults.length === 0 ? (
                  <EmptyState
                    icon="🔍"
                    title="No results match your filters"
                    description="Try adjusting or clearing your filters."
                    action={
                      <button onClick={clearFilters} className="px-4 py-2 text-sm bg-accent text-bg-page rounded-md font-semibold hover:bg-accent-hover transition-colors">
                        Clear Filters
                      </button>
                    }
                  />
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedResults.map((r) => (
                        <div key={r.id} className="relative">
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                            style={{
                              background: `linear-gradient(to bottom, #3fb950, #e5534b)`,
                              opacity: 0.3 + r.score * 0.7,
                            }}
                          />
                          <div className="ml-1">
                            <NoteCard
                              note={{
                                id: r.id,
                                title: r.title,
                                summary: r.summary,
                                raw_text: null,
                                source_url: null,
                                source_type: null,
                                topic_id: r.topic_id,
                                facets: null,
                                created_at: r.created_at,
                              }}
                            />
                          </div>
                          <div className="absolute right-4 top-4 text-xs font-mono text-text-muted">
                            {r.score.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {filteredResults.length > perPage && (
                      <div className="mt-4">
                        <Pagination page={page} total={filteredResults.length} perPage={perPage} onPageChange={setPage} />
                      </div>
                    )}
                  </>
                )}
              </>
              )
          ) : (
            <EmptyState
              icon="🔍"
              title="Search your knowledge"
              description="Enter a query to search across all your notes."
            />
          )}
        </div>
      </div>
    </div>
  );
}
