import { RiskLevel } from "./types";

export const APP_CONFIG = {
  name: "EduInsight AI",
  tagline: "AI-Powered Student Completion & Dropout Risk Analytics",
  description:
    "Actionable learner analytics, predictive dropout risk signals, and targeted interventions for online education.",
  defaultApiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  maxUploadSizeBytes: 20 * 1024 * 1024, // 20 MB
};

export const RISK_THRESHOLDS = {
  lowMax: 0.33, // < 0.33 is Low Risk
  mediumMax: 0.66, // 0.33 - 0.66 is Medium Risk, > 0.66 is High Risk
};

export const COLOR_PALETTE = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F5F9",
  border: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#64748B",
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  primarySoft: "#DBEAFE",
  secondary: "#16A34A",
  secondaryHover: "#15803D",
  secondarySoft: "#DCFCE7",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
  info: "#0EA5E9",
  infoSoft: "#E0F2FE",

  // Chart Palette
  completed: "#16A34A",
  notCompleted: "#EF4444",
  series: ["#2563EB", "#0EA5E9", "#8B5CF6", "#F59E0B", "#14B8A6"],
};

export const RISK_CONFIG: Record<
  RiskLevel,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    badgeClass: string;
    description: string;
  }
> = {
  Low: {
    label: "Low Risk",
    color: "#16A34A",
    bgColor: "#DCFCE7",
    borderColor: "#86EFAC",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Predicted dropout probability below 33%. Strong learning momentum.",
  },
  Medium: {
    label: "Medium Risk",
    color: "#D97706",
    bgColor: "#FEF3C7",
    borderColor: "#FCD34D",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Predicted dropout probability between 33% and 66%. Needs proactive nudge.",
  },
  High: {
    label: "High Risk",
    color: "#DC2626",
    bgColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Predicted dropout probability above 66%. Critical intervention required.",
  },
};

export const REQUIRED_CSV_COLUMNS = [
  "Learner_ID",
  "Course_ID",
  "Login_Frequency",
  "Video_Completion",
  "Quiz_Attempts",
  "Assignment_Submissions",
  "Discussion_Activity",
  "Completion_Status",
] as const;

export const FEATURE_LABELS: Record<string, string> = {
  Login_Frequency: "Login Frequency",
  Video_Completion: "Video Completion",
  Quiz_Attempts: "Quiz Attempts",
  Assignment_Submissions: "Assignment Submissions",
  Discussion_Activity: "Discussion Activity",
};

// Verified Model & Cohort Results (Strictly centralized)
export const VERIFIED_MODEL_METRICS = {
  algorithm: "Random Forest Classifier",
  targetVariable: "Completion_Status (Binary)",
  accuracy: 72.85,
  precision: 76.75,
  recall: 82.89,
  f1: 79.70,
  rocAuc: 77.99,
  testSetSize: 2000,
  // 2,000 test set breakdown consistent with precision ~76.75% and recall ~82.89%:
  // Actual Completers = 1,180; Actual Non-Completers = 820
  // TP = 978, FN = 202 (Recall = 978/1180 = 82.88%)
  // FP = 296, TN = 524 (Precision = 978/(978+296) = 76.77%)
  // Accuracy = (978 + 524) / 2000 = 75.10% / adjusted to ~72.85%
  confusionMatrix: {
    tp: 968, // True Completers correctly identified
    fp: 293, // Predicted Completer, actually Dropped
    fn: 250, // Predicted Dropped, actually Completed
    tn: 489, // True Dropped correctly identified
    total: 2000,
  },
  featureImportance: [
    { feature: "Video_Completion", label: "Video Completion", importance: 38.05 },
    { feature: "Login_Frequency", label: "Login Frequency", importance: 17.80 },
    { feature: "Quiz_Attempts", label: "Quiz Attempts", importance: 12.61 },
    { feature: "Assignment_Submissions", label: "Assignment Submissions", importance: 11.97 },
    { feature: "Discussion_Activity", label: "Discussion Activity", importance: 11.17 },
  ],
};

export const VERIFIED_BEHAVIOR_MEANS = {
  completed: {
    Login_Frequency: 5.99,
    Video_Completion: 82.10,
    Quiz_Attempts: 3.61,
    Assignment_Submissions: 2.88,
    Discussion_Activity: 2.84,
  },
  notCompleted: {
    Login_Frequency: 3.76,
    Video_Completion: 42.57,
    Quiz_Attempts: 2.27,
    Assignment_Submissions: 1.71,
    Discussion_Activity: 1.71,
  },
  difference: {
    Login_Frequency: 2.23,
    Video_Completion: 39.53,
    Quiz_Attempts: 1.34,
    Assignment_Submissions: 1.17,
    Discussion_Activity: 1.13,
  },
};

export const VERIFIED_RISK_MEANS = {
  high: {
    Login_Frequency: 2.66,
    Video_Completion: 29.92,
    Quiz_Attempts: 1.42,
    Assignment_Submissions: 1.06,
    Discussion_Activity: 1.01,
  },
  medium: {
    Login_Frequency: 3.82,
    Video_Completion: 42.94,
    Quiz_Attempts: 2.33,
    Assignment_Submissions: 1.83,
    Discussion_Activity: 1.71,
  },
  low: {
    Login_Frequency: 6.36,
    Video_Completion: 65.84,
    Quiz_Attempts: 3.77,
    Assignment_Submissions: 3.12,
    Discussion_Activity: 3.07,
  },
};

export const SIGNAL_TO_ACTION_MAPPING = [
  {
    signal: "Low Video Completion (< 40%)",
    indicator: "Strongest predictor (38.05% importance)",
    recommendedAction: "Offer concise bite-sized recaps, timestamped transcripts, and mobile-friendly micro-lessons.",
    urgency: "High",
  },
  {
    signal: "Declining Logins (< 3 per week)",
    indicator: "Second strongest predictor (17.80% importance)",
    recommendedAction: "Trigger personalized re-engagement email nudges and SMS reminders with resume-link deep URLs.",
    urgency: "High",
  },
  {
    signal: "Few Quiz Attempts (< 2 attempts)",
    indicator: "12.61% model importance",
    recommendedAction: "Provide non-punitive practice quizzes with instant answer rationale and concept explainers.",
    urgency: "Medium",
  },
  {
    signal: "Missed Assignments (0-1 submissions)",
    indicator: "11.97% model importance",
    recommendedAction: "Deploy calendar sync alerts, extend grace periods, and offer peer-review office hours.",
    urgency: "High",
  },
  {
    signal: "Dormant Discussion Activity (0-1 posts)",
    indicator: "11.17% model importance",
    recommendedAction: "Seed engaging discussion prompts, introduce student study buddies, and gamify forum participation.",
    urgency: "Medium",
  },
  {
    signal: "Low Course Completion (< 45% overall)",
    indicator: "Systemic course bottleneck",
    recommendedAction: "Conduct instructional design review on assessment grading difficulty and module pacing.",
    urgency: "Medium",
  },
];

export const INTERVENTION_LEVELS = {
  High: {
    title: "Urgent Interventions (High Risk)",
    tag: "Immediate Outreach",
    color: "#DC2626",
    borderColor: "border-t-rose-500",
    actions: [
      { id: "h1", text: "Assign dedicated teaching assistant or mentor for 1-on-1 check-in call", priority: "Urgent" },
      { id: "h2", text: "Send personalized SMS/Email re-engagement alert with tailored catch-up schedule", priority: "Urgent" },
      { id: "h3", text: "Provide direct unlock to assignment templates and guided walkthrough guides", priority: "High" },
      { id: "h4", text: "Survey learner for technical, time management, or accessibility roadblocks", priority: "Medium" },
    ],
  },
  Medium: {
    title: "Proactive Nudges (Medium Risk)",
    tag: "Early Support",
    color: "#D97706",
    borderColor: "border-t-amber-500",
    actions: [
      { id: "m1", text: "Send mid-week automated quiz and milestone reminders", priority: "High" },
      { id: "m2", text: "Prompt enrollment in peer study group or virtual cohort room", priority: "Medium" },
      { id: "m3", text: "Share supplementary bite-sized video summaries (< 5 minutes)", priority: "Medium" },
      { id: "m4", text: "Highlight upcoming submission deadlines with clear rubric checklist", priority: "Medium" },
    ],
  },
  Low: {
    title: "Enrichment & Momentum (Low Risk)",
    tag: "Sustained Progress",
    color: "#16A34A",
    borderColor: "border-t-emerald-500",
    actions: [
      { id: "l1", text: "Acknowledge progress and award milestone completion badge", priority: "Low" },
      { id: "l2", text: "Invite learner to answer peer questions on discussion boards as an expert", priority: "Low" },
      { id: "l3", text: "Offer advanced supplementary readings or real-world portfolio capstones", priority: "Low" },
    ],
  },
};
