"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface ToggleChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/** A selectable pill used for multi-select fields (goals, pages). */
export function ToggleChip({
  label,
  selected,
  onToggle,
  disabled,
}: ToggleChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        selected
          ? "border-primary bg-primary/15 text-primary"
          : "border-input bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
      )}
    >
      {selected ? <Check className="h-3.5 w-3.5" /> : null}
      {label}
    </button>
  );
}
