"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDataset } from "@/lib/context/DatasetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  UploadCloud,
  ChevronRight,
  Database,
  User,
  GraduationCap,
} from "lucide-react";
import { NAV_ITEMS } from "./Sidebar";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const { isUsingMockData, setIsUploadModalOpen } = useDataset();

  // Find active navigation item title
  const activeNavItem = NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  const pageTitle = activeNavItem ? activeNavItem.name : "Analytics";

  // Build breadcrumb segments
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 sm:px-6 shadow-xs backdrop-blur-xs">
      {/* Left: Mobile hamburger + Breadcrumbs / Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-muted hover:text-text lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          {/* Breadcrumb row */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Link
              href="/dashboard"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span>EduInsight AI</span>
            </Link>
            {pathSegments.map((segment, index) => {
              const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
              const isLast = index === pathSegments.length - 1;
              const formattedName =
                segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");

              return (
                <React.Fragment key={href}>
                  <ChevronRight className="h-3 w-3 text-text-muted/60" />
                  {isLast ? (
                    <span className="font-medium text-text">{formattedName}</span>
                  ) : (
                    <Link href={href} className="hover:text-primary transition-colors">
                      {formattedName}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <h2 className="text-base sm:text-lg font-bold tracking-tight text-text leading-tight mt-0.5">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Right: Actions, Demo indicator, Upload button, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Data indicator */}
        {isUsingMockData && (
          <div
            title="FastAPI backend is currently offline. Operating on benchmark mock dataset."
            className="hidden sm:inline-flex"
          >
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-800 border-amber-200 text-[11px] font-medium py-1 px-2.5 flex items-center gap-1.5"
            >
              <Database className="h-3 w-3 text-amber-600" />
              <span>Demo data (FastAPI offline)</span>
            </Badge>
          </div>
        )}

        {/* Upload CSV button */}
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          size="sm"
          className="bg-primary hover:bg-primary-hover text-white shadow-xs font-medium text-xs sm:text-sm px-3 sm:px-4"
        >
          <UploadCloud className="h-4 w-4 mr-1.5 shrink-0" />
          <span>Upload CSV</span>
        </Button>

        {/* User Avatar Placeholder */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-muted text-text-muted transition-colors hover:text-text cursor-pointer">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
