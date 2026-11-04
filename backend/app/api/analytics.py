from __future__ import annotations

import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.experiment import Evaluation, Experiment, ResponseRun
from app.schemas.experiment import ExperimentRead

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns aggregated analytics across all experiments:
    - total_experiments
    - avg_overall_score
    - avg_latency_ms_original
    - avg_latency_ms_optimized
    - avg_improvement_delta
    - strategy_counts
    - recent_experiments (last 5)
    """

    # ── Total experiments ──────────────────────────────────────────────────────
    total_q = await db.execute(select(func.count()).select_from(Experiment))
    total_experiments: int = total_q.scalar_one() or 0

    # ── Average overall evaluation score ──────────────────────────────────────
    avg_score_q = await db.execute(
        select(func.avg(Evaluation.overall_score)).select_from(Evaluation)
    )
    avg_overall_score: float | None = avg_score_q.scalar_one()
    if avg_overall_score is not None:
        avg_overall_score = round(avg_overall_score, 3)

    # ── Average latency per variant ────────────────────────────────────────────
    orig_latency_q = await db.execute(
        select(func.avg(ResponseRun.latency_ms)).where(ResponseRun.variant == "original")
    )
    avg_latency_original: float | None = orig_latency_q.scalar_one()
    if avg_latency_original is not None:
        avg_latency_original = round(avg_latency_original, 2)

    opt_latency_q = await db.execute(
        select(func.avg(ResponseRun.latency_ms)).where(ResponseRun.variant == "optimized")
    )
    avg_latency_optimized: float | None = opt_latency_q.scalar_one()
    if avg_latency_optimized is not None:
        avg_latency_optimized = round(avg_latency_optimized, 2)

    # ── Average improvement delta (optimized − original overall score) ─────────
    # For each experiment pair, compare evaluations for original vs optimised runs
    runs_q = await db.execute(
        select(ResponseRun.experiment_id, ResponseRun.variant, Evaluation.overall_score)
        .join(Evaluation, Evaluation.response_run_id == ResponseRun.id, isouter=True)
    )
    rows = runs_q.all()

    # Group by experiment_id
    scores_by_experiment: dict[int, dict[str, list[float]]] = {}
    for exp_id, variant, score in rows:
        if score is None:
            continue
        scores_by_experiment.setdefault(exp_id, {"original": [], "optimized": []})
        if variant in scores_by_experiment[exp_id]:
            scores_by_experiment[exp_id][variant].append(score)

    deltas: list[float] = []
    for scores in scores_by_experiment.values():
        orig_scores = scores.get("original", [])
        opt_scores = scores.get("optimized", [])
        if orig_scores and opt_scores:
            delta = sum(opt_scores) / len(opt_scores) - sum(orig_scores) / len(orig_scores)
            deltas.append(delta)

    avg_improvement_delta = round(sum(deltas) / len(deltas), 3) if deltas else None

    # ── Strategy counts ────────────────────────────────────────────────────────
    strategy_q = await db.execute(
        select(Experiment.strategy, func.count().label("count"))
        .group_by(Experiment.strategy)
    )
    strategy_counts: Dict[str, int] = {row.strategy: row.count for row in strategy_q.all()}

    # ── Recent experiments (last 5) ────────────────────────────────────────────
    recent_q = await db.execute(
        select(Experiment)
        .order_by(Experiment.created_at.desc())
        .limit(5)
        .options(
            selectinload(Experiment.response_runs).selectinload(ResponseRun.evaluations)
        )
    )
    recent_experiments: List[ExperimentRead] = [
        ExperimentRead.model_validate(e) for e in recent_q.scalars().all()
    ]

    return {
        "total_experiments": total_experiments,
        "avg_overall_score": avg_overall_score,
        "avg_latency_ms_original": avg_latency_original,
        "avg_latency_ms_optimized": avg_latency_optimized,
        "avg_improvement_delta": avg_improvement_delta,
        "strategy_counts": strategy_counts,
        "recent_experiments": [e.model_dump() for e in recent_experiments],
    }
