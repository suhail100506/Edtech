import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "model"

MAIN_DATASET_PATH = DATA_DIR / "learner_activity_edtech_10000.csv"
PREDICTIONS_DATASET_PATH = DATA_DIR / "learner_dropout_risk_predictions.csv"
MODEL_PATH = MODEL_DIR / "edtech_random_forest_model.pkl"

COURSE_NAMES = {
    "C01": "Data Science & Python Foundations",
    "C02": "Full-Stack Web Development Bootcamp",
    "C03": "Machine Learning & Applied AI",
    "C04": "Cloud Architecture & DevOps",
    "C05": "UI/UX Design Systems & Research",
    "C06": "Mobile Engineering with React Native",
    "C07": "Cybersecurity & Threat Modeling",
    "C08": "Product Management & Agile Sprints",
    "C09": "Business Analytics & BI Dashboards",
    "C10": "Algorithms & Distributed Systems",
}

FEATURE_LABELS = {
    "Video_Completion": "Video Completion",
    "Login_Frequency": "Login Frequency",
    "Quiz_Attempts": "Quiz Attempts",
    "Assignment_Submissions": "Assignment Submissions",
    "Discussion_Activity": "Discussion Activity",
}

FEATURE_UNITS = {
    "Video_Completion": "%",
    "Login_Frequency": "logins/wk",
    "Quiz_Attempts": "attempts",
    "Assignment_Submissions": "submissions",
    "Discussion_Activity": "posts",
}

RISK_THRESHOLDS = {
    "lowMax": 0.33,
    "mediumMax": 0.66,
}
