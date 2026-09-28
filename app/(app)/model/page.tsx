"use client";

import React from "react";
import { useDataset } from "@/lib/context/DatasetContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/KpiCard";
import { ConfusionMatrix } from "@/components/charts/ConfusionMatrix";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import {
  BrainCircuit,
  Target,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
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
import { COLOR_PALETTE } from "@/lib/constants";

export default function ModelPage() {
  const { model } = useDataset();

  const metricsChartData = [
    { name: "Accuracy", value: model.accuracy, fill: "#2563EB" },
    { name: "Precision", value: model.precision, fill: "#0EA5E9" },
    { name: "Recall", value: model.recall, fill: "#16A34A" },
    { name: "F1 Score", value: model.f1, fill: "#8B5CF6" },
    { name: "ROC-AUC", value: model.rocAuc, fill: "#F59E0B" },
  ];

  const featureImportanceData = model.featureImportance.map((f) => ({
    label: f.label,
    value: f.importance,
    highlight: f.feature === "Video_Completion",
    unit: "%",
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="Supervised Machine Learning Model: Random Forest"
        description="Evaluation telemetry and feature attribution for the trained Random Forest binary classifier predicting learner Completion_Status."
        badge={
          <span className="rounded-full bg-blue-100 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Python Scikit-Learn Pipeline
          </span>
        }
      />

      {/* Model Spec Notice */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-text">
              Target Variable: <span className="font-mono text-primary">{model.targetVariable}</span>
            </p>
            <p className="text-text-muted">
              Evaluated on holdout validation test cohort of N = {model.testSetSize.toLocaleString()} learners
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-text-muted bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>Model inference mode. Training execution handled in Python offline backend.</span>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Model Accuracy"
          value={`${model.accuracy}%`}
          caption="Overall correct classifications"
          icon={Target}
          iconBgColor="bg-blue-100"
          iconColor="text-primary"
          trend={{ value: "1,457 / 2,000", neutral: true }}
        />
        <KpiCard
          title="Precision"
          value={`${model.precision}%`}
          caption="Positive predictive value"
          icon={CheckCircle2}
          iconBgColor="bg-sky-100"
          iconColor="text-info"
          trend={{ value: "Low False Alarm", neutral: true }}
        />
        <KpiCard
          title="Recall (Sensitivity)"
          value={`${model.recall}%`}
          caption="True completers captured"
          icon={ShieldCheck}
          iconBgColor="bg-emerald-100"
          iconColor="text-secondary"
          trend={{ value: "968 / 1,168", isPositive: true }}
        />
        <KpiCard
          title="F1 Score"
          value={`${model.f1}%`}
          caption="Harmonic mean of P & R"
          icon={Activity}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          trend={{ value: "Balanced", neutral: true }}
        />
        <KpiCard
          title="ROC-AUC"
          value={`${model.rocAuc}%`}
          caption="Discrimination capability"
          icon={BrainCircuit}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          trend={{ value: "High AUC", isPositive: true }}
        />
      </div>

      {/* Metric Visuals: 5 Metrics Bar Chart + Feature Importance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Five Metrics Comparison Chart */}
        <div className="lg:col-span-5">
          <Card className="h-full border border-border">
            <CardHeader>
              <CardTitle className="text-base">Classifier Evaluation Metrics</CardTitle>
              <CardDescription>
                Test performance across accuracy, precision, recall, F1, and ROC-AUC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: 260, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metricsChartData}
                    margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
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
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-border bg-surface p-2.5 shadow-md text-xs">
                              <span className="font-semibold text-text">{d.name}</span>
                              <p className="font-bold text-primary mt-0.5">{d.value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                      animationDuration={800}
                    >
                      {metricsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Importance Horizontal Chart */}
        <div className="lg:col-span-7">
          <Card className="h-full border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Feature Importance (Mean Gini Impurity)
                  </CardTitle>
                  <CardDescription>
                    Relative predictive power of each behavioral feature in the ensemble
                  </CardDescription>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-primary">
                  Video = 38.05%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <HorizontalBarChart
                data={featureImportanceData}
                highlightColor={COLOR_PALETTE.primary}
                defaultColor="#94A3B8"
                height={260}
                maxValue={45}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confusion Matrix + Model Interpretation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix */}
        <div className="lg:col-span-6">
          <Card className="h-full border border-border">
            <CardHeader>
              <CardTitle className="text-base">2x2 Confusion Matrix Heatmap</CardTitle>
              <CardDescription>
                Classification distribution on the 2,000-learner validation test cohort
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfusionMatrix data={model.confusionMatrix} />
            </CardContent>
          </Card>
        </div>

        {/* Plain Language Model Interpretation */}
        <div className="lg:col-span-6">
          <Card className="h-full border border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-primary" />
                Model Behavioral Interpretation
              </CardTitle>
              <CardDescription>
                Plain-language architectural insights for academic leaders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm text-text-muted leading-relaxed">
              <div className="rounded-xl border border-slate-200 bg-surface-muted/30 p-3.5 space-y-1">
                <h4 className="font-semibold text-text text-xs uppercase tracking-wider">
                  1. Dominant Signal Architecture
                </h4>
                <p>
                  The classifier assigns <strong>38.05% of its decision weight to Video Completion</strong>,
                  followed by <strong>17.80% to Login Frequency</strong>. Quiz attempts (12.61%),
                  assignments (11.97%), and discussions (11.17%) contribute auxiliary verification.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-surface-muted/30 p-3.5 space-y-1">
                <h4 className="font-semibold text-text text-xs uppercase tracking-wider">
                  2. High Recall Sensitivity (82.89%)
                </h4>
                <p>
                  The high recall rate means the model successfully captures over <strong>82% of true
                  completers</strong>. In an educational intervention pipeline, prioritizing high
                  recall ensures vulnerable dropouts are not prematurely classified as safe.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-surface-muted/30 p-3.5 space-y-1">
                <h4 className="font-semibold text-text text-xs uppercase tracking-wider">
                  3. Association vs. Causality
                </h4>
                <p>
                  These weights represent <em>statistical predictive associations</em> within the
                  current LMS dataset. High video watch time correlates strongly with course completion,
                  but video playback itself is not a standalone causal guarantee of conceptual mastery.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
