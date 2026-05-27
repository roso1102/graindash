"use client";

import { useState } from "react";
import type { Topic } from "@/types";

interface TopicTreeProps {
  topics: Topic[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  filter: string;
}

interface TreeNodeProps {
  topic: Topic;
  allTopics: Topic[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  level: number;
}

function TreeNode({ topic, allTopics, selectedId, onSelect, level }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const children = allTopics.filter((t) => t.parent_id === topic.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === topic.id;

  return (
    <div>
      <button
        onClick={() => onSelect(topic.id)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all duration-150 text-left ${
          isSelected
            ? "bg-surface text-accent border-l-2 border-accent"
            : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            {expanded ? "▼" : "▶"}
          </button>
        ) : (
          <span className="w-3" />
        )}
        <span className="truncate">{topic.name}</span>
        <span className="ml-auto text-xs text-text-muted bg-surface px-1.5 py-0.5 rounded">
          {topic.note_count}
        </span>
      </button>
      {expanded && hasChildren && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              topic={child}
              allTopics={allTopics}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopicTree({ topics, selectedId, onSelect, filter }: TopicTreeProps) {
  const rootTopics = topics.filter((t) => !t.parent_id);
  const filtered = filter
    ? topics.filter((t) => t.name.toLowerCase().includes(filter.toLowerCase()))
    : rootTopics;

  const visibleTopics = filter
    ? (() => {
        const ids = new Set(filtered.map((t) => t.id));
        topics.forEach((t) => {
          if (ids.has(t.id)) {
            let p = t.parent_id;
            while (p) {
              ids.add(p);
              p = topics.find((tt) => tt.id === p)?.parent_id || null;
            }
          }
        });
        return rootTopics.filter((t) => ids.has(t.id));
      })()
    : rootTopics;

  return (
    <div className="py-2">
      <button
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all duration-150 text-left mb-1 ${
          selectedId === null
            ? "bg-surface text-accent border-l-2 border-accent"
            : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        }`}
      >
        <span className="truncate">All Topics</span>
      </button>
      {visibleTopics.map((topic) => (
        <TreeNode
          key={topic.id}
          topic={topic}
          allTopics={topics}
          selectedId={selectedId}
          onSelect={onSelect}
          level={0}
        />
      ))}
    </div>
  );
}
