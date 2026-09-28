export type CompletionStatus = "Completed" | "Not Completed";
export type RiskLevel = "Low" | "Medium" | "High";

export interface Learner {
  Learner_ID: string;
  Course_ID: string;
  Login_Frequency: number;
  Video_Completion: number;
  Quiz_Attempts: number;
  Assignment_Submissions: number;
  Discussion_Activity: number;
  Completion_Status: CompletionStatus;
  predictedRisk: number; // 0.0 to 1.0 (dropout probability)
  completionProbability: number; // 0.0 to 1.0
  riskLevel: RiskLevel;
  recommendedAction?: string;
}

export interface CourseStats {
  Course_ID: string;
  courseName: string;
  totalLearners: number;
  completedCount: number;
  completionRate: number;
  avgLoginFrequency: number;
  avgVideoCompletion: number;
  avgQuizAttempts: number;
  avgAssignmentSubmissions: number;
  avgDiscussionActivity: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export interface FeatureImportanceItem {
  feature: string;
  label: string;
  importance: number; // percentage, e.g. 38.05
}

export interface ConfusionMatrixData {
  tp: number; // True Positive (Completed correctly predicted)
  fp: number; // False Positive (Predicted completed, actually not completed)
  fn: number; // False Negative (Predicted not completed, actually completed)
  tn: number; // True Negative (Not completed correctly predicted)
  total: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  featureImportance: FeatureImportanceItem[];
  confusionMatrix: ConfusionMatrixData;
  targetVariable: string;
  algorithm: string;
  testSetSize: number;
}

export interface RiskCategoryStats {
  count: number;
  percentage: number;
  avgLogin: number;
  avgVideo: number;
  avgQuiz: number;
  avgAssignments: number;
  avgDiscussion: number;
}

export interface RiskSummary {
  low: RiskCategoryStats;
  medium: RiskCategoryStats;
  high: RiskCategoryStats;
  totalLearners: number;
  thresholds: {
    lowMax: number;
    mediumMax: number;
  };
}

export interface BehaviorComparison {
  feature: string;
  label: string;
  completed: number;
  notCompleted: number;
  difference: number;
  unit: string;
  isStrongest?: boolean;
}

export interface DashboardData {
  totalLearners: number;
  completionRate: number;
  completedCount: number;
  notCompletedCount: number;
  highRiskCount: number;
  highRiskPercent: number;
  avgVideoCompletion: number;
  modelAccuracy: number;
  completionDistribution: Array<{ name: string; value: number; color: string }>;
  behaviorComparison: BehaviorComparison[];
  courseCompletion: Array<{
    Course_ID: string;
    courseName: string;
    completionRate: number;
    learnerCount: number;
  }>;
  overallAvgCompletionRate: number;
  topRiskLearners: Learner[];
}

export interface UploadResult {
  success: boolean;
  rowCount: number;
  missingValues: {
    total: number;
    byColumn: Record<string, number>;
  };
  duplicateLearners: number;
  previewRows: Partial<Learner>[];
  completionStats: {
    completed: number;
    notCompleted: number;
    rate: number;
  };
  message?: string;
  errors?: string[];
}

export interface PredictRequest {
  Login_Frequency: number;
  Video_Completion: number;
  Quiz_Attempts: number;
  Assignment_Submissions: number;
  Discussion_Activity: number;
}

export interface PredictResponse {
  completionProbability: number;
  dropoutProbability: number;
  riskLevel: RiskLevel;
  isEstimatedDemo: boolean;
  contributingFactors: Array<{
    feature: string;
    label: string;
    status: "optimal" | "warning" | "critical";
    comment: string;
  }>;
}
