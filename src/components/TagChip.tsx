"use client";

interface TagChipProps {
  label: string;
  variant?: "accent" | "info" | "danger" | "success" | "warning" | "default";
  onClick?: () => void;
}

const VARIANT_CLASSES: Record<string, string> = {
  accent: "bg-accent/15 text-accent",
  info: "bg-info/15 text-info",
  danger: "bg-danger/15 text-danger",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  default: "bg-surface text-text-secondary",
};

export default function TagChip({ label, variant = "default", onClick }: TagChipProps) {
  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full transition-colors ${VARIANT_CLASSES[variant]} ${
        onClick ? "hover:opacity-80 cursor-pointer" : ""
      }`}
    >
      {label}
    </Component>
  );
}
