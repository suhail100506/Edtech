import io
import math
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
import joblib

from backend.config import (
    MAIN_DATASET_PATH,
    MODEL_PATH,
    COURSE_NAMES,
    FEATURE_LABELS,
    FEATURE_UNITS,
    RISK_THRESHOLDS,
)
from backend.schemas import (
    Learner,
    CourseStats,
    ModelMetrics,
    RiskSummary,
    RiskCategoryStats,
    RiskThresholds,
    DashboardData,
    BehaviorComparison,
    CourseCompletionItem,
    CompletionDistributionItem,
    PredictRequest,
    PredictResponse,
    ContributingFactor,
    UploadResult,
    MissingValuesInfo,
    CompletionStatsInfo,
    FeatureImportanceItem,
    ConfusionMatrixData,
)

FEATURE_COLUMNS = [
    "Login_Frequency",
    "Video_Completion",
    "Quiz_Attempts",
    "Assignment_Submissions",
    "Discussion_Activity",
]

class DataService:
    _instance: Optional["DataService"] = None

    def __init__(self):
        self.model = None
        self.df_learners: pd.DataFrame = pd.DataFrame()
        self.dashboard_cache: Optional[DashboardData] = None
        self.courses_cache: Optional[List[CourseStats]] = None
        self.risk_cache: Optional[RiskSummary] = None
        self.model_cache: Optional[ModelMetrics] = None
        self.load_model_and_data()

    @classmethod
    def get_instance(cls) -> "DataService":
        if cls._instance is None:
            cls._instance = DataService()
        return cls._instance

    def load_model_and_data(self):
        # 1. Load trained Random Forest model
        if MODEL_PATH.exists():
            self.model = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError(f"Trained model not found at {MODEL_PATH}")

        # 2. Load primary learner activity dataset
        if MAIN_DATASET_PATH.exists():
            df = pd.read_csv(MAIN_DATASET_PATH)
            self._process_and_store_dataset(df)
        else:
            raise FileNotFoundError(f"Primary dataset not found at {MAIN_DATASET_PATH}")

    def _process_and_store_dataset(self, df: pd.DataFrame):
        # Clean dataframe
        df = df.copy()
        for col in FEATURE_COLUMNS:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        # Predict probability using Random Forest model
        features_data = df[FEATURE_COLUMNS]
        probs = self.model.predict_proba(features_data)[:, 1]

        df["completionProbability"] = np.round(probs, 4)
        df["predictedRisk"] = np.round(1.0 - probs, 4)

        # Risk level categorization
        conditions = [
            df["predictedRisk"] > RISK_THRESHOLDS["mediumMax"],
            df["predictedRisk"] >= RISK_THRESHOLDS["lowMax"],
        ]
        choices = ["High", "Medium"]
        df["riskLevel"] = np.select(conditions, choices, default="Low")

        # Recommended action assignment
        action_conditions = [
            df["riskLevel"] == "High",
            df["riskLevel"] == "Medium",
        ]
        action_choices = [
            "Urgent: Assign mentor check-in & personalized catch-up schedule.",
            "Proactive: Send mid-week quiz reminder & offer peer study group.",
        ]
        df["recommendedAction"] = np.select(
            action_conditions, action_choices, default="Progressing well: Award milestone badge & encourage peer tutoring."
        )

        self.df_learners = df

        columns_to_export = [
            "Learner_ID", "Course_ID", "Login_Frequency", "Video_Completion",
            "Quiz_Attempts", "Assignment_Submissions", "Discussion_Activity",
            "Completion_Status", "predictedRisk", "completionProbability",
            "riskLevel", "recommendedAction"
        ]
        self.cached_learners_dicts = self.df_learners[columns_to_export].to_dict(orient="records")
        import json
        self.cached_learners_json = json.dumps(self.cached_learners_dicts)

        # Invalidate caches so they recompute on next access
        self.dashboard_cache = None
        self.courses_cache = None
        self.risk_cache = None
        self.model_cache = None

    def get_dashboard(self) -> DashboardData:
        if self.dashboard_cache is not None:
            return self.dashboard_cache

        df = self.df_learners
        total_learners = len(df)
        completed_count = int((df["Completion_Status"] == "Completed").sum())
        not_completed_count = total_learners - completed_count
        completion_rate = round((completed_count / total_learners) * 100, 2) if total_learners > 0 else 0.0

        high_risk_count = int((df["riskLevel"] == "High").sum())
        high_risk_percent = round((high_risk_count / total_learners) * 100, 2) if total_learners > 0 else 0.0
        avg_video_completion = round(float(df["Video_Completion"].mean()), 2) if total_learners > 0 else 0.0

        completion_distribution = [
            CompletionDistributionItem(name="Completed", value=completed_count, color="#16A34A"),
            CompletionDistributionItem(name="Not Completed", value=not_completed_count, color="#EF4444"),
        ]

        # Behavior comparison (Completed vs Not Completed)
        df_comp = df[df["Completion_Status"] == "Completed"]
        df_not = df[df["Completion_Status"] == "Not Completed"]

        behavior_comparison = []
        for feat in FEATURE_COLUMNS:
            comp_mean = round(float(df_comp[feat].mean()), 2) if len(df_comp) > 0 else 0.0
            not_mean = round(float(df_not[feat].mean()), 2) if len(df_not) > 0 else 0.0
            diff = round(comp_mean - not_mean, 2)
            behavior_comparison.append(
                BehaviorComparison(
                    feature=feat,
                    label=FEATURE_LABELS.get(feat, feat),
                    completed=comp_mean,
                    notCompleted=not_mean,
                    difference=diff,
                    unit=FEATURE_UNITS.get(feat, ""),
                    isStrongest=(feat == "Video_Completion"),
                )
            )

        # Course completion stats
        course_completion = []
        for course_id, group in df.groupby("Course_ID"):
            c_total = len(group)
            c_comp = int((group["Completion_Status"] == "Completed").sum())
            c_rate = round((c_comp / c_total) * 100, 1) if c_total > 0 else 0.0
            course_completion.append(
                CourseCompletionItem(
                    Course_ID=course_id,
                    courseName=COURSE_NAMES.get(course_id, f"Course {course_id}"),
                    completionRate=c_rate,
                    learnerCount=c_total,
                )
            )
        course_completion.sort(key=lambda x: x.Course_ID)

        overall_avg_completion_rate = (
            round(sum(c.completionRate for c in course_completion) / len(course_completion), 1)
            if course_completion
            else completion_rate
        )

        # Top highest risk learners
        top_risk_df = df.sort_values(by="predictedRisk", ascending=False).head(8)
        top_risk_learners = [
            Learner(
                Learner_ID=row["Learner_ID"],
                Course_ID=row["Course_ID"],
                Login_Frequency=float(row["Login_Frequency"]),
                Video_Completion=float(row["Video_Completion"]),
                Quiz_Attempts=int(row["Quiz_Attempts"]),
                Assignment_Submissions=int(row["Assignment_Submissions"]),
                Discussion_Activity=int(row["Discussion_Activity"]),
                Completion_Status=str(row["Completion_Status"]),
                predictedRisk=float(row["predictedRisk"]),
                completionProbability=float(row["completionProbability"]),
                riskLevel=str(row["riskLevel"]),
                recommendedAction=str(row["recommendedAction"]),
            )
            for _, row in top_risk_df.iterrows()
        ]

        self.dashboard_cache = DashboardData(
            totalLearners=total_learners,
            completionRate=completion_rate,
            completedCount=completed_count,
            notCompletedCount=not_completed_count,
            highRiskCount=high_risk_count,
            highRiskPercent=high_risk_percent,
            avgVideoCompletion=avg_video_completion,
            modelAccuracy=72.85,
            completionDistribution=completion_distribution,
            behaviorComparison=behavior_comparison,
            courseCompletion=course_completion,
            overallAvgCompletionRate=overall_avg_completion_rate,
            topRiskLearners=top_risk_learners,
        )
        return self.dashboard_cache

    def get_learners(
        self,
        course: Optional[str] = None,
        status: Optional[str] = None,
        risk: Optional[str] = None,
        search: Optional[str] = None,
        limit: Optional[int] = None,
        offset: int = 0,
    ) -> List[Learner]:
        df = self.df_learners

        if course and course.lower() != "all":
            df = df[df["Course_ID"] == course]

        if status and status.lower() != "all":
            df = df[df["Completion_Status"] == status]

        if risk and risk.lower() != "all":
            df = df[df["riskLevel"] == risk]

        if search and search.strip():
            q = search.strip().lower()
            df = df[
                df["Learner_ID"].str.lower().str.contains(q)
                | df["Course_ID"].str.lower().str.contains(q)
            ]

        if not course and not status and not risk and not search and limit is None and offset == 0:
            return self.cached_learners_dicts

        columns_to_export = [
            "Learner_ID", "Course_ID", "Login_Frequency", "Video_Completion",
            "Quiz_Attempts", "Assignment_Submissions", "Discussion_Activity",
            "Completion_Status", "predictedRisk", "completionProbability",
            "riskLevel", "recommendedAction"
        ]

        if limit is not None:
            df = df.iloc[offset : offset + limit]
        elif offset > 0:
            df = df.iloc[offset:]

        return df[columns_to_export].to_dict(orient="records")

    def get_learner_by_id(self, learner_id: str) -> Optional[Learner]:
        df = self.df_learners
        matches = df[df["Learner_ID"].str.lower() == learner_id.lower().strip()]
        if matches.empty:
            return None
        row = matches.iloc[0]
        return Learner(
            Learner_ID=row["Learner_ID"],
            Course_ID=row["Course_ID"],
            Login_Frequency=float(row["Login_Frequency"]),
            Video_Completion=float(row["Video_Completion"]),
            Quiz_Attempts=int(row["Quiz_Attempts"]),
            Assignment_Submissions=int(row["Assignment_Submissions"]),
            Discussion_Activity=int(row["Discussion_Activity"]),
            Completion_Status=str(row["Completion_Status"]),
            predictedRisk=float(row["predictedRisk"]),
            completionProbability=float(row["completionProbability"]),
            riskLevel=str(row["riskLevel"]),
            recommendedAction=str(row["recommendedAction"]),
        )

    def get_courses(self) -> List[CourseStats]:
        if self.courses_cache is not None:
            return self.courses_cache

        df = self.df_learners
        courses: List[CourseStats] = []

        for course_id, group in df.groupby("Course_ID"):
            total = len(group)
            completed = int((group["Completion_Status"] == "Completed").sum())
            comp_rate = round((completed / total) * 100, 1) if total > 0 else 0.0

            high_risk = int((group["riskLevel"] == "High").sum())
            med_risk = int((group["riskLevel"] == "Medium").sum())
            low_risk = int((group["riskLevel"] == "Low").sum())

            courses.append(
                CourseStats(
                    Course_ID=course_id,
                    courseName=COURSE_NAMES.get(course_id, f"Course {course_id}"),
                    totalLearners=total,
                    completedCount=completed,
                    completionRate=comp_rate,
                    avgLoginFrequency=round(float(group["Login_Frequency"].mean()), 1),
                    avgVideoCompletion=round(float(group["Video_Completion"].mean()), 1),
                    avgQuizAttempts=round(float(group["Quiz_Attempts"].mean()), 1),
                    avgAssignmentSubmissions=round(float(group["Assignment_Submissions"].mean()), 1),
                    avgDiscussionActivity=round(float(group["Discussion_Activity"].mean()), 1),
                    highRiskCount=high_risk,
                    mediumRiskCount=med_risk,
                    lowRiskCount=low_risk,
                )
            )

        courses.sort(key=lambda c: c.Course_ID)
        self.courses_cache = courses
        return self.courses_cache

    def get_risk(self) -> RiskSummary:
        if self.risk_cache is not None:
            return self.risk_cache

        df = self.df_learners
        total = len(df)

        def compute_tier(risk_label: str) -> RiskCategoryStats:
            group = df[df["riskLevel"] == risk_label]
            count = len(group)
            pct = round((count / total) * 100, 1) if total > 0 else 0.0
            if count == 0:
                return RiskCategoryStats(
                    count=0,
                    percentage=0.0,
                    avgLogin=0.0,
                    avgVideo=0.0,
                    avgQuiz=0.0,
                    avgAssignments=0.0,
                    avgDiscussion=0.0,
                )
            return RiskCategoryStats(
                count=count,
                percentage=pct,
                avgLogin=round(float(group["Login_Frequency"].mean()), 2),
                avgVideo=round(float(group["Video_Completion"].mean()), 2),
                avgQuiz=round(float(group["Quiz_Attempts"].mean()), 2),
                avgAssignments=round(float(group["Assignment_Submissions"].mean()), 2),
                avgDiscussion=round(float(group["Discussion_Activity"].mean()), 2),
            )

        self.risk_cache = RiskSummary(
            low=compute_tier("Low"),
            medium=compute_tier("Medium"),
            high=compute_tier("High"),
            totalLearners=total,
            thresholds=RiskThresholds(
                lowMax=RISK_THRESHOLDS["lowMax"],
                mediumMax=RISK_THRESHOLDS["mediumMax"],
            ),
        )
        return self.risk_cache

    def get_model(self) -> ModelMetrics:
        if self.model_cache is not None:
            return self.model_cache

        # Verified test set metrics from learner_dropout_risk_predictions.csv & Random Forest
        # Accuracy: 72.85%, Precision: 76.75%, Recall: 82.89%, F1: 79.70%, ROC-AUC: 77.99%
        feature_importance = [
            FeatureImportanceItem(feature="Video_Completion", label="Video Completion", importance=38.05),
            FeatureImportanceItem(feature="Login_Frequency", label="Login Frequency", importance=17.80),
            FeatureImportanceItem(feature="Quiz_Attempts", label="Quiz Attempts", importance=12.61),
            FeatureImportanceItem(feature="Assignment_Submissions", label="Assignment Submissions", importance=11.97),
            FeatureImportanceItem(feature="Discussion_Activity", label="Discussion Activity", importance=11.17),
        ]

        confusion_matrix = ConfusionMatrixData(
            tp=1066,
            fp=323,
            fn=220,
            tn=391,
            total=2000,
        )

        self.model_cache = ModelMetrics(
            accuracy=72.85,
            precision=76.75,
            recall=82.89,
            f1=79.70,
            rocAuc=77.99,
            featureImportance=feature_importance,
            confusionMatrix=confusion_matrix,
            targetVariable="Completion_Status (Binary)",
            algorithm="Random Forest Classifier",
            testSetSize=2000,
        )
        return self.model_cache

    def predict(self, req: PredictRequest) -> PredictResponse:
        input_df = pd.DataFrame(
            [[
                req.Login_Frequency,
                req.Video_Completion,
                req.Quiz_Attempts,
                req.Assignment_Submissions,
                req.Discussion_Activity,
            ]],
            columns=FEATURE_COLUMNS,
        )
        prob_completed = float(self.model.predict_proba(input_df)[0, 1])
        completion_prob = round(prob_completed, 4)
        dropout_prob = round(1.0 - completion_prob, 4)

        if dropout_prob > RISK_THRESHOLDS["mediumMax"]:
            risk_level = "High"
        elif dropout_prob >= RISK_THRESHOLDS["lowMax"]:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Diagnostic contributing factors
        factors = [
            ContributingFactor(
                feature="Video_Completion",
                label="Video Completion",
                status="critical" if req.Video_Completion < 45 else ("warning" if req.Video_Completion < 70 else "optimal"),
                comment=(
                    "Significantly below the 82.1% completer benchmark"
                    if req.Video_Completion < 45
                    else ("Moderate watch rate; room for improvement" if req.Video_Completion < 70 else "Strong completion alignment with completer cohort")
                ),
            ),
            ContributingFactor(
                feature="Login_Frequency",
                label="Login Frequency",
                status="critical" if req.Login_Frequency < 3 else ("warning" if req.Login_Frequency < 5 else "optimal"),
                comment=(
                    "At-risk cadence; completers average ~6 logins/week"
                    if req.Login_Frequency < 3
                    else ("Acceptable weekly rhythm" if req.Login_Frequency < 5 else "High consistency supporting habit formation")
                ),
            ),
            ContributingFactor(
                feature="Quiz_Attempts",
                label="Quiz Attempts",
                status="warning" if req.Quiz_Attempts < 2 else "optimal",
                comment="Low formative test participation" if req.Quiz_Attempts < 2 else "Active knowledge verification",
            ),
            ContributingFactor(
                feature="Assignment_Submissions",
                label="Assignment Submissions",
                status="critical" if req.Assignment_Submissions < 2 else "optimal",
                comment="Missed graded projects increase dropout vulnerability" if req.Assignment_Submissions < 2 else "Solid coursework delivery",
            ),
            ContributingFactor(
                feature="Discussion_Activity",
                label="Discussion Activity",
                status="warning" if req.Discussion_Activity < 1 else "optimal",
                comment="Peer community isolation observed" if req.Discussion_Activity < 1 else "Healthy collaborative exchange",
            ),
        ]

        return PredictResponse(
            completionProbability=completion_prob,
            dropoutProbability=dropout_prob,
            riskLevel=risk_level,
            isEstimatedDemo=False,  # Live Random Forest Model inference
            contributingFactors=factors,
        )

    def upload_dataset(self, file_bytes: bytes) -> UploadResult:
        try:
            df = pd.read_csv(io.BytesIO(file_bytes))
        except Exception as e:
            return UploadResult(
                success=False,
                rowCount=0,
                missingValues=MissingValuesInfo(total=0, byColumn={}),
                duplicateLearners=0,
                previewRows=[],
                completionStats=CompletionStatsInfo(completed=0, notCompleted=0, rate=0.0),
                message="Failed to parse CSV file.",
                errors=[str(e)],
            )

        # Check required columns
        required_cols = [
            "Learner_ID",
            "Course_ID",
            "Login_Frequency",
            "Video_Completion",
            "Quiz_Attempts",
            "Assignment_Submissions",
            "Discussion_Activity",
            "Completion_Status",
        ]
        missing_cols = [c for c in required_cols if c not in df.columns]
        if missing_cols:
            return UploadResult(
                success=False,
                rowCount=len(df),
                missingValues=MissingValuesInfo(total=0, byColumn={}),
                duplicateLearners=0,
                previewRows=[],
                completionStats=CompletionStatsInfo(completed=0, notCompleted=0, rate=0.0),
                message=f"Missing required columns: {', '.join(missing_cols)}",
                errors=[f"Required columns missing: {missing_cols}"],
            )

        row_count = len(df)
        missing_by_col = {col: int(df[col].isna().sum()) for col in df.columns}
        total_missing = sum(missing_by_col.values())
        dup_learners = int(df["Learner_ID"].duplicated().sum())

        # Process and update active dataset in memory
        self._process_and_store_dataset(df)

        completed_count = int((self.df_learners["Completion_Status"] == "Completed").sum())
        not_completed_count = row_count - completed_count
        rate = round((completed_count / row_count) * 100, 2) if row_count > 0 else 0.0

        preview_rows = self.df_learners.head(5).to_dict(orient="records")

        return UploadResult(
            success=True,
            rowCount=row_count,
            missingValues=MissingValuesInfo(total=total_missing, byColumn=missing_by_col),
            duplicateLearners=dup_learners,
            previewRows=preview_rows,
            completionStats=CompletionStatsInfo(
                completed=completed_count,
                notCompleted=not_completed_count,
                rate=rate,
            ),
            message="Dataset uploaded, validated, and processed with Random Forest model successfully.",
        )
