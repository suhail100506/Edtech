import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  caption?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    neutral?: boolean;
    label?: string;
  };
  className?: string;
}

export function KpiCard({
  title,
  value,
  caption,
  icon: Icon,
  iconBgColor = "bg-primary-soft",
  iconColor = "text-primary",
  trend,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-border bg-surface", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {title}
            </p>
            <div className="text-2xl lg:text-3xl font-bold tracking-tight text-text">
              {value}
            </div>
          </div>
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform",
              iconBgColor
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>

        {(caption || trend) && (
          <div className="mt-4 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center font-semibold px-1.5 py-0.5 rounded-md",
                  trend.neutral
                    ? "bg-slate-100 text-slate-700"
                    : trend.isPositive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                )}
              >
                {trend.value}
              </span>
            )}
            {caption && <span className="text-text-muted">{caption}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
