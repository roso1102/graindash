"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  defaultValue?: string;
  onSearch?: (query: string) => void;
  large?: boolean;
}

export default function SearchBar({ defaultValue = "", onSearch, large }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (onSearch) {
      onSearch(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`flex items-center gap-2 bg-surface border rounded-full px-4 py-2 transition-all duration-150 ${
          focused ? "border-accent" : "border-border"
        } ${large ? "px-5 py-3" : ""}`}
      >
        <svg
          className="text-text-muted shrink-0"
          width={large ? 20 : 16}
          height={large ? 20 : 16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search notes..."
          className={`flex-1 bg-transparent outline-none text-text-primary placeholder-text-muted ${
            large ? "text-lg" : "text-sm"
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
