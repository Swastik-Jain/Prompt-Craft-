from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.schemas.prompt import (
    ContextConfig,
    PromptGenerateRequest,
    PromptGenerateResponse,
    PromptOptimizeRequest,
    PromptOptimizeResponse,
)
from app.services.context_builder import ContextBuilder
from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


def get_gemini_service() -> GeminiService:
    return GeminiService()


@router.post("/optimize", response_model=PromptOptimizeResponse, status_code=status.HTTP_200_OK)
async def optimize_prompt(
    body: PromptOptimizeRequest,
    gemini: GeminiService = Depends(get_gemini_service),
):
    """
    Rewrite a user prompt using the requested strategy (zero_shot, role_based,
    few_shot, context_aware). Calls Gemini with a meta-prompt.
    """
    effective_prompt = (body.prompt or body.raw_prompt or "").strip()
    if not effective_prompt:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Prompt text cannot be empty.",
        )

    strategy = (body.strategy or "zero_shot").replace("-", "_")

    if isinstance(body.context, ContextConfig):
        context_dict = body.context.model_dump()
    elif isinstance(body.context, dict):
        context_dict = body.context
    else:
        context_dict = {}

    # Build context block for token estimation
    _, token_estimate = ContextBuilder.build(context_dict) if context_dict else ("", 0)

    try:
        optimized = await gemini.optimize_prompt(
            raw_prompt=effective_prompt,
            strategy=strategy,
            context=context_dict,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        logger.exception("optimize_prompt failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error: {str(exc)}",
        )

    return PromptOptimizeResponse(
        original_prompt=effective_prompt,
        optimized_prompt=optimized,
        strategy=strategy,
        tokens_used=token_estimate or None,
    )


@router.post("/generate", response_model=PromptGenerateResponse, status_code=status.HTTP_200_OK)
async def generate_prompt(
    body: PromptGenerateRequest,
    gemini: GeminiService = Depends(get_gemini_service),
):
    """Send a prompt directly to Gemini and return the response with metadata."""
    effective_model = body.model_name or settings.model_name

    try:
        result = await gemini.generate(
            prompt=body.prompt,
            model_name=effective_model,
            temperature=body.temperature,
            max_tokens=body.max_tokens,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        logger.exception("generate_prompt failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini generation error: {str(exc)}",
        )

    return PromptGenerateResponse(
        response_text=result["response_text"],
        latency_ms=result["latency_ms"],
        input_tokens=result.get("input_tokens"),
        output_tokens=result.get("output_tokens"),
        model_name=effective_model,
    )
