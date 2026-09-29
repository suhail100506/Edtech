from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Learner(BaseModel):
    Learner_ID: str
    Course_ID: str
    Login_Frequency: float
    Video_Completion: float
    Quiz_Attempts: int
    Assignment_Submissions: int
    Discussion_Activity: int
    Completion_Status: str
    predictedRisk: float
    completionProbability: float
    riskLevel: str
    recommendedAction: Optional[str] = None

class CourseStats(BaseModel):
    Course_ID: str
    courseName: str
    totalLearners: int
    completedCount: int
    completionRate: float
    avgLoginFrequency: float
    avgVideoCompletion: float
    avgQuizAttempts: float
    avgAssignmentSubmissions: float
    avgDiscussionActivity: float
    highRiskCount: int
    mediumRiskCount: int
    lowRiskCount: int

class FeatureImportanceItem(BaseModel):
    feature: str
    label: str
    importance: float

class ConfusionMatrixData(BaseModel):
    tp: int
    fp: int
    fn: int
    tn: int
    total: int

class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float
    rocAuc: float
    featureImportance: List[FeatureImportanceItem]
    confusionMatrix: ConfusionMatrixData
    targetVariable: str
    algorithm: str
    testSetSize: int

class RiskCategoryStats(BaseModel):
    count: int
    percentage: float
    avgLogin: float
    avgVideo: float
    avgQuiz: float
    avgAssignments: float
    avgDiscussion: float

class RiskThresholds(BaseModel):
    lowMax: float = 0.33
    mediumMax: float = 0.66

class RiskSummary(BaseModel):
    low: RiskCategoryStats
    medium: RiskCategoryStats
    high: RiskCategoryStats
    totalLearners: int
    thresholds: RiskThresholds = Field(default_factory=RiskThresholds)

class BehaviorComparison(BaseModel):
    feature: str
    label: str
    completed: float
    notCompleted: float
    difference: float
    unit: str
    isStrongest: Optional[bool] = False

class CourseCompletionItem(BaseModel):
    Course_ID: str
    courseName: str
    completionRate: float
    learnerCount: int

class CompletionDistributionItem(BaseModel):
    name: str
    value: int
    color: str

class DashboardData(BaseModel):
    totalLearners: int
    completionRate: float
    completedCount: int
    notCompletedCount: int
    highRiskCount: int
    highRiskPercent: float
    avgVideoCompletion: float
    modelAccuracy: float
    completionDistribution: List[CompletionDistributionItem]
    behaviorComparison: List[BehaviorComparison]
    courseCompletion: List[CourseCompletionItem]
    overallAvgCompletionRate: float
    topRiskLearners: List[Learner]

class PredictRequest(BaseModel):
    Login_Frequency: float
    Video_Completion: float
    Quiz_Attempts: float
    Assignment_Submissions: float
    Discussion_Activity: float

class ContributingFactor(BaseModel):
    feature: str
    label: str
    status: str  # "optimal" | "warning" | "critical"
    comment: str

class PredictResponse(BaseModel):
    completionProbability: float
    dropoutProbability: float
    riskLevel: str
    isEstimatedDemo: bool = False
    contributingFactors: List[ContributingFactor]

class MissingValuesInfo(BaseModel):
    total: int
    byColumn: Dict[str, int]

class CompletionStatsInfo(BaseModel):
    completed: int
    notCompleted: int
    rate: float

class UploadResult(BaseModel):
    success: bool
    rowCount: int
    missingValues: MissingValuesInfo
    duplicateLearners: int
    previewRows: List[Dict[str, Any]]
    completionStats: CompletionStatsInfo
    message: Optional[str] = None
    errors: Optional[List[str]] = None
