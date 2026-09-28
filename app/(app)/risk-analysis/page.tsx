"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDataset } from "@/lib/context/DatasetContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DonutChart } from "@/components/charts/DonutChart";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Filter,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RISK_CONFIG } from "@/lib/constants";

export default function RiskAnalysisPage() {
  const router = useRouter();
  const { risk, learners, courses } = useDataset();

  // Filters for the high-risk table
  const [filterRisk, setFilterRisk] = useState<string>("High");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const riskDonutData = [
    {
      name: "High Risk (>66%)",
      value: risk.high.count,
      color: RISK_CONFIG.High.color,
    },
    {
      name: "Medium Risk (33-66%)",
      value: risk.medium.count,
      color: RISK_CONFIG.Medium.color,
    },
    {
      name: "Low Risk (<33%)",
      value: risk.low.count,
      color: RISK_CONFIG.Low.color,
    },
  ];

  // Grouped bar chart comparing behaviors across Low, Medium, and High Risk cohorts
  const riskBehaviorsData = [
    {
      metric: "Video Watch (%)",
      "High Risk": risk.high.avgVideo,
      "Medium Risk": risk.medium.avgVideo,
      "Low Risk": risk.low.avgVideo,
    },
    {
      metric: "Logins / Wk (x10)",
      "High Risk": Math.round(risk.high.avgLogin * 10 * 10) / 10,
      "Medium Risk": Math.round(risk.medium.avgLogin * 10 * 10) / 10,
      "Low Risk": Math.round(risk.low.avgLogin * 10 * 10) / 10,
    },
    {
      metric: "Quizzes (x15)",
      "High Risk": Math.round(risk.high.avgQuiz * 15 * 10) / 10,
      "Medium Risk": Math.round(risk.medium.avgQuiz * 15 * 10) / 10,
      "Low Risk": Math.round(risk.low.avgQuiz * 15 * 10) / 10,
    },
    {
      metric: "Assignments (x20)",
      "High Risk": Math.round(risk.high.avgAssignments * 20 * 10) / 10,
      "Medium Risk": Math.round(risk.medium.avgAssignments * 20 * 10) / 10,
      "Low Risk": Math.round(risk.low.avgAssignments * 20 * 10) / 10,
    },
    {
      metric: "Discussion (x15)",
      "High Risk": Math.round(risk.high.avgDiscussion * 15 * 10) / 10,
      "Medium Risk": Math.round(risk.medium.avgDiscussion * 15 * 10) / 10,
      "Low Risk": Math.round(risk.low.avgDiscussion * 15 * 10) / 10,
    },
  ];

  // Filtered table learners
  const filteredLearners = useMemo(() => {
    return learners.filter((l) => {
      if (filterRisk !== "all" && l.riskLevel !== filterRisk) return false;
      if (filterCourse !== "all" && l.Course_ID !== filterCourse) return false;
      if (filterStatus !== "all" && l.Completion_Status !== filterStatus) return false;
      return true;
    });
  }, [learners, filterRisk, filterCourse, filterStatus]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Predictive Dropout Risk Analysis"
        description="Stratified risk distribution, cross-cohort behavioral profiling, and proactive outreach queues prioritized by machine-learned probability tiers."
      />

      {/* Mandatory Disclaimer Note */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Model Decision Support Disclaimer:</span>
          <p className="leading-relaxed text-blue-800">
            Dropout risk scores represent statistical probabilities derived from student
            engagement vectors. They are intended for <strong>prioritizing human support and
            preventative mentorship</strong>, not as certain predictions or value judgments of
            student capability.
          </p>
        </div>
      </div>

      {/* 3 Risk Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* High Risk Card */}
        <div className="rounded-2xl border-2 border-rose-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-2 w-full bg-rose-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              High Risk Tier (&gt; 66%)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {risk.high.count.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-rose-600 ml-2">
              ({risk.high.percentage}% of cohort)
            </span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Average Video Watch: <strong>{risk.high.avgVideo}%</strong> | Logins:{" "}
            <strong>{risk.high.avgLogin}/wk</strong>
          </p>
          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
            <span className="text-text-muted">Urgent Action:</span>
            <span className="font-semibold text-rose-700">1-on-1 Mentor Outreach</span>
          </div>
        </div>

        {/* Medium Risk Card */}
        <div className="rounded-2xl border-2 border-amber-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-2 w-full bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Medium Risk Tier (33-66%)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {risk.medium.count.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-amber-600 ml-2">
              ({risk.medium.percentage}% of cohort)
            </span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Average Video Watch: <strong>{risk.medium.avgVideo}%</strong> | Logins:{" "}
            <strong>{risk.medium.avgLogin}/wk</strong>
          </p>
          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
            <span className="text-text-muted">Recommended:</span>
            <span className="font-semibold text-amber-700">Milestone Nudges</span>
          </div>
        </div>

        {/* Low Risk Card */}
        <div className="rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-2 w-full bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Low Risk Tier (&lt; 33%)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {risk.low.count.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 ml-2">
              ({risk.low.percentage}% of cohort)
            </span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Average Video Watch: <strong>{risk.low.avgVideo}%</strong> | Logins:{" "}
            <strong>{risk.low.avgLogin}/wk</strong>
          </p>
          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
            <span className="text-text-muted">Status:</span>
            <span className="font-semibold text-emerald-700">Self-Paced Progression</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Donut + Grouped Bar by Risk Level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Donut */}
        <div className="lg:col-span-5">
          <Card className="h-full border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Risk Tier Distribution</CardTitle>
              <CardDescription>
                Proportion of active learners grouped by predicted dropout likelihood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={riskDonutData}
                centerValue={`${risk.high.percentage}%`}
                centerLabel="High Risk"
                height={270}
              />
            </CardContent>
          </Card>
        </div>

        {/* Grouped Bar: Average Behaviors by Risk Level */}
        <div className="lg:col-span-7">
          <Card className="h-full border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Behavioral Profiles Across Risk Tiers
              </CardTitle>
              <CardDescription>
                Empirical feature means illustrating engagement divergence across risk strata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: 280, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={riskBehaviorsData}
                    margin={{ top: 15, right: 15, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="metric"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#E2E8F0" }}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-border bg-surface p-3 shadow-lg text-xs space-y-1">
                              <p className="font-bold text-text border-b border-border pb-1">
                                {d.metric}
                              </p>
                              <div className="flex justify-between text-rose-600">
                                <span>High Risk:</span>
                                <span className="font-bold">{d["High Risk"]}</span>
                              </div>
                              <div className="flex justify-between text-amber-600">
                                <span>Medium Risk:</span>
                                <span className="font-bold">{d["Medium Risk"]}</span>
                              </div>
                              <div className="flex justify-between text-emerald-600">
                                <span>Low Risk:</span>
                                <span className="font-bold">{d["Low Risk"]}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: 10 }}
                      formatter={(val) => (
                        <span className="text-xs font-semibold text-text px-1">{val}</span>
                      )}
                    />
                    <Bar dataKey="High Risk" fill={RISK_CONFIG.High.color} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Medium Risk" fill={RISK_CONFIG.Medium.color} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Low Risk" fill={RISK_CONFIG.Low.color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filterable Risk Management Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-text">Targeted Risk Cohort Roster</h3>
            <p className="text-xs text-text-muted">
              Filter by risk level, enrolled course, and status to deploy targeted interventions
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="h-9 text-xs w-36"
            >
              <option value="all">All Risk Tiers</option>
              <option value="High">High Risk Only</option>
              <option value="Medium">Medium Risk Only</option>
              <option value="Low">Low Risk Only</option>
            </Select>

            <Select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="h-9 text-xs w-36"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.Course_ID} value={c.Course_ID}>
                  {c.Course_ID}
                </option>
              ))}
            </Select>

            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 text-xs w-36"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Not Completed">Not Completed</option>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted/70 border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="p-3.5 font-semibold">Learner ID</th>
                  <th className="p-3.5 font-semibold">Course</th>
                  <th className="p-3.5 font-semibold">Dropout Probability</th>
                  <th className="p-3.5 font-semibold">Video Watch</th>
                  <th className="p-3.5 font-semibold text-right">Logins/wk</th>
                  <th className="p-3.5 font-semibold">Prescribed Action</th>
                  <th className="p-3.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLearners.slice(0, 15).map((l) => {
                  const riskPct = Math.round(l.predictedRisk * 100);

                  return (
                    <tr
                      key={l.Learner_ID}
                      onClick={() => router.push(`/learners/${l.Learner_ID}`)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 font-mono font-semibold text-primary">
                        {l.Learner_ID}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {l.Course_ID}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <RiskBadge level={l.riskLevel} />
                          <span className="text-xs font-bold tabular-nums text-text">
                            {riskPct}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={l.Video_Completion}
                            size="sm"
                            className="w-20"
                            variant="primary"
                          />
                          <span className="text-xs font-medium tabular-nums text-text">
                            {l.Video_Completion}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-medium">{l.Login_Frequency}</td>
                      <td className="p-3.5 text-xs text-text-muted max-w-[280px] truncate">
                        {l.recommendedAction}
                      </td>
                      <td className="p-3.5 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-text-muted hover:text-primary hover:bg-primary-soft"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/learners/${l.Learner_ID}`);
                          }}
                          aria-label={`View learner ${l.Learner_ID}`}
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

        <div className="flex items-center justify-between text-xs text-text-muted px-1">
          <span>
            Displaying top 15 of <strong>{filteredLearners.length.toLocaleString()}</strong> filtered records
          </span>
          <Link href="/learners">
            <Button variant="ghost" size="sm" className="text-xs text-primary">
              Full directory with pagination <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
