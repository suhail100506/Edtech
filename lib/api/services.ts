import { apiClient, normalizeError } from "./client";
import {
  Learner,
  CourseStats,
  ModelMetrics,
  RiskSummary,
  DashboardData,
  UploadResult,
  PredictRequest,
  PredictResponse,
  RiskLevel,
} from "../types";
import { RISK_THRESHOLDS } from "../constants";
import { MOCK_DASHBOARD_DATA } from "../mock/mockDashboard";
import { MOCK_LEARNERS } from "../mock/mockLearners";
import { MOCK_COURSES } from "../mock/mockCourses";
import { MOCK_MODEL_METRICS } from "../mock/mockModel";
import { MOCK_RISK_SUMMARY } from "../mock/mockRisk";

export interface ServiceResponse<T> {
  data: T;
  usingMockData: boolean;
  error?: string;
}

// Global in-memory cache to support dataset updates within session
let currentLearners = [...MOCK_LEARNERS];
let currentDashboard = { ...MOCK_DASHBOARD_DATA };
let currentRisk = { ...MOCK_RISK_SUMMARY };
let currentCourses = [...MOCK_COURSES];

export function setRuntimeDataset(
  learners: Learner[],
  dashboard: DashboardData,
  risk: RiskSummary,
  courses: CourseStats[]
) {
  currentLearners = learners;
  currentDashboard = dashboard;
  currentRisk = risk;
  currentCourses = courses;
}

export async function getDashboard(): Promise<ServiceResponse<DashboardData>> {
  try {
    const res = await apiClient.get<DashboardData>("/api/dashboard");
    return { data: res.data, usingMockData: false };
  } catch (err) {
    // Graceful fallback to mock data
    return { data: currentDashboard, usingMockData: true };
  }
}

export async function getLearners(params?: {
  course?: string;
  status?: string;
  risk?: string;
  search?: string;
}): Promise<ServiceResponse<Learner[]>> {
  try {
    const res = await apiClient.get<Learner[]>("/api/learners", { params });
    return { data: res.data, usingMockData: false };
  } catch (err) {
    let filtered = [...currentLearners];

    if (params?.course && params.course !== "all") {
      filtered = filtered.filter((l) => l.Course_ID === params.course);
    }
    if (params?.status && params.status !== "all") {
      filtered = filtered.filter((l) => l.Completion_Status === params.status);
    }
    if (params?.risk && params.risk !== "all") {
      filtered = filtered.filter((l) => l.riskLevel === params.risk);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.Learner_ID.toLowerCase().includes(q) ||
          l.Course_ID.toLowerCase().includes(q)
      );
    }

    return { data: filtered, usingMockData: true };
  }
}

export async function getLearner(
  id: string
): Promise<ServiceResponse<Learner | null>> {
  try {
    const res = await apiClient.get<Learner>(`/api/learners/${id}`);
    return { data: res.data, usingMockData: false };
  } catch (err) {
    const found = currentLearners.find((l) => l.Learner_ID.toLowerCase() === id.toLowerCase()) || null;
    return { data: found, usingMockData: true };
  }
}

export async function getRisk(): Promise<ServiceResponse<RiskSummary>> {
  try {
    const res = await apiClient.get<RiskSummary>("/api/risk");
    return { data: res.data, usingMockData: false };
  } catch (err) {
    return { data: currentRisk, usingMockData: true };
  }
}

export async function getCourses(): Promise<ServiceResponse<CourseStats[]>> {
  try {
    const res = await apiClient.get<CourseStats[]>("/api/courses");
    return { data: res.data, usingMockData: false };
  } catch (err) {
    return { data: currentCourses, usingMockData: true };
  }
}

export async function getModel(): Promise<ServiceResponse<ModelMetrics>> {
  try {
    const res = await apiClient.get<ModelMetrics>("/api/model");
    return { data: res.data, usingMockData: false };
  } catch (err) {
    return { data: MOCK_MODEL_METRICS, usingMockData: true };
  }
}

export async function predict(
  payload: PredictRequest
): Promise<ServiceResponse<PredictResponse>> {
  try {
    const res = await apiClient.post<PredictResponse>("/api/predict", payload);
    return { data: res.data, usingMockData: false };
  } catch (err) {
    // Transparent heuristic mock formula using verified Random Forest feature weights:
    // Video: 38.05%, Login: 17.80%, Quiz: 12.61%, Assignment: 11.97%, Discussion: 11.17%
    const normVideo = Math.min(Math.max(payload.Video_Completion / 100, 0), 1);
    const normLogin = Math.min(Math.max(payload.Login_Frequency / 8, 0), 1);
    const normQuiz = Math.min(Math.max(payload.Quiz_Attempts / 5, 0), 1);
    const normAssign = Math.min(Math.max(payload.Assignment_Submissions / 4, 0), 1);
    const normDisc = Math.min(Math.max(payload.Discussion_Activity / 5, 0), 1);

    const completionScore =
      0.3805 * normVideo +
      0.178 * normLogin +
      0.1261 * normQuiz +
      0.1197 * normAssign +
      0.1117 * normDisc;

    const completionProbability = Math.round(completionScore * 1000) / 1000;
    const dropoutProbability = Math.round((1 - completionProbability) * 1000) / 1000;

    let riskLevel: RiskLevel;
    if (dropoutProbability > RISK_THRESHOLDS.mediumMax) {
      riskLevel = "High";
    } else if (dropoutProbability >= RISK_THRESHOLDS.lowMax) {
      riskLevel = "Medium";
    } else {
      riskLevel = "Low";
    }

    const contributingFactors = [
      {
        feature: "Video_Completion",
        label: "Video Completion",
        status:
          payload.Video_Completion < 45
            ? ("critical" as const)
            : payload.Video_Completion < 70
            ? ("warning" as const)
            : ("optimal" as const),
        comment:
          payload.Video_Completion < 45
            ? "Significantly below the 82.1% completer benchmark"
            : payload.Video_Completion < 70
            ? "Moderate watch rate; room for improvement"
            : "Strong completion alignment with completer cohort",
      },
      {
        feature: "Login_Frequency",
        label: "Login Frequency",
        status:
          payload.Login_Frequency < 3
            ? ("critical" as const)
            : payload.Login_Frequency < 5
            ? ("warning" as const)
            : ("optimal" as const),
        comment:
          payload.Login_Frequency < 3
            ? "At-risk cadence; completers average ~6 logins/week"
            : payload.Login_Frequency < 5
            ? "Acceptable weekly rhythm"
            : "High consistency supporting habit formation",
      },
      {
        feature: "Quiz_Attempts",
        label: "Quiz Attempts",
        status:
          payload.Quiz_Attempts < 2
            ? ("warning" as const)
            : ("optimal" as const),
        comment:
          payload.Quiz_Attempts < 2
            ? "Low formative test participation"
            : "Active knowledge verification",
      },
      {
        feature: "Assignment_Submissions",
        label: "Assignment Submissions",
        status:
          payload.Assignment_Submissions < 2
            ? ("critical" as const)
            : ("optimal" as const),
        comment:
          payload.Assignment_Submissions < 2
            ? "Missed graded projects increase dropout vulnerability"
            : "Solid coursework delivery",
      },
      {
        feature: "Discussion_Activity",
        label: "Discussion Activity",
        status:
          payload.Discussion_Activity < 1
            ? ("warning" as const)
            : ("optimal" as const),
        comment:
          payload.Discussion_Activity < 1
            ? "Peer community isolation observed"
            : "Healthy collaborative exchange",
      },
    ];

    const result: PredictResponse = {
      completionProbability,
      dropoutProbability,
      riskLevel,
      isEstimatedDemo: true,
      contributingFactors,
    };

    return { data: result, usingMockData: true };
  }
}

export async function uploadDataset(
  file: File
): Promise<ServiceResponse<UploadResult>> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<UploadResult>("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return { data: res.data, usingMockData: false };
  } catch (err) {
    const errorInfo = normalizeError(err);
    return {
      data: {
        success: false,
        rowCount: 0,
        missingValues: { total: 0, byColumn: {} },
        duplicateLearners: 0,
        previewRows: [],
        completionStats: { completed: 0, notCompleted: 0, rate: 0 },
        message: "API endpoint unavailable. Client fallback will process dataset locally.",
        errors: [errorInfo.message],
      },
      usingMockData: true,
      error: errorInfo.message,
    };
  }
}
