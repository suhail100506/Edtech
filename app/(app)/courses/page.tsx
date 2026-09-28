"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDataset } from "@/lib/context/DatasetContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CompletionByCourseChart } from "@/components/charts/CompletionByCourseChart";
import {
  BookOpen,
  Users,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

function CoursesContent() {
  const searchParams = useSearchParams();
  const { courses, dashboard } = useDataset();

  const initialSelect = searchParams.get("select") || (courses[0]?.Course_ID ?? "C01");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialSelect);

  useEffect(() => {
    const fromQuery = searchParams.get("select");
    if (fromQuery) {
      setSelectedCourseId(fromQuery);
    }
  }, [searchParams]);

  // Selected course details
  const activeCourse = useMemo(() => {
    return courses.find((c) => c.Course_ID === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  // Overall cohort averages
  const overallAvgCompletion = dashboard.overallAvgCompletionRate;
  const overallAvgLogin = 5.0;
  const overallAvgVideo = dashboard.avgVideoCompletion;
  const overallAvgQuiz = 3.0;
  const overallAvgAssignments = 2.4;
  const overallAvgDiscussion = 2.3;

  // Sorting state for table
  const [sortField, setSortField] = useState<string>("completionRate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      const aVal = (a as unknown as Record<string, number>)[sortField] ?? 0;
      const bVal = (b as unknown as Record<string, number>)[sortField] ?? 0;
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [courses, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Courses to investigate: courses with completion rate < 50%
  const coursesToInvestigate = useMemo(() => {
    return [...courses]
      .filter((c) => c.completionRate < 50)
      .sort((a, b) => a.completionRate - b.completionRate);
  }, [courses]);

  const diffRate = activeCourse
    ? (activeCourse.completionRate - overallAvgCompletion).toFixed(1)
    : "0";
  const isAboveRate = Number(diffRate) >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Curricular & Course Completion Diagnostics"
        description="Comparative subject-level completion performance, enrollment distribution, and early detection of curriculum friction points."
      />

      {/* Top Completion Bar Chart */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Completion Rate by Course ID
              </CardTitle>
              <CardDescription>
                Dotted line indicates cohort benchmark average ({overallAvgCompletion}%). Red bars signify courses under 45% completion.
              </CardDescription>
            </div>
            <span className="text-xs text-text-muted italic">Click any bar to inspect course</span>
          </div>
        </CardHeader>
        <CardContent>
          <CompletionByCourseChart
            data={courses.map((c) => ({
              Course_ID: c.Course_ID,
              courseName: c.courseName,
              completionRate: c.completionRate,
              learnerCount: c.totalLearners,
            }))}
            overallAvg={overallAvgCompletion}
            height={260}
            onSelectCourse={(cid) => setSelectedCourseId(cid)}
          />
        </CardContent>
      </Card>

      {/* Course Inspector Drilldown */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Course Telemetry Inspector
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-text">
                {activeCourse?.Course_ID}: {activeCourse?.courseName}
              </h2>
            </div>
          </div>

          <div className="w-full sm:w-72">
            <Select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="h-10 text-sm"
            >
              {courses.map((c) => (
                <option key={c.Course_ID} value={c.Course_ID}>
                  {c.Course_ID} - {c.courseName}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Course Detailed Metrics */}
        {activeCourse && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Completion Rate */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-muted/40">
              <span className="text-xs text-text-muted">Completion Rate</span>
              <p className="text-2xl font-extrabold text-text mt-1">
                {activeCourse.completionRate}%
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                {isAboveRate ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                )}
                <span className={isAboveRate ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                  {isAboveRate ? `+${diffRate}%` : `${diffRate}%`}
                </span>
                <span className="text-text-muted text-[10px]">vs avg</span>
              </div>
            </div>

            {/* Total Learners */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-muted/40">
              <span className="text-xs text-text-muted">Enrolled Students</span>
              <p className="text-2xl font-extrabold text-text mt-1">
                {activeCourse.totalLearners}
              </p>
              <span className="text-xs text-text-muted mt-1 block">
                {activeCourse.completedCount} completed
              </span>
            </div>

            {/* Video Watch */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-muted/40">
              <span className="text-xs text-text-muted">Avg Video Watch</span>
              <p className="text-2xl font-extrabold text-text mt-1">
                {activeCourse.avgVideoCompletion}%
              </p>
              <span className="text-[11px] text-text-muted block mt-1">
                Overall: {overallAvgVideo}%
              </span>
            </div>

            {/* Weekly Logins */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-muted/40">
              <span className="text-xs text-text-muted">Avg Logins / Wk</span>
              <p className="text-2xl font-extrabold text-text mt-1">
                {activeCourse.avgLoginFrequency}
              </p>
              <span className="text-[11px] text-text-muted block mt-1">
                Overall: {overallAvgLogin}
              </span>
            </div>

            {/* Quiz Attempts */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-muted/40">
              <span className="text-xs text-text-muted">Avg Quizzes</span>
              <p className="text-2xl font-extrabold text-text mt-1">
                {activeCourse.avgQuizAttempts}
              </p>
              <span className="text-[11px] text-text-muted block mt-1">
                Overall: {overallAvgQuiz}
              </span>
            </div>

            {/* High-Risk Learners */}
            <div className="p-3.5 rounded-xl border border-border bg-rose-50/50">
              <span className="text-xs font-semibold text-rose-700">High Risk Pool</span>
              <p className="text-2xl font-extrabold text-rose-700 mt-1">
                {activeCourse.highRiskCount}
              </p>
              <Link
                href={`/learners?course=${activeCourse.Course_ID}&risk=High`}
                className="text-[11px] font-semibold text-rose-600 hover:underline inline-flex items-center mt-1"
              >
                Inspect roster <ArrowRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* "Courses to Investigate" Callout */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">
                Instructional Design Advisory: Courses Requiring Investigation
              </h3>
              <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                {coursesToInvestigate.length} low-retention offerings
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Courses displaying completion rates below 50% ({coursesToInvestigate.map((c) => `${c.Course_ID} (${c.completionRate}%)`).join(", ")})
              exhibit statistically lower video watch times and suppressed assignment throughput.
              We recommend reviewing <strong>assessment grading difficulty, prerequisite alignment,
              and lecture density</strong>. Note: These findings derive strictly from behavioral
              aggregate logs and do not imply structural course curriculum deficiencies beyond what
              the data supports.
            </p>
          </div>
        </div>
      </div>

      {/* Sortable Course Comparison Table */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-text">Course Comparison Matrix</h3>
          <p className="text-xs text-text-muted">
            Click column headers to sort and benchmark engagement across courses
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted/70 border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th
                    onClick={() => handleSort("Course_ID")}
                    className="p-3.5 font-semibold cursor-pointer hover:text-primary"
                  >
                    Course ID
                  </th>
                  <th className="p-3.5 font-semibold">Course Name</th>
                  <th
                    onClick={() => handleSort("totalLearners")}
                    className="p-3.5 font-semibold text-right cursor-pointer hover:text-primary"
                  >
                    Students
                  </th>
                  <th
                    onClick={() => handleSort("completionRate")}
                    className="p-3.5 font-semibold text-right cursor-pointer hover:text-primary"
                  >
                    Completion Rate
                  </th>
                  <th
                    onClick={() => handleSort("avgVideoCompletion")}
                    className="p-3.5 font-semibold text-right cursor-pointer hover:text-primary"
                  >
                    Avg Video %
                  </th>
                  <th
                    onClick={() => handleSort("avgLoginFrequency")}
                    className="p-3.5 font-semibold text-right cursor-pointer hover:text-primary"
                  >
                    Logins/wk
                  </th>
                  <th
                    onClick={() => handleSort("highRiskCount")}
                    className="p-3.5 font-semibold text-right cursor-pointer hover:text-primary"
                  >
                    High Risk
                  </th>
                  <th className="p-3.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedCourses.map((c) => {
                  const isInvestigate = c.completionRate < 50;

                  return (
                    <tr
                      key={c.Course_ID}
                      onClick={() => setSelectedCourseId(c.Course_ID)}
                      className={cn(
                        "hover:bg-blue-50/40 cursor-pointer transition-colors",
                        selectedCourseId === c.Course_ID && "bg-blue-50/60 font-medium"
                      )}
                    >
                      <td className="p-3.5 font-mono font-bold text-primary">
                        {c.Course_ID}
                      </td>
                      <td className="p-3.5 text-text font-medium">{c.courseName}</td>
                      <td className="p-3.5 text-right font-medium">{c.totalLearners}</td>
                      <td className="p-3.5 text-right">
                        <span
                          className={cn(
                            "inline-block font-bold",
                            isInvestigate ? "text-rose-600" : "text-emerald-600"
                          )}
                        >
                          {c.completionRate}%
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-medium">{c.avgVideoCompletion}%</td>
                      <td className="p-3.5 text-right font-medium">{c.avgLoginFrequency}</td>
                      <td className="p-3.5 text-right">
                        <span className="font-semibold text-rose-600">{c.highRiskCount}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <Link
                          href={`/learners?course=${c.Course_ID}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm" className="text-xs text-primary">
                            Students <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="h-40 bg-slate-100 rounded-xl animate-pulse" />}>
      <CoursesContent />
    </Suspense>
  );
}
