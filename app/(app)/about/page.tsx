import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Target,
  Database,
  BrainCircuit,
  Code2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { REQUIRED_CSV_COLUMNS } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="About EduInsight AI"
        description="Architectural overview, machine learning methodology, dataset documentation, and roadmap for predictive learner retention systems."
      />

      {/* Product Overview & Problem Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Product Mission</CardTitle>
                <CardDescription>Democratizing early learner support at scale</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-text-muted leading-relaxed">
            <p>
              Online education platforms frequently encounter a persistent paradox:{" "}
              <strong>surging enrollments coupled with severe completion attrition</strong>.
              Students often discontinue courses quietly without overt notification, leaving
              instructors with no early opportunity for proactive pedagogical intervention.
            </p>
            <p>
              <strong>EduInsight AI</strong> synthesizes multi-dimensional learner interaction
              telemetry to compute real-time dropout risk probabilities, surface early behavioral
              divergences, and empower educational leaders with prescriptive intervention playbooks.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-secondary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">The Core Problem</CardTitle>
                <CardDescription>Asymmetric dropout feedback loops</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-text-muted leading-relaxed">
            <p>
              In traditional classroom settings, educators naturally observe attentiveness,
              body language, and attendance changes. In asynchronous digital platforms, dropouts
              are typically diagnosed only <em>after</em> the semester has concluded, when recovery
              is impossible.
            </p>
            <p>
              EduInsight AI bridges this visibility gap by transforming raw LMS activity logs
              into actionable risk tiers (Low, Medium, High) mapped directly to concrete,
              personalized interventions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dataset Schema Reference */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-info">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Input Dataset Schema</CardTitle>
                <CardDescription>
                  8 standardized attributes captured across learner enrollments
                </CardDescription>
              </div>
            </div>
            <span className="text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-lg text-text-muted">
              CSV Specification
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {REQUIRED_CSV_COLUMNS.map((col) => (
              <div
                key={col}
                className="rounded-xl border border-slate-200 bg-surface-muted/30 p-3 text-xs"
              >
                <span className="font-mono font-bold text-primary block">{col}</span>
                <span className="text-text-muted text-[11px] mt-1 block">
                  {col === "Learner_ID" && "Unique student token (e.g. L1042)"}
                  {col === "Course_ID" && "Assigned course ID (C01 to C10)"}
                  {col === "Login_Frequency" && "Weekly platform login cadence (0-14)"}
                  {col === "Video_Completion" && "Lecture video duration watched (0-100%)"}
                  {col === "Quiz_Attempts" && "Count of formative quiz trials"}
                  {col === "Assignment_Submissions" && "Graded project submissions"}
                  {col === "Discussion_Activity" && "Forum replies & peer queries"}
                  {col === "Completion_Status" && "Binary ground truth target"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Methodology & Tech Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Data & ML Methodology</CardTitle>
                <CardDescription>
                  Cleaning, Exploratory Analysis, & Ensemble Modeling
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-text-muted leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Pre-Processing:</strong> Missing value imputation, outlier detection,
                and feature normalization across 5 core activity indicators.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Algorithm:</strong> Random Forest Classifier optimized with 100
                decision estimators and balanced class weighting to safeguard against dropout minority imbalance.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Validation:</strong> Stratified holdout test evaluation (N = 2,000)
                delivering <strong>72.85% Accuracy, 76.75% Precision, 82.89% Recall, and 79.70% F1</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-primary">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Modern Technology Stack</CardTitle>
                <CardDescription>Modular, type-safe full-stack architecture</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-text-muted leading-relaxed">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-text block">Frontend Framework</span>
                <span className="text-text-muted">Next.js 15 (App Router) + React 19</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-text block">Language & Typing</span>
                <span className="text-text-muted">Strict TypeScript</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-text block">Styling System</span>
                <span className="text-text-muted">Tailwind CSS + shadcn/ui</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-text block">Data Visualization</span>
                <span className="text-text-muted">Recharts SVG Engine</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-text block">Data Transport</span>
                <span className="text-text-muted">Axios + PapaParse Client Parsing</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-text block">Form Management</span>
                <span className="text-text-muted">React Hook Form</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Limitations and Future Work Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Scientific Limitations</CardTitle>
                <CardDescription>Boundaries of aggregate retrospective data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-text-muted leading-relaxed">
            <p>
              • <strong>Lack of Temporal Timestamps:</strong> The dataset measures cumulative
              sums across an entire course rather than weekly time-series. It is impossible to identify
              the specific module or calendar date where learner engagement ceased.
            </p>
            <p>
              • <strong>Observational Signals vs. Causality:</strong> High video completion correlates
              strongly with course completion (+39.53 pts disparity). However, watching videos does
              not alone cause subject comprehension.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Future Engineering Roadmap</CardTitle>
                <CardDescription>Next-generation retention interventions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-text-muted leading-relaxed">
            <p>
              1. <strong>Timestamped Event Telemetry:</strong> Ingesting module-by-module clickstream
              events to construct Kaplan-Meier survival curves and weekly hazard models.
            </p>
            <p>
              2. <strong>Real-time FastAPI Scoring:</strong> Streaming Kafka or webhook integrations
              directly evaluating dropout probabilities upon each LMS event submission.
            </p>
            <p>
              3. <strong>A/B Tested Intervention Nudges:</strong> Measuring the causal efficacy of
              SMS reminders vs. 1-on-1 mentor calls in shifting dropout risk back to safe levels.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
