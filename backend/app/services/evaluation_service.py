from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


@dataclass
class EvaluationResult:
    relevance_score: float
    completeness_score: float
    format_score: float
    overall_score: float
    evaluator: str
    feedback: str


class EvaluationService:
    """
    Scores a model response against the original prompt using either
    rule-based heuristics or an LLM judge.
    """

    # Weights for overall score
    WEIGHTS = {
        "relevance": 0.40,
        "completeness": 0.35,
        "format": 0.25,
    }

    @staticmethod
    def _clamp(value: float, lo: float = 1.0, hi: float = 5.0) -> float:
        return max(lo, min(hi, value))

    # ── Heuristic evaluation ───────────────────────────────────────────────────

    @classmethod
    def heuristic_evaluate(
        cls,
        prompt: str,
        response: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> EvaluationResult:
        """Score a response using rule-based heuristics (no Gemini call)."""
        context = context or {}

        relevance = cls._score_relevance(prompt, response)
        completeness = cls._score_completeness(response)
        fmt = cls._score_format(response, context)

        overall = (
            relevance * cls.WEIGHTS["relevance"]
            + completeness * cls.WEIGHTS["completeness"]
            + fmt * cls.WEIGHTS["format"]
        )
        overall = cls._clamp(overall)

        feedback_parts = []
        if relevance < 3:
            feedback_parts.append("Response has low keyword overlap with the prompt.")
        if completeness < 3:
            feedback_parts.append("Response seems too short or incomplete.")
        if fmt < 3:
            feedback_parts.append("Response may not follow the expected output format.")
        if not feedback_parts:
            feedback_parts.append("Response looks good overall.")

        return EvaluationResult(
            relevance_score=round(relevance, 2),
            completeness_score=round(completeness, 2),
            format_score=round(fmt, 2),
            overall_score=round(overall, 2),
            evaluator="auto",
            feedback=" ".join(feedback_parts),
        )

    @classmethod
    def _score_relevance(cls, prompt: str, response: str) -> float:
        """
        Keyword overlap between prompt and response.
        Scale: 1 (no overlap) → 5 (high overlap).
        """
        # Tokenise by splitting on non-alphanumeric characters
        def tokenise(text: str):
            return set(re.split(r"\W+", text.lower())) - {"", "the", "a", "an", "is", "in", "of", "to", "and", "or"}

        prompt_words = tokenise(prompt)
        response_words = tokenise(response)

        if not prompt_words:
            return 3.0

        overlap_ratio = len(prompt_words & response_words) / len(prompt_words)
        # Map 0–1 → 1–5
        score = 1.0 + overlap_ratio * 4.0
        return cls._clamp(score)

    @classmethod
    def _score_completeness(cls, response: str) -> float:
        """
        Length-based completeness. Very short responses are penalised.
        Scale: 1 (very short) → 5 (rich / comprehensive).
        """
        word_count = len(response.split())

        if word_count < 10:
            return 1.0
        elif word_count < 30:
            return 2.0
        elif word_count < 80:
            return 3.0
        elif word_count < 200:
            return 4.0
        else:
            return 5.0

    @classmethod
    def _score_format(cls, response: str, context: Dict[str, Any]) -> float:
        """
        Check whether the response honours the expected output_format.
        If no output_format is requested, give a neutral 3.0.
        """
        output_format = context.get("output_format", "").lower()
        if not output_format:
            return 3.0

        response_lower = response.lower()
        format_keywords = {
            "json": ["{", "}"],
            "markdown": ["#", "**", "- "],
            "bullet": ["- ", "* ", "• "],
            "list": ["1.", "2.", "- "],
            "table": ["|", "---"],
            "code": ["```", "def ", "function "],
        }

        for fmt_name, indicators in format_keywords.items():
            if fmt_name in output_format:
                hits = sum(1 for ind in indicators if ind in response_lower)
                # Any hit counts as a good match (formats use alternative syntax)
                if hits >= 1:
                    ratio = 0.75 + (hits / len(indicators)) * 0.25
                else:
                    ratio = 0.0
                return cls._clamp(1.0 + ratio * 4.0)

        # Generic: check if any output_format keyword appears in response
        if any(word in response_lower for word in output_format.split()):
            return 4.0
        return 2.5

    # ── LLM-judge evaluation ───────────────────────────────────────────────────

    @classmethod
    async def llm_judge_evaluate(
        cls,
        prompt: str,
        response: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> EvaluationResult:
        """
        Ask Gemini to score the response as a JSON object, then parse it.
        Falls back to heuristic evaluation on any error.
        """
        from app.services.gemini_service import gemini_service

        context = context or {}
        judge_prompt = (
            "You are an expert evaluator. Score the AI response below on three dimensions "
            "using a 1–5 scale (1 = poor, 5 = excellent). Return ONLY valid JSON.\n\n"
            "Scoring criteria:\n"
            "  relevance_score: How well does the response address the prompt?\n"
            "  completeness_score: Is the response thorough and complete?\n"
            "  format_score: Does the response follow the requested output format?\n\n"
            f"Prompt:\n{prompt}\n\n"
            f"Response:\n{response}\n\n"
            "Return JSON exactly like this:\n"
            '{"relevance_score": 4.0, "completeness_score": 3.5, "format_score": 4.0, '
            '"feedback": "One sentence explaining the scores."}'
        )

        try:
            result = await gemini_service.generate(
                prompt=judge_prompt,
                temperature=0.2,
                max_tokens=256,
            )
            raw_text = result["response_text"]

            # Extract the first JSON object from the response
            json_match = re.search(r"\{.*?\}", raw_text, re.DOTALL)
            if not json_match:
                raise ValueError("No JSON found in LLM judge response")

            scores = json.loads(json_match.group())
            relevance = cls._clamp(float(scores.get("relevance_score", 3.0)))
            completeness = cls._clamp(float(scores.get("completeness_score", 3.0)))
            fmt = cls._clamp(float(scores.get("format_score", 3.0)))
            overall = (
                relevance * cls.WEIGHTS["relevance"]
                + completeness * cls.WEIGHTS["completeness"]
                + fmt * cls.WEIGHTS["format"]
            )
            return EvaluationResult(
                relevance_score=round(relevance, 2),
                completeness_score=round(completeness, 2),
                format_score=round(fmt, 2),
                overall_score=round(cls._clamp(overall), 2),
                evaluator="llm_judge",
                feedback=scores.get("feedback", "LLM judge evaluation complete."),
            )

        except Exception as exc:
            logger.warning("LLM judge failed (%s), falling back to heuristics.", exc)
            result = cls.heuristic_evaluate(prompt, response, context)
            result.evaluator = "auto"
            return result
