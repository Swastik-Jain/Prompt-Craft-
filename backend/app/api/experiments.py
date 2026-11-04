from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.experiment import Evaluation, Experiment, ResponseRun
from app.schemas.experiment import (
    CompareRequest,
    CompareResponse,
    EvaluationRead,
    ExperimentRead,
    ResponseRunRead,
)
from app.services.comparison_service import ComparisonService
from app.services.evaluation_service import EvaluationService
from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/experiments", tags=["experiments"])


def get_gemini_service() -> GeminiService:
    return GeminiService()


# ── Helper ─────────────────────────────────────────────────────────────────────

async def _get_experiment_or_404(experiment_id: int, db: AsyncSession) -> Experiment:
    stmt = (
        select(Experiment)
        .where(Experiment.id == experiment_id)
        .options(
            selectinload(Experiment.response_runs).selectinload(ResponseRun.evaluations)
        )
    )
    result = await db.execute(stmt)
    experiment = result.scalar_one_or_none()
    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment {experiment_id} not found.",
        )
    return experiment


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/compare", response_model=CompareResponse, status_code=status.HTTP_201_CREATED)
async def compare_experiment(
    body: CompareRequest,
    db: AsyncSession = Depends(get_db),
    gemini: GeminiService = Depends(get_gemini_service),
):
    """
    Run both the original and optimized prompts for an experiment and persist
    the results as ResponseRun rows.
    """
    if body.experiment_id:
        experiment = await _get_experiment_or_404(body.experiment_id, db)
    else:
        orig = (
            body.original_prompt
            or body.raw_prompt
            or body.prompt
            or "Explain machine learning"
        ).strip()
        opt = (body.optimized_prompt or orig).strip()
        strat = (body.strategy or "zero_shot").replace("-", "_")
        title = body.title or (orig[:50] + ("..." if len(orig) > 50 else ""))
        experiment = Experiment(
            title=title,
            original_prompt=orig,
            optimized_prompt=opt,
            strategy=strat,
            context_json=body.context or {},
            model_name=body.model_name or settings.model_name,
        )
        db.add(experiment)
        await db.flush()
        await db.refresh(experiment)

    svc = ComparisonService(db=db, gemini=gemini)
    try:
        runs = await svc.run_comparison(
            experiment=experiment,
            model_name=body.model_name,
            temperature=body.temperature,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except Exception as exc:
        logger.exception("Comparison failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error during comparison: {str(exc)}",
        )

    await db.flush()

    return CompareResponse(
        experiment_id=experiment.id,
        strategy=experiment.strategy,
        original_run=ResponseRunRead.model_validate(runs["original_run"]),
        optimized_run=ResponseRunRead.model_validate(runs["optimized_run"]),
    )


@router.post("/{experiment_id}/evaluate", response_model=List[EvaluationRead], status_code=status.HTTP_201_CREATED)
async def evaluate_experiment(
    experiment_id: int,
    db: AsyncSession = Depends(get_db),
    gemini: GeminiService = Depends(get_gemini_service),
):
    """
    Run heuristic evaluation on all ResponseRun rows for an experiment
    and persist Evaluation rows.
    """
    experiment = await _get_experiment_or_404(experiment_id, db)

    if not experiment.response_runs:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No response runs found. Run /compare first.",
        )

    context = experiment.context_json or {}
    created_evals: list[Evaluation] = []

    for run in experiment.response_runs:
        prompt = (
            experiment.original_prompt
            if run.variant == "original"
            else (experiment.optimized_prompt or experiment.original_prompt)
        )
        result = EvaluationService.heuristic_evaluate(
            prompt=prompt,
            response=run.response_text,
            context=context,
        )
        eval_row = Evaluation(
            response_run_id=run.id,
            relevance_score=result.relevance_score,
            completeness_score=result.completeness_score,
            format_score=result.format_score,
            overall_score=result.overall_score,
            evaluator=result.evaluator,
            feedback=result.feedback,
        )
        db.add(eval_row)
        created_evals.append(eval_row)

    await db.flush()

    return [EvaluationRead.model_validate(e) for e in created_evals]


@router.get("/", response_model=List[ExperimentRead])
async def list_experiments(db: AsyncSession = Depends(get_db)):
    """List all experiments (most recent first)."""
    stmt = (
        select(Experiment)
        .order_by(Experiment.created_at.desc())
        .options(
            selectinload(Experiment.response_runs).selectinload(ResponseRun.evaluations)
        )
    )
    result = await db.execute(stmt)
    experiments = result.scalars().all()
    return [ExperimentRead.model_validate(e) for e in experiments]


@router.get("/{experiment_id}", response_model=ExperimentRead)
async def get_experiment(experiment_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single experiment with its response runs and evaluations."""
    return ExperimentRead.model_validate(await _get_experiment_or_404(experiment_id, db))


@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experiment(experiment_id: int, db: AsyncSession = Depends(get_db)):
    """Permanently delete an experiment and its related rows."""
    experiment = await _get_experiment_or_404(experiment_id, db)
    await db.delete(experiment)
    await db.flush()
