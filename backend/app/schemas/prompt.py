from __future__ import annotations

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, model_validator


class ContextConfig(BaseModel):
    role: Optional[str] = None
    audience: Optional[str] = None
    goal: Optional[str] = None
    constraints: List[str] = Field(default_factory=list)
    output_format: Optional[str] = None
    reference_text: Optional[str] = None


class PromptOptimizeRequest(BaseModel):
    prompt: Optional[str] = Field(default=None, description="The raw prompt to optimize")
    raw_prompt: Optional[str] = Field(default=None, description="Alias for prompt")
    strategy: str = Field(
        default="zero_shot",
        description="Optimization strategy: zero_shot | role_based | few_shot | context_aware",
    )
    context: Optional[Union[ContextConfig, Dict[str, Any]]] = None

    @model_validator(mode="after")
    def check_prompt_exists(self) -> PromptOptimizeRequest:
        p = self.prompt or self.raw_prompt
        if not p or not p.strip():
            raise ValueError("Prompt text cannot be empty.")
        if not self.prompt:
            self.prompt = p
        return self


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
