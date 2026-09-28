import React from "react";
import { RiskLevel } from "@/lib/types";
import { RISK_CONFIG } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  className?: string;
}

export function RiskBadge({ level, showIcon = true, className }: RiskBadgeProps) {
  const config = RISK_CONFIG[level] || RISK_CONFIG.Low;

  const Icon =
    level === "High"
      ? ShieldAlert
      : level === "Medium"
      ? AlertTriangle
      : ShieldCheck;

  return (
    <Badge
      variant="outline"
      className={cn("border font-semibold", config.badgeClass, className)}
    >
      {showIcon && <Icon className="h-3.5 w-3.5 mr-1 shrink-0" />}
      <span>{config.label}</span>
    </Badge>
  );
}
