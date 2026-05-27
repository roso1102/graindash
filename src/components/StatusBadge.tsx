"use client";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  Established: { label: "Established", className: "bg-success/15 text-success" },
  Hypothesis: { label: "Hypothesis", className: "bg-warning/15 text-warning" },
  Debate: { label: "Debate", className: "bg-danger/15 text-danger" },
  Speculative: { label: "Speculative", className: "bg-[#8b5cf6]/15 text-[#8b5cf6]" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, className: "bg-surface text-text-secondary" };

  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
