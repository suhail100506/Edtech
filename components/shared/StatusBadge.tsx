import React from "react";
import { CompletionStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: CompletionStatus;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const isCompleted = status === "Completed";

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold border",
        isCompleted
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-rose-50 text-rose-700 border-rose-200",
        className
      )}
    >
      {showIcon && (
        isCompleted ? (
          <CheckCircle2 className="h-3.5 w-3.5 mr-1 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="h-3.5 w-3.5 mr-1 shrink-0 text-rose-600" />
        )
      )}
      <span>{status}</span>
    </Badge>
  );
}
