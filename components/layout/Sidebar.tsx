"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  ShieldAlert,
  Activity,
  BookOpen,
  BrainCircuit,
  Lightbulb,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";

export const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Learners",
    href: "/learners",
    icon: Users,
  },
  {
    name: "Risk Analysis",
    href: "/risk-analysis",
    icon: ShieldAlert,
  },
  {
    name: "Behavior Analytics",
    href: "/behavior",
    icon: Activity,
  },
  {
    name: "Course Analytics",
    href: "/courses",
    icon: BookOpen,
  },
  {
    name: "ML Model",
    href: "/model",
    icon: BrainCircuit,
  },
  {
    name: "Interventions",
    href: "/interventions",
    icon: Lightbulb,
  },
  {
    name: "About",
    href: "/about",
    icon: Info,
  },
];

interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export function Sidebar({ className, onItemClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border bg-surface select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex flex-col px-6 py-5 border-b border-border">
        <Link
          href="/dashboard"
          onClick={onItemClick}
          className="flex items-center gap-3 group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-text leading-tight">
              {APP_CONFIG.name}
            </h1>
            <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
              Intelligence Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary-soft text-primary font-semibold shadow-xs"
                    : "text-text-muted hover:bg-surface-muted hover:text-text"
                )}
              >
                {/* Active left accent bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-text-muted"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="border-t border-border p-4 bg-surface-muted/30">
        <div className="rounded-xl border border-border bg-surface p-3 text-xs">
          <p className="font-semibold text-text">Random Forest Engine</p>
          <div className="flex items-center justify-between text-text-muted mt-1">
            <span>Accuracy:</span>
            <span className="font-bold text-emerald-600">72.85%</span>
          </div>
          <div className="flex items-center justify-between text-text-muted">
            <span>Recall:</span>
            <span className="font-bold text-primary">82.89%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
