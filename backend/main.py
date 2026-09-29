import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.schemas import (
    Learner,
    CourseStats,
    ModelMetrics,
    RiskSummary,
    DashboardData,
    PredictRequest,
    PredictResponse,
    UploadResult,
)
from backend.services.data_service import DataService

app = FastAPI(
    title="EduInsight AI API",
    description="High-performance backend for learner activity analytics and Random Forest dropout risk prediction.",
    version="1.0.0",
)

# Enable CORS for Next.js frontend running on 3000 or 3001
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data_service = DataService.get_instance()

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "EduInsight AI Backend",
        "version": "1.0.0",
        "endpoints": [
            "/api/dashboard",
            "/api/learners",
            "/api/learners/{learner_id}",
            "/api/courses",
            "/api/risk",
            "/api/model",
            "/api/predict",
            "/api/upload",
        ],
    }

@app.get("/api/dashboard", response_model=DashboardData)
def get_dashboard():
    try:
        return data_service.get_dashboard()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learners")
def get_learners(
    course: Optional[str] = Query(None, description="Course ID to filter by (e.g., C01)"),
    status: Optional[str] = Query(None, description="Completion status (Completed / Not Completed)"),
    risk: Optional[str] = Query(None, description="Risk level (Low / Medium / High)"),
    search: Optional[str] = Query(None, description="Search query by Learner_ID or Course_ID"),
    limit: Optional[int] = Query(None, description="Max rows to return"),
    offset: int = Query(0, description="Offset for pagination"),
):
    if not course and not status and not risk and not search and limit is None and offset == 0:
        return Response(content=data_service.cached_learners_json, media_type="application/json")
    try:
        return data_service.get_learners(
            course=course,
            status=status,
            risk=risk,
            search=search,
            limit=limit,
            offset=offset,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learners/{learner_id}", response_model=Learner)
def get_learner(learner_id: str):
    learner = data_service.get_learner_by_id(learner_id)
    if not learner:
        raise HTTPException(status_code=404, detail=f"Learner '{learner_id}' not found.")
    return learner

@app.get("/api/courses", response_model=List[CourseStats])
def get_courses():
    try:
        return data_service.get_courses()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/risk", response_model=RiskSummary)
def get_risk():
    try:
        return data_service.get_risk()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model", response_model=ModelMetrics)
def get_model():
    try:
        return data_service.get_model()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        return data_service.predict(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload", response_model=UploadResult)
async def upload_dataset(file: UploadFile = File(...)):
    try:
        content = await file.read()
        return data_service.upload_dataset(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process upload: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
