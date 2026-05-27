"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listEntities } from "@/lib/api";
import type { Entity } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

const TABS = ["All", "Concepts", "Technologies", "Projects", "People"];
const TYPE_MAP: Record<string, string> = {
  Concepts: "concept",
  Technologies: "technology",
  Projects: "project",
  People: "person",
};

const TYPE_COLORS: Record<string, string> = {
  concept: "bg-accent/15 text-accent",
  technology: "bg-info/15 text-info",
  project: "bg-success/15 text-success",
  person: "bg-warning/15 text-warning",
};

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    listEntities()
      .then(setEntities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = entities.filter((e) => {
    const matchesTab = activeTab === "All" || e.type === TYPE_MAP[activeTab];
    const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Entities</h1>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === tab
                ? "bg-accent text-bg-page font-semibold"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search entities..."
        className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors mb-6"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No entities found"
          description="Entities are automatically extracted from your notes when captured."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entity) => (
            <Link
              key={entity.id}
              href={`/entities/${entity.id}`}
              className="block no-underline group"
            >
              <div className="bg-surface border border-border rounded-lg p-4 transition-all duration-150 hover:border-accent hover:bg-surface-hover hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors">
                    {entity.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[entity.type] || "bg-surface text-text-secondary"}`}>
                    {entity.type}
                  </span>
                </div>
                <p className="text-xs text-text-muted">Linked to {entity.note_count} notes</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
