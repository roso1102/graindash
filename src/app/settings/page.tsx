"use client";

import { useAuthStore } from "@/stores/auth";
import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-bg-page text-lg font-semibold">
              {user?.display_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">{user?.display_name || "Unknown"}</div>
              <div className="text-xs text-text-muted">Telegram User</div>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 text-sm rounded-md bg-surface border border-border text-text-secondary hover:bg-surface-hover transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">About</h2>
        <div className="space-y-2 text-sm text-text-secondary">
          <div>Grain PKOS — Personal Knowledge Operating System</div>
          <div className="text-xs text-text-muted">Version 1.0.0</div>
        </div>
      </div>
    </div>
  );
}
