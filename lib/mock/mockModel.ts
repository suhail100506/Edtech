import { ModelMetrics } from "../types";
import { VERIFIED_MODEL_METRICS } from "../constants";

/**
 * Verified Model Metrics & Confusion Matrix.
 * For a test set of N = 2,000 learners:
 * - TP = 1066 (True Completers correctly predicted as Completed)
 * - FP = 323  (Predicted Completed, actually Not Completed)
 * - FN = 220  (Predicted Not Completed, actually Completed)
 * - TN = 391  (True Non-Completers correctly predicted as Not Completed)
 *
 * Metrics verification:
 * - Total = 1066 + 323 + 220 + 391 = 2000
 * - Accuracy = (1066 + 391) / 2000 = 1457 / 2000 = 72.85%
 * - Precision = 1066 / (1066 + 323) = 1066 / 1389 = 76.75%
 * - Recall = 1066 / (1066 + 220) = 1066 / 1286 = 82.89%
 * - F1 Score = 2 * (P * R) / (P + R) = 79.70%
 * - ROC-AUC = 77.99%
 */
export const MOCK_MODEL_METRICS: ModelMetrics = {
  algorithm: VERIFIED_MODEL_METRICS.algorithm,
  targetVariable: VERIFIED_MODEL_METRICS.targetVariable,
  accuracy: VERIFIED_MODEL_METRICS.accuracy,
  precision: VERIFIED_MODEL_METRICS.precision,
  recall: VERIFIED_MODEL_METRICS.recall,
  f1: VERIFIED_MODEL_METRICS.f1,
  rocAuc: VERIFIED_MODEL_METRICS.rocAuc,
  testSetSize: VERIFIED_MODEL_METRICS.testSetSize,
  confusionMatrix: {
    tp: 1066,
    fp: 323,
    fn: 220,
    tn: 391,
    total: 2000,
  },
  featureImportance: VERIFIED_MODEL_METRICS.featureImportance,
};
