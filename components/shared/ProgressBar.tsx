import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  showLabel?: boolean;
  color?: string; // Tailwind color class e.g. "bg-primary"
  variant?: "primary" | "success" | "warning" | "danger" | "risk";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  color,
  variant = "primary",
  size = "md",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  let barColor = color;
  if (!barColor) {
    if (variant === "risk") {
      barColor =
        percentage > 66
          ? "bg-rose-500"
          : percentage >= 33
          ? "bg-amber-500"
          : "bg-emerald-500";
    } else if (variant === "success") {
      barColor = "bg-emerald-500";
    } else if (variant === "warning") {
      barColor = "bg-amber-500";
    } else if (variant === "danger") {
      barColor = "bg-rose-500";
    } else {
      barColor = "bg-primary";
    }
  }

  const heightClass =
    size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className={cn("w-full flex items-center gap-2", className)}>
      <div className={cn("relative w-full overflow-hidden rounded-full bg-slate-100", heightClass)}>
        <div
          className={cn("h-full transition-all duration-300 rounded-full", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-text-muted tabular-nums shrink-0">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
