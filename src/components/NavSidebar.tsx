"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Topics", href: "/topics", icon: "📂" },
  { label: "Search", href: "/search", icon: "🔍" },
  { label: "Graph", href: "/graph", icon: "🕸️" },
  { label: "Entities", href: "/entities", icon: "🏷️" },
  { label: "Facets", href: "/facets", icon: "📋" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar transition-all duration-150 ${
        collapsed ? "w-[60px]" : "w-[260px]"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-border">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#d4a574" strokeWidth="2" />
              <path d="M14 6 L14 22 M10 10 L14 6 L18 10 M8 16 L14 22 L20 16" stroke="#d4a574" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-lg font-semibold text-text-primary">Grain</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-muted hover:text-text-primary transition-colors p-1"
          aria-label="Toggle sidebar"
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm no-underline transition-all duration-150 mb-0.5 ${
                active
                  ? "bg-surface text-accent border-l-2 border-accent pl-[10px]"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        {user && !collapsed && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-bg-page text-sm font-semibold shrink-0">
              {user.display_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-text-primary truncate">{user.display_name}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-text-muted hover:text-danger transition-colors px-1 py-1"
        >
          {collapsed ? "🚪" : "Logout"}
        </button>
      </div>
    </aside>
  );
}
