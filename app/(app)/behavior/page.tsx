"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { InsightCallout } from "@/components/shared/InsightCallout";
import { Badge } from "@/components/ui/badge";
import { VERIFIED_BEHAVIOR_MEANS, COLOR_PALETTE } from "@/lib/constants";
import {
  Video,
  Calendar,
  FileCheck,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function BehaviorAnalyticsPage() {
  const metricsList = [
    {
      key: "Video_Completion",
      title: "Video Completion",
      icon: Video,
      completed: VERIFIED_BEHAVIOR_MEANS.completed.Video_Completion,
      notCompleted: VERIFIED_BEHAVIOR_MEANS.notCompleted.Video_Completion,
      diff: VERIFIED_BEHAVIOR_MEANS.difference.Video_Completion,
      unit: "%",
      isPrimary: true,
      maxScale: 100,
      description: "Aggregated percentage of lecture and tutorial video duration watched",
    },
    {
      key: "Login_Frequency",
      title: "Login Frequency",
      icon: Calendar,
      completed: VERIFIED_BEHAVIOR_MEANS.completed.Login_Frequency,
      notCompleted: VERIFIED_BEHAVIOR_MEANS.notCompleted.Login_Frequency,
      diff: VERIFIED_BEHAVIOR_MEANS.difference.Login_Frequency,
      unit: "/ week",
      isPrimary: false,
      maxScale: 10,
      description: "Weekly platform authentication cadence reflecting learning rhythm",
    },
    {
      key: "Quiz_Attempts",
      title: "Quiz Attempts",
      icon: FileCheck,
      completed: VERIFIED_BEHAVIOR_MEANS.completed.Quiz_Attempts,
      notCompleted: VERIFIED_BEHAVIOR_MEANS.notCompleted.Quiz_Attempts,
      diff: VERIFIED_BEHAVIOR_MEANS.difference.Quiz_Attempts,
      unit: "attempts",
      isPrimary: false,
      maxScale: 6,
      description: "Cumulative participation in formative knowledge checks and self-tests",
    },
    {
      key: "Assignment_Submissions",
      title: "Assignment Submissions",
      icon: FileCheck,
      completed: VERIFIED_BEHAVIOR_MEANS.completed.Assignment_Submissions,
      notCompleted: VERIFIED_BEHAVIOR_MEANS.notCompleted.Assignment_Submissions,
      diff: VERIFIED_BEHAVIOR_MEANS.difference.Assignment_Submissions,
      unit: "submissions",
      isPrimary: false,
      maxScale: 5,
      description: "Graded coursework and project milestones delivered on time",
    },
    {
      key: "Discussion_Activity",
      title: "Discussion Activity",
      icon: MessageSquare,
      completed: VERIFIED_BEHAVIOR_MEANS.completed.Discussion_Activity,
      notCompleted: VERIFIED_BEHAVIOR_MEANS.notCompleted.Discussion_Activity,
      diff: VERIFIED_BEHAVIOR_MEANS.difference.Discussion_Activity,
      unit: "posts",
      isPrimary: false,
      maxScale: 5,
      description: "Peer forum questions, conceptual clarifications, and collaborative replies",
    },
  ];

  // Data for large combined difference chart
  const diffChartData = [
    {
      name: "Video Completion",
      difference: VERIFIED_BEHAVIOR_MEANS.difference.Video_Completion,
      unit: "% pts",
      isStrongest: true,
      importance: "38.05%",
    },
    {
      name: "Login Frequency",
      difference: VERIFIED_BEHAVIOR_MEANS.difference.Login_Frequency,
      unit: "logins/wk",
      importance: "17.80%",
    },
    {
      name: "Quiz Attempts",
      difference: VERIFIED_BEHAVIOR_MEANS.difference.Quiz_Attempts,
      unit: "attempts",
      importance: "12.61%",
    },
    {
      name: "Assignment Submissions",
      difference: VERIFIED_BEHAVIOR_MEANS.difference.Assignment_Submissions,
      unit: "submissions",
      importance: "11.97%",
    },
    {
      name: "Discussion Activity",
      difference: VERIFIED_BEHAVIOR_MEANS.difference.Discussion_Activity,
      unit: "posts",
      importance: "11.17%",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Behavioral Disparity Analytics"
        description="Empirical activity comparisons between students who successfully complete courses and those who discontinue. All signals reflect observed statistical differences."
      />

      {/* Primary Correlation Insight */}
      <InsightCallout
        title="Observed Correlation: Video Completion Disparity"
        badgeText="+39.53 pts Observed Gap"
        description="Video completion shows the largest observed difference between completers (82.10%) and non-completers (42.57%) and is the single strongest predictive signal in the Random Forest model (38.05% feature importance). This is an empirical association, not definitive proof of sole causation."
        subtext="Engagement differences persist across all 10 course subjects, signifying a fundamental platform-wide behavior pattern."
      />

      {/* 5 Behavioral Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricsList.map((m) => {
          const compPct = (m.completed / m.maxScale) * 100;
          const notCompPct = (m.notCompleted / m.maxScale) * 100;
          const Icon = m.icon;

          return (
            <Card
              key={m.key}
              className={`border transition-all duration-150 ${
                m.isPrimary
                  ? "border-blue-300 shadow-md ring-1 ring-blue-200"
                  : "border-border shadow-sm"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        m.isPrimary
                          ? "bg-primary text-white"
                          : "bg-surface-muted text-text-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-bold">{m.title}</CardTitle>
                  </div>
                  {m.isPrimary && (
                    <Badge variant="subtle" className="text-[10px]">
                      ★ Primary Signal
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs pt-1 line-clamp-2">
                  {m.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metric Statistics */}
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-muted/40 p-3">
                  <div>
                    <span className="text-[11px] font-medium text-emerald-700">
                      Completed:
                    </span>
                    <p className="text-lg font-bold text-emerald-800">
                      {m.completed} {m.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-rose-700">
                      Not Completed:
                    </span>
                    <p className="text-lg font-bold text-rose-800">
                      {m.notCompleted} {m.unit}
                    </p>
                  </div>
                </div>

                {/* Absolute Difference Badge */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Observed Disparity:</span>
                  <span className="inline-flex items-center font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-md">
                    +{m.diff} {m.unit}
                  </span>
                </div>

                {/* Dual Horizontal Bars */}
                <div className="space-y-2 pt-1 border-t border-border">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-text-muted">
                      <span>Completed</span>
                      <span className="font-semibold text-emerald-700">{m.completed}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(compPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-text-muted">
                      <span>Not Completed</span>
                      <span className="font-semibold text-rose-700">{m.notCompleted}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${Math.min(notCompPct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Large Combined Difference Chart */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Magnitude of Behavioral Disparity (Completed vs. Discontinued)
              </CardTitle>
              <CardDescription>
                Net activity difference observed between completers and dropouts
              </CardDescription>
            </div>
            <Badge variant="subtle" className="text-xs w-fit">
              Largest difference: +39.53 pts (Video)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ height: 320, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={diffChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
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
                          <p className="font-bold text-text">{d.name}</p>
                          <p className="text-primary font-bold">
                            Observed Difference: +{d.difference} {d.unit}
                          </p>
                          <p className="text-text-muted">
                            Model Importance: {d.importance}
                          </p>
                          {d.isStrongest && (
                            <p className="text-[10px] text-emerald-600 font-semibold pt-1">
                              ★ Dominant predictive discriminator
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="difference"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                  animationDuration={800}
                >
                  {diffChartData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.isStrongest ? COLOR_PALETTE.primary : "#94A3B8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
