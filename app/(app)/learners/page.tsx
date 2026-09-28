"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDataset } from "@/lib/context/DatasetContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Search, RotateCcw, Filter, Download } from "lucide-react";

function LearnersContent() {
  const searchParams = useSearchParams();
  const { learners, courses, isLoading } = useDataset();

  // URL query params initialization
  const initialRisk = searchParams.get("risk") || "all";
  const initialCourse = searchParams.get("course") || "all";
  const initialStatus = searchParams.get("status") || "all";

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRisk, setSelectedRisk] = useState<string>(initialRisk);
  const [selectedCourse, setSelectedCourse] = useState<string>(initialCourse);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);

  useEffect(() => {
    if (searchParams.get("risk")) {
      setSelectedRisk(searchParams.get("risk") || "all");
    }
    if (searchParams.get("course")) {
      setSelectedCourse(searchParams.get("course") || "all");
    }
    if (searchParams.get("status")) {
      setSelectedStatus(searchParams.get("status") || "all");
    }
  }, [searchParams]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRisk("all");
    setSelectedCourse("all");
    setSelectedStatus("all");
  };

  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedRisk !== "all" ||
    selectedCourse !== "all" ||
    selectedStatus !== "all";

  // Filtered dataset
  const filteredLearners = useMemo(() => {
    return learners.filter((learner) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = learner.Learner_ID.toLowerCase().includes(q);
        const matchesCourse = learner.Course_ID.toLowerCase().includes(q);
        if (!matchesId && !matchesCourse) return false;
      }

      // Risk
      if (selectedRisk !== "all" && learner.riskLevel !== selectedRisk) {
        return false;
      }

      // Course
      if (selectedCourse !== "all" && learner.Course_ID !== selectedCourse) {
        return false;
      }

      // Status
      if (selectedStatus !== "all" && learner.Completion_Status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [learners, searchQuery, selectedRisk, selectedCourse, selectedStatus]);

  // Export filtered CSV
  const handleExportCsv = () => {
    const headers = [
      "Learner_ID",
      "Course_ID",
      "Login_Frequency",
      "Video_Completion",
      "Quiz_Attempts",
      "Assignment_Submissions",
      "Discussion_Activity",
      "Completion_Status",
      "Dropout_Risk",
      "Risk_Level",
    ];

    const rows = filteredLearners.map((l) => [
      l.Learner_ID,
      l.Course_ID,
      l.Login_Frequency,
      l.Video_Completion,
      l.Quiz_Attempts,
      l.Assignment_Submissions,
      l.Discussion_Activity,
      l.Completion_Status,
      Math.round(l.predictedRisk * 100),
      l.riskLevel,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `learners_filtered_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <TableSkeleton rows={10} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Student Roster & Risk Explorer"
        description="Filter, search, and drill into individual student activity footprints to inspect dropout probabilities and prescribe targeted pedagogical support."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredLearners.length === 0}
            className="text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Filtered CSV
          </Button>
        }
      />

      {/* Filter & Search Toolbar */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search by Learner ID or Course ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-sm"
            />
          </div>

          {/* Course Filter */}
          <div className="lg:col-span-3">
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="h-10 text-sm"
            >
              <option value="all">All Courses (10)</option>
              {courses.map((c) => (
                <option key={c.Course_ID} value={c.Course_ID}>
                  {c.Course_ID} - {c.courseName}
                </option>
              ))}
            </Select>
          </div>

          {/* Risk Level Filter */}
          <div className="lg:col-span-2">
            <Select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="h-10 text-sm"
            >
              <option value="all">All Risk Levels</option>
              <option value="High">High Risk (&gt;66%)</option>
              <option value="Medium">Medium Risk (33-66%)</option>
              <option value="Low">Low Risk (&lt;33%)</option>
            </Select>
          </div>

          {/* Completion Status Filter */}
          <div className="lg:col-span-2">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Not Completed">Not Completed</option>
            </Select>
          </div>

          {/* Reset Action */}
          <div className="lg:col-span-1 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              disabled={!isFiltered}
              className="h-10 px-3 text-xs text-text-muted hover:text-text w-full lg:w-auto"
              title="Reset all filters"
            >
              <RotateCcw className="h-4 w-4 lg:mr-0 mr-1.5" />
              <span className="lg:hidden">Reset</span>
            </Button>
          </div>
        </div>

        {/* Filter Badges & Count */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span>
              Matching: <strong>{filteredLearners.length.toLocaleString()}</strong> of{" "}
              {learners.length.toLocaleString()} total students
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="text-primary hover:underline font-medium text-xs"
            >
              Clear all active filters
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Table */}
      <DataTable
        learners={filteredLearners}
        onResetFilters={handleResetFilters}
        pageSizeDefault={10}
      />
    </div>
  );
}

export default function LearnersPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={10} />}>
      <LearnersContent />
    </Suspense>
  );
}
