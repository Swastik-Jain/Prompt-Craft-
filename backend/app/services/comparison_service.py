from __future__ import annotations

import logging
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.experiment import Experiment, ResponseRun
from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)


class ComparisonService:
    """
    Runs both the original and optimized prompts through Gemini,
    persists the ResponseRun rows, and returns the results.
    """

    def __init__(self, db: AsyncSession, gemini: GeminiService | None = None):
        self.db = db
        self.gemini = gemini or GeminiService()

    async def run_comparison(
        self,
        experiment: Experiment,
        model_name: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> Dict[str, Any]:
        """
        Run both variants and persist ResponseRun rows.

        Returns
        -------
        dict with keys: original_run, optimized_run (ResponseRun ORM objects)
        """
        effective_model = model_name or experiment.model_name
        generation_settings = {
            "temperature": temperature,
            "max_tokens": max_tokens,
            "model_name": effective_model,
        }

        if not experiment.optimized_prompt:
            raise ValueError(
                f"Experiment {experiment.id} has no optimized_prompt. "
                "Run /api/prompts/optimize first."
            )

        # --- Original variant ---
        logger.info("Running original variant for experiment %s", experiment.id)
        original_result = await self.gemini.generate(
            prompt=experiment.original_prompt,
            model_name=effective_model,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        original_run = ResponseRun(
            experiment_id=experiment.id,
            variant="original",
            response_text=original_result["response_text"],
            latency_ms=original_result["latency_ms"],
            input_tokens=original_result.get("input_tokens"),
            output_tokens=original_result.get("output_tokens"),
            generation_settings_json=generation_settings,
        )
        self.db.add(original_run)

        # --- Optimized variant ---
        logger.info("Running optimized variant for experiment %s", experiment.id)
        optimized_result = await self.gemini.generate(
            prompt=experiment.optimized_prompt,
            model_name=effective_model,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        optimized_run = ResponseRun(
            experiment_id=experiment.id,
            variant="optimized",
            response_text=optimized_result["response_text"],
            latency_ms=optimized_result["latency_ms"],
            input_tokens=optimized_result.get("input_tokens"),
            output_tokens=optimized_result.get("output_tokens"),
            generation_settings_json=generation_settings,
        )
        self.db.add(optimized_run)

        await self.db.flush()  # Get IDs without committing

        return {
            "original_run": original_run,
            "optimized_run": optimized_run,
        }
