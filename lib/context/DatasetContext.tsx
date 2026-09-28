"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import {
  Learner,
  CourseStats,
  ModelMetrics,
  RiskSummary,
  DashboardData,
  UploadResult,
  RiskLevel,
  CompletionStatus,
} from "../types";
import {
  REQUIRED_CSV_COLUMNS,
  RISK_THRESHOLDS,
  VERIFIED_BEHAVIOR_MEANS,
  COLOR_PALETTE,
} from "../constants";
import {
  getDashboard,
  getLearners,
  getCourses,
  getModel,
  getRisk,
  uploadDataset,
  setRuntimeDataset,
} from "../api/services";
import { MOCK_DASHBOARD_DATA } from "../mock/mockDashboard";
import { MOCK_LEARNERS } from "../mock/mockLearners";
import { MOCK_COURSES } from "../mock/mockCourses";
import { MOCK_MODEL_METRICS } from "../mock/mockModel";
import { MOCK_RISK_SUMMARY } from "../mock/mockRisk";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

interface DatasetContextType {
  dashboard: DashboardData;
  learners: Learner[];
  courses: CourseStats[];
  model: ModelMetrics;
  risk: RiskSummary;
  isUsingMockData: boolean;
  isLoading: boolean;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  processCsvFile: (file: File) => Promise<UploadResult>;
  applyParsedDataset: (learners: Learner[]) => void;
  resetToDefaults: () => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardData>(MOCK_DASHBOARD_DATA);
  const [learners, setLearners] = useState<Learner[]>(MOCK_LEARNERS);
  const [courses, setCourses] = useState<CourseStats[]>(MOCK_COURSES);
  const [model, setModel] = useState<ModelMetrics>(MOCK_MODEL_METRICS);
  const [risk, setRisk] = useState<RiskSummary>(MOCK_RISK_SUMMARY);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashRes, learnRes, courseRes, modelRes, riskRes] = await Promise.all([
        getDashboard(),
        getLearners(),
        getCourses(),
        getModel(),
        getRisk(),
      ]);

      setDashboard(dashRes.data);
      setLearners(learnRes.data);
      setCourses(courseRes.data);
      setModel(modelRes.data);
      setRisk(riskRes.data);

      const anyMock =
        dashRes.usingMockData ||
        learnRes.usingMockData ||
        courseRes.usingMockData ||
        modelRes.usingMockData ||
        riskRes.usingMockData;

      setIsUsingMockData(anyMock);
    } catch (err) {
      console.error("Failed to load initial dataset", err);
      setIsUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Client-side dataset recalculation engine
  const applyParsedDataset = useCallback(
    (newLearners: Learner[]) => {
      if (newLearners.length === 0) return;

      const total = newLearners.length;
      const completed = newLearners.filter((l) => l.Completion_Status === "Completed").length;
      const notCompleted = total - completed;
      const completionRate = Math.round((completed / total) * 1000) / 10;

      const highRiskList = newLearners.filter((l) => l.riskLevel === "High");
      const medRiskList = newLearners.filter((l) => l.riskLevel === "Medium");
      const lowRiskList = newLearners.filter((l) => l.riskLevel === "Low");

      const highCount = highRiskList.length;
      const highPercent = Math.round((highCount / total) * 1000) / 10;
      const avgVideo =
        Math.round((newLearners.reduce((acc, l) => acc + l.Video_Completion, 0) / total) * 10) / 10;

      // Group courses
      const courseMap = new Map<string, Learner[]>();
      newLearners.forEach((l) => {
        const list = courseMap.get(l.Course_ID) || [];
        list.push(l);
        courseMap.set(l.Course_ID, list);
      });

      const updatedCourses: CourseStats[] = Array.from(courseMap.entries()).map(([cid, group]) => {
        const cTotal = group.length;
        const cCompleted = group.filter((l) => l.Completion_Status === "Completed").length;
        const cRate = Math.round((cCompleted / cTotal) * 1000) / 10;
        const cHigh = group.filter((l) => l.riskLevel === "High").length;
        const cMed = group.filter((l) => l.riskLevel === "Medium").length;
        const cLow = group.filter((l) => l.riskLevel === "Low").length;

        const avgLogin = Math.round((group.reduce((s, l) => s + l.Login_Frequency, 0) / cTotal) * 10) / 10;
        const avgVid = Math.round((group.reduce((s, l) => s + l.Video_Completion, 0) / cTotal) * 10) / 10;
        const avgQuiz = Math.round((group.reduce((s, l) => s + l.Quiz_Attempts, 0) / cTotal) * 10) / 10;
        const avgAssign = Math.round((group.reduce((s, l) => s + l.Assignment_Submissions, 0) / cTotal) * 10) / 10;
        const avgDisc = Math.round((group.reduce((s, l) => s + l.Discussion_Activity, 0) / cTotal) * 10) / 10;

        const existing = courses.find((c) => c.Course_ID === cid);
        return {
          Course_ID: cid,
          courseName: existing?.courseName || `Course ${cid}`,
          totalLearners: cTotal,
          completedCount: cCompleted,
          completionRate: cRate,
          avgLoginFrequency: avgLogin,
          avgVideoCompletion: avgVid,
          avgQuizAttempts: avgQuiz,
          avgAssignmentSubmissions: avgAssign,
          avgDiscussionActivity: avgDisc,
          highRiskCount: cHigh,
          mediumRiskCount: cMed,
          lowRiskCount: cLow,
        };
      });

      // Update Risk Summary
      const computeRiskStats = (list: Learner[]) => {
        const count = list.length;
        if (count === 0) {
          return {
            count: 0,
            percentage: 0,
            avgLogin: 0,
            avgVideo: 0,
            avgQuiz: 0,
            avgAssignments: 0,
            avgDiscussion: 0,
          };
        }
        return {
          count,
          percentage: Math.round((count / total) * 1000) / 10,
          avgLogin: Math.round((list.reduce((s, l) => s + l.Login_Frequency, 0) / count) * 100) / 100,
          avgVideo: Math.round((list.reduce((s, l) => s + l.Video_Completion, 0) / count) * 100) / 100,
          avgQuiz: Math.round((list.reduce((s, l) => s + l.Quiz_Attempts, 0) / count) * 100) / 100,
          avgAssignments: Math.round((list.reduce((s, l) => s + l.Assignment_Submissions, 0) / count) * 100) / 100,
          avgDiscussion: Math.round((list.reduce((s, l) => s + l.Discussion_Activity, 0) / count) * 100) / 100,
        };
      };

      const updatedRisk: RiskSummary = {
        high: computeRiskStats(highRiskList),
        medium: computeRiskStats(medRiskList),
        low: computeRiskStats(lowRiskList),
        totalLearners: total,
        thresholds: RISK_THRESHOLDS,
      };

      const topRiskLearners = [...highRiskList]
        .sort((a, b) => b.predictedRisk - a.predictedRisk)
        .slice(0, 8);

      const courseCompletion = [...updatedCourses]
        .map((c) => ({
          Course_ID: c.Course_ID,
          courseName: c.courseName,
          completionRate: c.completionRate,
          learnerCount: c.totalLearners,
        }))
        .sort((a, b) => b.completionRate - a.completionRate);

      const overallAvg =
        Math.round(
          (courseCompletion.reduce((s, c) => s + c.completionRate, 0) / courseCompletion.length) * 10
        ) / 10;

      const updatedDashboard: DashboardData = {
        totalLearners: total,
        completionRate,
        completedCount: completed,
        notCompletedCount: notCompleted,
        highRiskCount: highCount,
        highRiskPercent: highPercent,
        avgVideoCompletion: avgVideo,
        modelAccuracy: model.accuracy,
        completionDistribution: [
          { name: "Completed", value: completed, color: COLOR_PALETTE.completed },
          { name: "Not Completed", value: notCompleted, color: COLOR_PALETTE.notCompleted },
        ],
        behaviorComparison: dashboard.behaviorComparison,
        courseCompletion,
        overallAvgCompletionRate: overallAvg,
        topRiskLearners,
      };

      setLearners(newLearners);
      setCourses(updatedCourses);
      setRisk(updatedRisk);
      setDashboard(updatedDashboard);
      setRuntimeDataset(newLearners, updatedDashboard, updatedRisk, updatedCourses);

      addToast({
        type: "success",
        title: "Dataset Analyzed",
        message: `Successfully processed ${total} learners across ${updatedCourses.length} courses.`,
      });
    },
    [courses, model.accuracy, dashboard.behaviorComparison, addToast]
  );

  const resetToDefaults = useCallback(() => {
    setLearners(MOCK_LEARNERS);
    setDashboard(MOCK_DASHBOARD_DATA);
    setCourses(MOCK_COURSES);
    setModel(MOCK_MODEL_METRICS);
    setRisk(MOCK_RISK_SUMMARY);
    setRuntimeDataset(MOCK_LEARNERS, MOCK_DASHBOARD_DATA, MOCK_RISK_SUMMARY, MOCK_COURSES);
    addToast({
      type: "info",
      title: "Reset to Baseline",
      message: "Restored verified benchmark cohort (500 learners).",
    });
  }, [addToast]);

  const processCsvFile = useCallback(
    async (file: File): Promise<UploadResult> => {
      // First try sending to backend if available
      try {
        const remoteRes = await uploadDataset(file);
        if (remoteRes.data.success && !remoteRes.usingMockData) {
          await refreshData();
          return remoteRes.data;
        }
      } catch (err) {
        // Fall back to client parser
      }

      return new Promise<UploadResult>((resolve) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: "greedy",
          complete: (results) => {
            const rawData = results.data as Record<string, string>[];
            const errors: string[] = [];

            if (!rawData || rawData.length === 0) {
              return resolve({
                success: false,
                rowCount: 0,
                missingValues: { total: 0, byColumn: {} },
                duplicateLearners: 0,
                previewRows: [],
                completionStats: { completed: 0, notCompleted: 0, rate: 0 },
                message: "The uploaded file is empty or contains no parseable data rows.",
                errors: ["File contains no valid rows."],
              });
            }

            // Check header columns
            const firstRow = rawData[0];
            const presentCols = Object.keys(firstRow).map((k) => k.trim());
            const missingCols = REQUIRED_CSV_COLUMNS.filter(
              (col) => !presentCols.includes(col)
            );

            if (missingCols.length > 0) {
              return resolve({
                success: false,
                rowCount: rawData.length,
                missingValues: { total: 0, byColumn: {} },
                duplicateLearners: 0,
                previewRows: [],
                completionStats: { completed: 0, notCompleted: 0, rate: 0 },
                message: `Missing required columns: ${missingCols.join(", ")}. Please check your CSV format.`,
                errors: missingCols.map((c) => `Missing column: ${c}`),
              });
            }

            // Validate and parse rows
            const seenIds = new Set<string>();
            let duplicateCount = 0;
            let missingTotal = 0;
            const missingByCol: Record<string, number> = {};
            REQUIRED_CSV_COLUMNS.forEach((c) => (missingByCol[c] = 0));

            let completedCount = 0;
            let notCompletedCount = 0;

            const parsedLearners: Learner[] = [];

            rawData.forEach((row, idx) => {
              const learnerId = (row["Learner_ID"] || "").trim() || `L${1000 + idx}`;
              if (seenIds.has(learnerId)) {
                duplicateCount++;
              } else {
                seenIds.add(learnerId);
              }

              // Check missing values
              REQUIRED_CSV_COLUMNS.forEach((col) => {
                const val = row[col];
                if (val === undefined || val === null || String(val).trim() === "") {
                  missingTotal++;
                  missingByCol[col] = (missingByCol[col] || 0) + 1;
                }
              });

              const courseId = (row["Course_ID"] || "C01").trim();
              const login = parseFloat(row["Login_Frequency"]) || 0;
              const video = Math.min(Math.max(parseFloat(row["Video_Completion"]) || 0, 0), 100);
              const quiz = parseFloat(row["Quiz_Attempts"]) || 0;
              const assign = parseFloat(row["Assignment_Submissions"]) || 0;
              const disc = parseFloat(row["Discussion_Activity"]) || 0;

              const rawStatus = (row["Completion_Status"] || "").trim().toLowerCase();
              const isCompleted =
                rawStatus === "1" ||
                rawStatus === "completed" ||
                rawStatus === "true" ||
                rawStatus === "yes";

              const status: CompletionStatus = isCompleted ? "Completed" : "Not Completed";
              if (isCompleted) {
                completedCount++;
              } else {
                notCompletedCount++;
              }

              // Dropout risk model heuristic mirroring feature weights:
              const normVideo = video / 100;
              const normLogin = Math.min(Math.max(login / 8, 0), 1);
              const normQuiz = Math.min(Math.max(quiz / 5, 0), 1);
              const normAssign = Math.min(Math.max(assign / 4, 0), 1);
              const normDisc = Math.min(Math.max(disc / 5, 0), 1);

              const completionScore =
                0.3805 * normVideo +
                0.178 * normLogin +
                0.1261 * normQuiz +
                0.1197 * normAssign +
                0.1117 * normDisc;

              const completionProb = Math.min(Math.max(Math.round(completionScore * 1000) / 1000, 0.02), 0.98);
              const dropoutRisk = Math.round((1 - completionProb) * 1000) / 1000;

              let riskLevel: RiskLevel;
              if (dropoutRisk > RISK_THRESHOLDS.mediumMax) {
                riskLevel = "High";
              } else if (dropoutRisk >= RISK_THRESHOLDS.lowMax) {
                riskLevel = "Medium";
              } else {
                riskLevel = "Low";
              }

              let recommendedAction = "Maintain self-paced progress & milestone engagement.";
              if (riskLevel === "High") {
                if (video < 35) {
                  recommendedAction = "1-on-1 mentor check-in; provide bite-sized video recaps.";
                } else if (login < 3) {
                  recommendedAction = "Automated SMS/email re-engagement alert with direct module deep link.";
                } else {
                  recommendedAction = "Assignment assistance session & deadline extension offer.";
                }
              } else if (riskLevel === "Medium") {
                recommendedAction = "Prompt low-stakes concept practice quiz with instant explanations.";
              }

              parsedLearners.push({
                Learner_ID: learnerId,
                Course_ID: courseId,
                Login_Frequency: login,
                Video_Completion: video,
                Quiz_Attempts: quiz,
                Assignment_Submissions: assign,
                Discussion_Activity: disc,
                Completion_Status: status,
                predictedRisk: dropoutRisk,
                completionProbability: completionProb,
                riskLevel,
                recommendedAction,
              });
            });

            const totalRows = parsedLearners.length;
            const completionRate =
              totalRows > 0 ? Math.round((completedCount / totalRows) * 1000) / 10 : 0;

            const result: UploadResult = {
              success: true,
              rowCount: totalRows,
              missingValues: {
                total: missingTotal,
                byColumn: missingByCol,
              },
              duplicateLearners: duplicateCount,
              previewRows: parsedLearners.slice(0, 5),
              completionStats: {
                completed: completedCount,
                notCompleted: notCompletedCount,
                rate: completionRate,
              },
            };

            resolve(result);
          },
          error: (err) => {
            resolve({
              success: false,
              rowCount: 0,
              missingValues: { total: 0, byColumn: {} },
              duplicateLearners: 0,
              previewRows: [],
              completionStats: { completed: 0, notCompleted: 0, rate: 0 },
              message: `CSV parsing failed: ${err.message}`,
              errors: [err.message],
            });
          },
        });
      });
    },
    [refreshData]
  );

  return (
    <DatasetContext.Provider
      value={{
        dashboard,
        learners,
        courses,
        model,
        risk,
        isUsingMockData,
        isLoading,
        isUploadModalOpen,
        setIsUploadModalOpen,
        toasts,
        addToast,
        removeToast,
        refreshData,
        processCsvFile,
        applyParsedDataset,
        resetToDefaults,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) {
    throw new Error("useDataset must be used within a DatasetProvider");
  }
  return ctx;
}
