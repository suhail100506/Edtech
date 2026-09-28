import React from "react";
import { Sparkles, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCalloutProps {
  title?: string;
  badgeText?: string;
  description: string;
  subtext?: string;
  icon?: LucideIcon;
  variant?: "primary" | "warning" | "info";
  className?: string;
}

export function InsightCallout({
  title = "Key Predictive Insight",
  badgeText = "38.05% Feature Weight",
  description,
  subtext,
  icon: Icon = Sparkles,
  variant = "primary",
  className,
}: InsightCalloutProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-shadow",
        variant === "primary" &&
          "bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border-blue-200 text-slate-800",
        variant === "warning" &&
          "bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white border-amber-200 text-slate-800",
        variant === "info" &&
          "bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-white border-sky-200 text-slate-800",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            variant === "primary" && "bg-primary text-white shadow-sm",
            variant === "warning" && "bg-warning text-white shadow-sm",
            variant === "info" && "bg-info text-white shadow-sm"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-text">{title}</h4>
            {badgeText && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted leading-relaxed">{description}</p>
          {subtext && (
            <p className="text-xs text-text-muted/80 pt-1 italic">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}
