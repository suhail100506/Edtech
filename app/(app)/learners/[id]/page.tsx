"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDataset } from "@/lib/context/DatasetContext";
import { predict } from "@/lib/api/services";
import { PredictRequest, PredictResponse } from "@/lib/types";
import {
  VERIFIED_BEHAVIOR_MEANS,
  INTERVENTION_LEVELS,
} from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { RadialGauge } from "@/components/charts/RadialGauge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Video,
  FileCheck,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LearnerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const learnerId = (params?.id as string) || "";
  const { learners, courses } = useDataset();

  const learner = learners.find(
    (l) => l.Learner_ID.toLowerCase() === learnerId.toLowerCase()
  );

  const course = courses.find((c) => c.Course_ID === learner?.Course_ID);

  // What-If Prediction simulation state
  const [whatIfResult, setWhatIfResult] = useState<PredictResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<PredictRequest>({
    defaultValues: {
      Login_Frequency: learner?.Login_Frequency || 4,
      Video_Completion: learner?.Video_Completion || 50,
      Quiz_Attempts: learner?.Quiz_Attempts || 2,
      Assignment_Submissions: learner?.Assignment_Submissions || 2,
      Discussion_Activity: learner?.Discussion_Activity || 2,
    },
  });

  const onSimulateSubmit = async (values: PredictRequest) => {
    setIsPredicting(true);
    try {
      const res = await predict({
        Login_Frequency: Number(values.Login_Frequency),
        Video_Completion: Number(values.Video_Completion),
        Quiz_Attempts: Number(values.Quiz_Attempts),
        Assignment_Submissions: Number(values.Assignment_Submissions),
        Discussion_Activity: Number(values.Discussion_Activity),
      });
      setWhatIfResult(res.data);
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setIsPredicting(false);
    }
  };

  // If learner not found, show 404 state
  if (!learner) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-text">Learner Not Found</h2>
        <p className="mt-1 max-w-sm text-sm text-text-muted">
          No student record with identifier &ldquo;{learnerId}&rdquo; was found in the current dataset.
        </p>
        <Link href="/learners" className="mt-6">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Student Directory
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate behavioral gaps compared to Completers benchmark
  const gaps = [
    {
      label: "Video Completion",
      feature: "Video_Completion",
      learnerVal: learner.Video_Completion,
      benchmark: VERIFIED_BEHAVIOR_MEANS.completed.Video_Completion,
      unit: "%",
      diff: learner.Video_Completion - VERIFIED_BEHAVIOR_MEANS.completed.Video_Completion,
      importance: "38.05% (Highest Signal)",
    },
    {
      label: "Login Frequency",
      feature: "Login_Frequency",
      learnerVal: learner.Login_Frequency,
      benchmark: VERIFIED_BEHAVIOR_MEANS.completed.Login_Frequency,
      unit: "logins/wk",
      diff: learner.Login_Frequency - VERIFIED_BEHAVIOR_MEANS.completed.Login_Frequency,
      importance: "17.80%",
    },
    {
      label: "Quiz Attempts",
      feature: "Quiz_Attempts",
      learnerVal: learner.Quiz_Attempts,
      benchmark: VERIFIED_BEHAVIOR_MEANS.completed.Quiz_Attempts,
      unit: "attempts",
      diff: learner.Quiz_Attempts - VERIFIED_BEHAVIOR_MEANS.completed.Quiz_Attempts,
      importance: "12.61%",
    },
    {
      label: "Assignment Submissions",
      feature: "Assignment_Submissions",
      learnerVal: learner.Assignment_Submissions,
      benchmark: VERIFIED_BEHAVIOR_MEANS.completed.Assignment_Submissions,
      unit: "submissions",
      diff: learner.Assignment_Submissions - VERIFIED_BEHAVIOR_MEANS.completed.Assignment_Submissions,
      importance: "11.97%",
    },
    {
      label: "Discussion Activity",
      feature: "Discussion_Activity",
      learnerVal: learner.Discussion_Activity,
      benchmark: VERIFIED_BEHAVIOR_MEANS.completed.Discussion_Activity,
      unit: "posts",
      diff: learner.Discussion_Activity - VERIFIED_BEHAVIOR_MEANS.completed.Discussion_Activity,
      importance: "11.17%",
    },
  ];

  // Behaviors furthest below completer average
  const criticalDeficits = [...gaps]
    .filter((g) => g.diff < 0)
    .sort((a, b) => a.diff - b.diff);

  const riskPct = Math.round(learner.predictedRisk * 100);
  const completionPct = Math.round(learner.completionProbability * 100);
  const interventionInfo = INTERVENTION_LEVELS[learner.riskLevel];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Navigation */}
      <div>
        <Link
          href="/learners"
          className="inline-flex items-center text-xs font-semibold text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Learners Directory
        </Link>
      </div>

      {/* Header Profile Banner */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
                {learner.Learner_ID}
              </h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  {learner.Course_ID} - {course?.courseName || "General Course"}
                </span>
                <StatusBadge status={learner.Completion_Status} />
                <RiskBadge level={learner.riskLevel} />
              </div>
            </div>
            <p className="text-xs text-text-muted">
              Enrollment footprint and individualized machine-learned dropout telemetry
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/courses?select=${learner.Course_ID}`}>
              <Button variant="outline" size="sm" className="text-xs">
                View Course Cohort
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-border">
          <div className="p-3 rounded-xl bg-surface-muted/50 border border-border">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Logins / Week
            </span>
            <p className="text-xl font-bold text-text mt-1">
              {learner.Login_Frequency}
            </p>
            <span className="text-[11px] text-text-muted">Completers: ~6.0</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-muted/50 border border-border">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Video className="h-3.5 w-3.5 text-info" />
              Video Watch
            </span>
            <p className="text-xl font-bold text-text mt-1">
              {learner.Video_Completion}%
            </p>
            <span className="text-[11px] text-text-muted">Completers: 82.1%</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-muted/50 border border-border">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <FileCheck className="h-3.5 w-3.5 text-secondary" />
              Quiz Attempts
            </span>
            <p className="text-xl font-bold text-text mt-1">
              {learner.Quiz_Attempts}
            </p>
            <span className="text-[11px] text-text-muted">Completers: ~3.6</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-muted/50 border border-border">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <FileCheck className="h-3.5 w-3.5 text-warning" />
              Assignments
            </span>
            <p className="text-xl font-bold text-text mt-1">
              {learner.Assignment_Submissions}
            </p>
            <span className="text-[11px] text-text-muted">Completers: ~2.9</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-muted/50 border border-border col-span-2 sm:col-span-1">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
              Discussion
            </span>
            <p className="text-xl font-bold text-text mt-1">
              {learner.Discussion_Activity}
            </p>
            <span className="text-[11px] text-text-muted">Completers: ~2.8</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Gauges + Cohort Benchmark Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radial Gauges */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <RadialGauge
            value={riskPct}
            title="Predicted Dropout Risk"
            subtitle="Model estimated likelihood of course non-completion"
            type="risk"
            size={170}
          />
          <RadialGauge
            value={completionPct}
            title="Predicted Completion Probability"
            subtitle="Probability of fulfilling all course completion requirements"
            type="completion"
            size={170}
          />
        </div>

        {/* Engagement Gap Analysis (Learner vs Completer Benchmark) */}
        <div className="lg:col-span-7">
          <Card className="h-full border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Benchmark Gap Diagnostic (vs. Completers)
              </CardTitle>
              <CardDescription>
                Visual comparison between this learner&rsquo;s footprint and successful completers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {gaps.map((item) => {
                const isDeficit = item.diff < 0;
                const absDiff = Math.abs(Math.round(item.diff * 10) / 10);

                return (
                  <div key={item.feature} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-text">{item.label}</span>
                        <span className="text-text-muted text-[11px] ml-1.5">
                          ({item.importance})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">
                          {item.learnerVal} {item.unit}
                        </span>
                        <span className="text-text-muted">vs</span>
                        <span className="text-text-muted">
                          {item.benchmark} {item.unit}
                        </span>
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded text-[11px] font-bold",
                            isDeficit
                              ? "bg-rose-50 text-rose-700"
                              : "bg-emerald-50 text-emerald-700"
                          )}
                        >
                          {isDeficit ? `-${absDiff}` : `+${absDiff}`} {item.unit}
                        </span>
                      </div>
                    </div>

                    {/* Visual Comparison Bar */}
                    <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          item.feature === "Video_Completion"
                            ? "bg-primary"
                            : isDeficit
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        )}
                        style={{
                          width: `${Math.min(
                            (item.learnerVal / (item.benchmark * 1.25 || 100)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why This Risk Section & Recommended Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Why this risk? Card */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-600" />
              Risk Attribution Factors
            </CardTitle>
            <CardDescription>
              Behavioral signals exhibiting greatest divergence from completion patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalDeficits.length > 0 ? (
              criticalDeficits.map((def, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-surface-muted/30 p-3.5 flex items-start gap-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-text">
                      {def.label} is{" "}
                      <span className="text-rose-600 font-bold">
                        {Math.abs(Math.round(def.diff * 10) / 10)} {def.unit} below
                      </span>{" "}
                      the completer average
                    </p>
                    <p className="text-text-muted leading-relaxed">
                      Learners exhibiting low {def.label.toLowerCase()} are statistically
                      associated with higher discontinuation probabilities ({def.importance}{" "}
                      signal weight). Note: This reflects an empirical correlation, not direct causation.
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-800">
                <p className="font-semibold">No critical deficits detected</p>
                <p className="mt-1">
                  This learner&rsquo;s engagement signals track at or above the average metrics of
                  successful completers.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Intervention Plan Card */}
        <Card
          className={cn(
            "border border-border border-t-4",
            interventionInfo.borderColor
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Prescribed Support Interventions
              </CardTitle>
              <RiskBadge level={learner.riskLevel} />
            </div>
            <CardDescription>{interventionInfo.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3 text-xs text-blue-900">
              <span className="font-bold">Automated Recommendation:</span>{" "}
              {learner.recommendedAction || "Conduct scheduled academic check-in."}
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Action Checklist:
              </span>
              {interventionInfo.actions.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-2.5 rounded-lg border border-border bg-white p-2.5 text-xs transition-colors hover:bg-slate-50"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-text font-medium">{act.text}</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      act.priority === "Urgent"
                        ? "bg-rose-100 text-rose-800"
                        : act.priority === "High"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    )}
                  >
                    {act.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5.3b Predict What-If Simulation Form */}
      <Card className="border border-border bg-gradient-to-r from-blue-50/30 via-slate-50/50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                &ldquo;What-If&rdquo; Intervention Scenario Simulator
              </CardTitle>
              <CardDescription>
                Simulate potential risk changes if learner engagement improves via support intervention
              </CardDescription>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-primary">
              Interactive ML Scoring
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSimulateSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">
                  Logins / Week (0-10)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="14"
                  {...register("Login_Frequency", { required: true, min: 0, max: 14 })}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">
                  Video Completion % (0-100)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  {...register("Video_Completion", { required: true, min: 0, max: 100 })}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">
                  Quiz Attempts (0-10)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="10"
                  {...register("Quiz_Attempts", { required: true, min: 0, max: 10 })}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">
                  Assignments (0-6)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="6"
                  {...register("Assignment_Submissions", { required: true, min: 0, max: 6 })}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">
                  Discussion Posts (0-10)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="10"
                  {...register("Discussion_Activity", { required: true, min: 0, max: 10 })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  reset();
                  setWhatIfResult(null);
                }}
                className="text-xs text-text-muted"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset Values
              </Button>

              <Button
                type="submit"
                disabled={isPredicting}
                size="sm"
                className="bg-primary hover:bg-primary-hover text-white text-xs"
              >
                {isPredicting ? "Scoring with Random Forest..." : "Calculate Simulated Risk Score"}
              </Button>
            </div>
          </form>

          {/* Simulation Output Banner */}
          {whatIfResult && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-white p-4 shadow-sm animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text uppercase tracking-wider">
                      Simulated Scenario Outcome:
                    </span>
                    {whatIfResult.isEstimatedDemo && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                        Estimated (demo)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    Based on Random Forest feature coefficients (Target: Completion_Status)
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs text-text-muted">Simulated Risk:</span>
                    <p className="text-lg font-bold text-rose-600">
                      {Math.round(whatIfResult.dropoutProbability * 100)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted">Completion Prob:</span>
                    <p className="text-lg font-bold text-emerald-600">
                      {Math.round(whatIfResult.completionProbability * 100)}%
                    </p>
                  </div>
                  <RiskBadge level={whatIfResult.riskLevel} />
                </div>
              </div>

              {/* Factors list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-border">
                {whatIfResult.contributingFactors.map((f) => (
                  <div key={f.feature} className="text-xs flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        f.status === "optimal"
                          ? "bg-emerald-500"
                          : f.status === "warning"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      )}
                    />
                    <strong className="text-text">{f.label}:</strong>
                    <span className="text-text-muted truncate">{f.comment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
