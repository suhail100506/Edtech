import { DashboardData, BehaviorComparison } from "../types";
import { COLOR_PALETTE, VERIFIED_BEHAVIOR_MEANS, VERIFIED_MODEL_METRICS } from "../constants";
import { MOCK_LEARNERS } from "./mockLearners";
import { MOCK_COURSES } from "./mockCourses";

export function getMockDashboardData(): DashboardData {
  const total = MOCK_LEARNERS.length;
  const completed = MOCK_LEARNERS.filter((l) => l.Completion_Status === "Completed").length;
  const notCompleted = total - completed;
  const completionRate = Math.round((completed / total) * 1000) / 10;

  const highRiskList = MOCK_LEARNERS.filter((l) => l.riskLevel === "High");
  const highRiskCount = highRiskList.length;
  const highRiskPercent = Math.round((highRiskCount / total) * 1000) / 10;

  // Average video completion across cohort
  const avgVideoCompletion =
    Math.round(
      (MOCK_LEARNERS.reduce((sum, l) => sum + l.Video_Completion, 0) / total) * 10
    ) / 10;

  const behaviorComparison: BehaviorComparison[] = [
    {
      feature: "Video_Completion",
      label: "Video Completion",
      completed: VERIFIED_BEHAVIOR_MEANS.completed.Video_Completion,
      notCompleted: VERIFIED_BEHAVIOR_MEANS.notCompleted.Video_Completion,
      difference: VERIFIED_BEHAVIOR_MEANS.difference.Video_Completion,
      unit: "%",
      isStrongest: true,
    },
    {
      feature: "Login_Frequency",
      label: "Login Frequency",
      completed: VERIFIED_BEHAVIOR_MEANS.completed.Login_Frequency,
      notCompleted: VERIFIED_BEHAVIOR_MEANS.notCompleted.Login_Frequency,
      difference: VERIFIED_BEHAVIOR_MEANS.difference.Login_Frequency,
      unit: "per week",
    },
    {
      feature: "Quiz_Attempts",
      label: "Quiz Attempts",
      completed: VERIFIED_BEHAVIOR_MEANS.completed.Quiz_Attempts,
      notCompleted: VERIFIED_BEHAVIOR_MEANS.notCompleted.Quiz_Attempts,
      difference: VERIFIED_BEHAVIOR_MEANS.difference.Quiz_Attempts,
      unit: "attempts",
    },
    {
      feature: "Assignment_Submissions",
      label: "Assignment Submissions",
      completed: VERIFIED_BEHAVIOR_MEANS.completed.Assignment_Submissions,
      notCompleted: VERIFIED_BEHAVIOR_MEANS.notCompleted.Assignment_Submissions,
      difference: VERIFIED_BEHAVIOR_MEANS.difference.Assignment_Submissions,
      unit: "submissions",
    },
    {
      feature: "Discussion_Activity",
      label: "Discussion Activity",
      completed: VERIFIED_BEHAVIOR_MEANS.completed.Discussion_Activity,
      notCompleted: VERIFIED_BEHAVIOR_MEANS.notCompleted.Discussion_Activity,
      difference: VERIFIED_BEHAVIOR_MEANS.difference.Discussion_Activity,
      unit: "posts",
    },
  ];

  // Course completion sorted descending
  const sortedCourses = [...MOCK_COURSES]
    .map((c) => ({
      Course_ID: c.Course_ID,
      courseName: c.courseName,
      completionRate: c.completionRate,
      learnerCount: c.totalLearners,
    }))
    .sort((a, b) => b.completionRate - a.completionRate);

  const overallAvgCompletionRate =
    Math.round(
      (sortedCourses.reduce((acc, c) => acc + c.completionRate, 0) /
        sortedCourses.length) *
        10
    ) / 10;

  // Top 8 highest dropout risk learners
  const topRiskLearners = [...highRiskList]
    .sort((a, b) => b.predictedRisk - a.predictedRisk)
    .slice(0, 8);

  return {
    totalLearners: total,
    completionRate,
    completedCount: completed,
    notCompletedCount: notCompleted,
    highRiskCount,
    highRiskPercent,
    avgVideoCompletion,
    modelAccuracy: VERIFIED_MODEL_METRICS.accuracy,
    completionDistribution: [
      { name: "Completed", value: completed, color: COLOR_PALETTE.completed },
      { name: "Not Completed", value: notCompleted, color: COLOR_PALETTE.notCompleted },
    ],
    behaviorComparison,
    courseCompletion: sortedCourses,
    overallAvgCompletionRate,
    topRiskLearners,
  };
}

export const MOCK_DASHBOARD_DATA = getMockDashboardData();
