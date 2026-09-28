"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Learner, RiskLevel, CompletionStatus } from "@/lib/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
import { ProgressBar } from "./ProgressBar";
import { EmptyState } from "./EmptyState";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps {
  learners: Learner[];
  onResetFilters?: () => void;
  pageSizeDefault?: number;
}

type SortField =
  | "Learner_ID"
  | "Course_ID"
  | "Login_Frequency"
  | "Video_Completion"
  | "Quiz_Attempts"
  | "Assignment_Submissions"
  | "Discussion_Activity"
  | "Completion_Status"
  | "predictedRisk";

export function DataTable({
  learners,
  onResetFilters,
  pageSizeDefault = 10,
}: DataTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("predictedRisk");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(pageSizeDefault);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const sortedLearners = useMemo(() => {
    return [...learners].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [learners, sortField, sortDirection]);

  // Pagination
  const totalItems = sortedLearners.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedLearners.slice(start, start + pageSize);
  }, [sortedLearners, safePage, pageSize]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-text-muted/60" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
    );
  };

  if (totalItems === 0) {
    return (
      <EmptyState
        title="No learners match your filters"
        description="Try adjusting your course, risk, completion status, or search query."
        actionLabel="Reset All Filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface-muted/70 sticky top-0 z-10">
              <TableRow>
                <TableHead
                  onClick={() => handleSort("Learner_ID")}
                  className="cursor-pointer select-none font-semibold text-text hover:text-primary transition-colors"
                >
                  <div className="flex items-center">
                    Learner ID {renderSortIndicator("Learner_ID")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Course_ID")}
                  className="cursor-pointer select-none font-semibold text-text hover:text-primary transition-colors"
                >
                  <div className="flex items-center">
                    Course {renderSortIndicator("Course_ID")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Login_Frequency")}
                  className="cursor-pointer select-none font-semibold text-text hover:text-primary transition-colors text-right"
                >
                  <div className="flex items-center justify-end">
                    Logins/wk {renderSortIndicator("Login_Frequency")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Video_Completion")}
                  className="cursor-pointer select-none font-semibold text-text hover:text-primary transition-colors min-w-[150px]"
                >
                  <div className="flex items-center">
                    Video % {renderSortIndicator("Video_Completion")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Quiz_Attempts")}
                  className="cursor-pointer select-none font-semibold text-text hover:text-primary transition-colors text-right"
                >
                  <div className="flex items-center justify-end">
                    Quizzes {renderSortIndicator("Quiz_Attempts")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Assignment_Submissions")}
                  className="cursor-pointer select-none font-semibold text-text hover:text-primary transition-colors text-right"
                >
                  <div className="flex items-center justify-end">
                    Assignments {renderSortIndicator("Assignment_Submissions")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Discussion_Activity")}
                  className="cursor-pointer select-none font-semibold text-text hover:text-primary transition-colors text-right"
                >
                  <div className="flex items-center justify-end">
                    Posts {renderSortIndicator("Discussion_Activity")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Completion_Status")}
                  className="cursor-pointer select-none font-semibold text-text hover:text-primary transition-colors"
                >
                  <div className="flex items-center">
                    Status {renderSortIndicator("Completion_Status")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("predictedRisk")}
                  className="cursor-pointer select-none font-semibold text-text hover:text-primary transition-colors min-w-[140px]"
                >
                  <div className="flex items-center">
                    Dropout Risk {renderSortIndicator("predictedRisk")}
                  </div>
                </TableHead>
                <TableHead className="w-12 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((learner) => {
                const riskPct = Math.round(learner.predictedRisk * 100);

                return (
                  <TableRow
                    key={learner.Learner_ID}
                    isClickable
                    onClick={() => router.push(`/learners/${learner.Learner_ID}`)}
                    className="group"
                  >
                    <TableCell className="font-mono font-semibold text-primary group-hover:underline">
                      {learner.Learner_ID}
                    </TableCell>
                    <TableCell>
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {learner.Course_ID}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {learner.Login_Frequency}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={learner.Video_Completion}
                          size="sm"
                          className="w-20"
                          variant="primary"
                        />
                        <span className="text-xs font-medium text-text tabular-nums">
                          {learner.Video_Completion}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {learner.Quiz_Attempts}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {learner.Assignment_Submissions}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {learner.Discussion_Activity}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={learner.Completion_Status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RiskBadge level={learner.riskLevel} />
                        <span className="text-xs font-semibold text-text-muted tabular-nums">
                          {riskPct}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-muted group-hover:text-primary group-hover:bg-primary-soft"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/learners/${learner.Learner_ID}`);
                        }}
                        aria-label={`View learner ${learner.Learner_ID}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted px-1">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong>{(safePage - 1) * pageSize + 1}</strong> to{" "}
            <strong>{Math.min(safePage * pageSize, totalItems)}</strong> of{" "}
            <strong>{totalItems.toLocaleString()}</strong> learners
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span>Rows per page:</span>
            <Select
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 w-18 text-xs py-1"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 font-medium text-text">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
