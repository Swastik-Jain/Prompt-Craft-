from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ── Evaluation schemas ─────────────────────────────────────────────────────────

class EvaluationCreate(BaseModel):
    relevance_score: float = Field(..., ge=1.0, le=5.0)
    completeness_score: float = Field(..., ge=1.0, le=5.0)
    format_score: float = Field(..., ge=1.0, le=5.0)
    overall_score: float = Field(..., ge=1.0, le=5.0)
    evaluator: str = "auto"
    feedback: Optional[str] = None


class EvaluationRead(EvaluationCreate):
    id: int
    response_run_id: int

    model_config = {"from_attributes": True}


# ── ResponseRun schemas ────────────────────────────────────────────────────────

class ResponseRunCreate(BaseModel):
    variant: str
    response_text: str
    latency_ms: float
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    generation_settings_json: Optional[Dict[str, Any]] = None


class ResponseRunRead(ResponseRunCreate):
    id: int
    experiment_id: int
    evaluations: List[EvaluationRead] = []

    model_config = {"from_attributes": True}


# ── Experiment schemas ─────────────────────────────────────────────────────────

class ExperimentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    original_prompt: str = Field(..., min_length=1)
    strategy: str = Field(default="zero_shot")
    context: Optional[Dict[str, Any]] = None
    model_name: str = Field(default="gemini-1.5-flash")


class ExperimentRead(ExperimentCreate):
    id: int
    optimized_prompt: Optional[str] = None
    created_at: datetime
    response_runs: List[ResponseRunRead] = []

    model_config = {"from_attributes": True}


# ── Compare schemas ────────────────────────────────────────────────────────────

class CompareRequest(BaseModel):
    experiment_id: int
    model_name: Optional[str] = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)


class CompareResponse(BaseModel):
    experiment_id: int
    original_run: ResponseRunRead
    optimized_run: ResponseRunRead
