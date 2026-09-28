"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDataset } from "@/lib/context/DatasetContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { ChartCard } from "@/components/shared/ChartCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { CompletionByCourseChart } from "@/components/charts/CompletionByCourseChart";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Button } from "@/components/ui/button";
import { KpiSkeletonRow } from "@/components/shared/LoadingSkeleton";
import {
  Users,
  CheckCircle2,
  ShieldAlert,
  Video,
  BrainCircuit,
  ArrowRight,
  Eye,
  UploadCloud,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { dashboard, isLoading, setIsUploadModalOpen } = useDataset();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-60 bg-slate-200 rounded-lg animate-pulse" />
        <KpiSkeletonRow />
      </div>
    );
  }

  const {
    totalLearners,
    completionRate,
    highRiskCount,
    highRiskPercent,
    avgVideoCompletion,
    modelAccuracy,
    completionDistribution,
    behaviorComparison,
    courseCompletion,
    overallAvgCompletionRate,
    topRiskLearners,
  } = dashboard;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Quick Action */}
      <PageHeader
        title="Executive Learning Analytics"
        description="Comprehensive diagnostic overview of student completion velocity, engagement differentials, and early dropout warnings."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs"
            >
              <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
              Upload New CSV
            </Button>
            <Link href="/risk-analysis">
              <Button size="sm" className="bg-primary hover:bg-primary-hover text-white text-xs">
                <span>View Risk Pipeline</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Row of 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Learners"
          value={totalLearners.toLocaleString()}
          caption="Active enrolled cohort"
          icon={Users}
          iconBgColor="bg-blue-100/70"
          iconColor="text-primary"
          trend={{ value: "10 Courses", neutral: true }}
        />
        <KpiCard
          title="Completion Rate"
          value={`${completionRate}%`}
          caption="Verified completed learners"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-100/70"
          iconColor="text-secondary"
          trend={{
            value: completionRate > 50 ? "Healthy" : "Attention",
            isPositive: completionRate > 50,
          }}
        />
        <KpiCard
          title="High-Risk Learners"
          value={highRiskCount}
          caption={`${highRiskPercent}% of total student population`}
          icon={ShieldAlert}
          iconBgColor="bg-rose-100/70"
          iconColor="text-danger"
          trend={{ value: `${highRiskPercent}%`, isPositive: false }}
        />
        <KpiCard
          title="Avg Video Watch"
          value={`${avgVideoCompletion}%`}
          caption="Benchmark: 82.1% (Completers)"
          icon={Video}
          iconBgColor="bg-sky-100/70"
          iconColor="text-info"
          trend={{ value: "Key Signal", neutral: true }}
        />
        <KpiCard
          title="Random Forest Acc."
          value={`${modelAccuracy}%`}
          caption="82.89% Recall | 79.7% F1"
          icon={BrainCircuit}
          iconBgColor="bg-indigo-100/70"
          iconColor="text-indigo-600"
          trend={{ value: "ROC-AUC 78.0%", neutral: true }}
        />
      </div>

      {/* Middle Row: Donut + Grouped Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Completion Donut */}
        <div className="lg:col-span-4">
          <ChartCard
            title="Completion Distribution"
            description="Overall proportion of completed vs discontinued enrollments"
          >
            <DonutChart
              data={completionDistribution}
              centerValue={`${completionRate}%`}
              centerLabel="Completion Rate"
              height={270}
            />
          </ChartCard>
        </div>

        {/* Grouped Bar: Engagement Comparison */}
        <div className="lg:col-span-8">
          <ChartCard
            title="Behavioral Engagement Differentials"
            description="Comparison of mean activity metrics between Completers vs Non-Completers"
            action={
              <Link href="/behavior">
                <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary-hover">
                  Detailed Breakdown <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            }
          >
            <GroupedBarChart data={behaviorComparison} height={270} />
          </ChartCard>
        </div>
      </div>

      {/* Course Completion Breakdown */}
      <ChartCard
        title="Course Completion Rates"
        description="Aggregated completion performance sorted across all 10 academic subjects with cohort average benchmark"
        action={
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary-hover">
              Course Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      >
        <CompletionByCourseChart
          data={courseCompletion}
          overallAvg={overallAvgCompletionRate}
          height={280}
          onSelectCourse={(cid) => router.push(`/courses?select=${cid}`)}
        />
      </ChartCard>

      {/* Top 8 High Risk Learners Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-text">Urgent Intervention Queue</h3>
            <p className="text-xs text-text-muted">
              Top 8 learners with highest model-predicted dropout probabilities requiring priority outreach
            </p>
          </div>
          <Link href="/learners?risk=High">
            <Button variant="outline" size="sm" className="text-xs">
              View All {highRiskCount} High-Risk Learners
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted/70 border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="p-3.5 font-semibold">Learner ID</th>
                  <th className="p-3.5 font-semibold">Course</th>
                  <th className="p-3.5 font-semibold">Video Completion</th>
                  <th className="p-3.5 font-semibold text-right">Logins / Week</th>
                  <th className="p-3.5 font-semibold">Dropout Risk</th>
                  <th className="p-3.5 font-semibold">Risk Level</th>
                  <th className="p-3.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topRiskLearners.map((learner) => {
                  const riskPct = Math.round(learner.predictedRisk * 100);

                  return (
                    <tr
                      key={learner.Learner_ID}
                      onClick={() => router.push(`/learners/${learner.Learner_ID}`)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 font-mono font-semibold text-primary">
                        {learner.Learner_ID}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {learner.Course_ID}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={learner.Video_Completion}
                            size="sm"
                            className="w-24"
                            variant="primary"
                          />
                          <span className="text-xs font-semibold tabular-nums text-text">
                            {learner.Video_Completion}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-medium">
                        {learner.Login_Frequency}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={riskPct}
                            size="sm"
                            className="w-20"
                            variant="danger"
                          />
                          <span className="text-xs font-bold text-rose-600 tabular-nums">
                            {riskPct}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <RiskBadge level={learner.riskLevel} />
                      </td>
                      <td className="p-3.5 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-text-muted hover:text-primary hover:bg-primary-soft"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/learners/${learner.Learner_ID}`);
                          }}
                          aria-label={`View learner ${learner.Learner_ID}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
