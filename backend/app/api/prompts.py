from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.schemas.prompt import (
    PromptGenerateRequest,
    PromptGenerateResponse,
    PromptOptimizeRequest,
    PromptOptimizeResponse,
)
from app.services.context_builder import ContextBuilder
from app.services.gemini_service import GeminiService
from app.services.prompt_optimizer import PromptOptimizer

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
    few_shot, context_aware).  Calls Gemini with a meta-prompt.
    """
    context_dict = body.context.model_dump() if body.context else {}

    # Build context block for token estimation
    _, token_estimate = ContextBuilder.build(context_dict) if context_dict else ("", 0)

    try:
        optimized = await gemini.optimize_prompt(
            raw_prompt=body.prompt,
            strategy=body.strategy,
            context=context_dict,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        logger.exception("optimize_prompt failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini API error. Please try again.",
        )

    return PromptOptimizeResponse(
        original_prompt=body.prompt,
        optimized_prompt=optimized,
        strategy=body.strategy,
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
            detail="Gemini API error. Please try again.",
        )

    return PromptGenerateResponse(
        response_text=result["response_text"],
        latency_ms=result["latency_ms"],
        input_tokens=result.get("input_tokens"),
        output_tokens=result.get("output_tokens"),
        model_name=effective_model,
    )
