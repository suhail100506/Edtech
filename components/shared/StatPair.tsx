import React from "react";
import { cn } from "@/lib/utils";

interface StatPairProps {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  indicator?: "up" | "down" | "neutral";
  indicatorText?: string;
  className?: string;
}

export function StatPair({
  label,
  value,
  subtitle,
  indicator,
  indicatorText,
  className,
}: StatPairProps) {
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold tracking-tight text-text">{value}</span>
        {indicatorText && (
          <span
            className={cn(
              "text-xs font-semibold px-1.5 py-0.5 rounded",
              indicator === "up" && "bg-emerald-50 text-emerald-700",
              indicator === "down" && "bg-rose-50 text-rose-700",
              indicator === "neutral" && "bg-slate-100 text-slate-700"
            )}
          >
            {indicatorText}
          </span>
        )}
      </div>
      {subtitle && <span className="text-xs text-text-muted/80">{subtitle}</span>}
    </div>
  );
}
