from __future__ import annotations

from typing import Any, Dict


def compute_token_estimate(text: str) -> int:
    """
    Rough token estimate using word-count × 1.3 heuristic.
    (GPT/Gemini tokenisers average ~1.3 tokens per English word.)
    """
    return int(len(text.split()) * 1.3)


def compute_improvement_delta(
    original_eval: Dict[str, float],
    optimized_eval: Dict[str, float],
) -> Dict[str, float]:
    """
    Compute the per-dimension improvement from the original to the optimised run.

    Parameters
    ----------
    original_eval / optimized_eval : dict
        Must contain keys: relevance_score, completeness_score,
        format_score, overall_score.

    Returns
    -------
    dict mapping each dimension to (optimised − original).
    """
    dimensions = ["relevance_score", "completeness_score", "format_score", "overall_score"]
    return {
        dim: round(
            optimized_eval.get(dim, 0.0) - original_eval.get(dim, 0.0),
            2,
        )
        for dim in dimensions
    }


def format_latency(ms: float) -> str:
    """
    Human-readable latency string.

    Examples
    --------
    >>> format_latency(432.1)
    '432ms'
    >>> format_latency(1500.0)
    '1.50s'
    """
    if ms < 1000:
        return f"{ms:.0f}ms"
    return f"{ms / 1000:.2f}s"
