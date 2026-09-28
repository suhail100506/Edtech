import { RiskSummary } from "../types";
import { RISK_THRESHOLDS, VERIFIED_RISK_MEANS } from "../constants";
import { MOCK_LEARNERS } from "./mockLearners";

export function getMockRiskSummary(): RiskSummary {
  const highLearners = MOCK_LEARNERS.filter((l) => l.riskLevel === "High");
  const mediumLearners = MOCK_LEARNERS.filter((l) => l.riskLevel === "Medium");
  const lowLearners = MOCK_LEARNERS.filter((l) => l.riskLevel === "Low");
  const total = MOCK_LEARNERS.length;

  return {
    high: {
      count: highLearners.length,
      percentage: Math.round((highLearners.length / total) * 1000) / 10,
      avgLogin: VERIFIED_RISK_MEANS.high.Login_Frequency,
      avgVideo: VERIFIED_RISK_MEANS.high.Video_Completion,
      avgQuiz: VERIFIED_RISK_MEANS.high.Quiz_Attempts,
      avgAssignments: VERIFIED_RISK_MEANS.high.Assignment_Submissions,
      avgDiscussion: VERIFIED_RISK_MEANS.high.Discussion_Activity,
    },
    medium: {
      count: mediumLearners.length,
      percentage: Math.round((mediumLearners.length / total) * 1000) / 10,
      avgLogin: VERIFIED_RISK_MEANS.medium.Login_Frequency,
      avgVideo: VERIFIED_RISK_MEANS.medium.Video_Completion,
      avgQuiz: VERIFIED_RISK_MEANS.medium.Quiz_Attempts,
      avgAssignments: VERIFIED_RISK_MEANS.medium.Assignment_Submissions,
      avgDiscussion: VERIFIED_RISK_MEANS.medium.Discussion_Activity,
    },
    low: {
      count: lowLearners.length,
      percentage: Math.round((lowLearners.length / total) * 1000) / 10,
      avgLogin: VERIFIED_RISK_MEANS.low.Login_Frequency,
      avgVideo: VERIFIED_RISK_MEANS.low.Video_Completion,
      avgQuiz: VERIFIED_RISK_MEANS.low.Quiz_Attempts,
      avgAssignments: VERIFIED_RISK_MEANS.low.Assignment_Submissions,
      avgDiscussion: VERIFIED_RISK_MEANS.low.Discussion_Activity,
    },
    totalLearners: total,
    thresholds: RISK_THRESHOLDS,
  };
}

export const MOCK_RISK_SUMMARY = getMockRiskSummary();
