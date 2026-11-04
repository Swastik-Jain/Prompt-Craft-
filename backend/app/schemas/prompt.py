from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class ContextConfig(BaseModel):
    role: Optional[str] = None
    audience: Optional[str] = None
    goal: Optional[str] = None
    constraints: List[str] = Field(default_factory=list)
    output_format: Optional[str] = None
    reference_text: Optional[str] = None


class PromptOptimizeRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="The raw prompt to optimize")
    strategy: str = Field(
        default="zero_shot",
        description="Optimization strategy: zero_shot | role_based | few_shot | context_aware",
    )
    context: Optional[ContextConfig] = None


class PromptOptimizeResponse(BaseModel):
    original_prompt: str
    optimized_prompt: str
    strategy: str
    tokens_used: Optional[int] = None


class PromptGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="The prompt to send to the model")
    model_name: Optional[str] = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2048, ge=1, le=8192)


class PromptGenerateResponse(BaseModel):
    response_text: str
    latency_ms: float
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    model_name: str
