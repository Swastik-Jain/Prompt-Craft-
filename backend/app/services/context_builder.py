from __future__ import annotations

from typing import Any, Dict, Tuple


class ContextBuilder:
    """
    Assembles a structured context block from a ContextConfig dict and
    provides a rough token-count estimate.
    """

    @staticmethod
    def build(context: Dict[str, Any]) -> Tuple[str, int]:
        """
        Parameters
        ----------
        context : dict
            A ContextConfig-compatible dictionary.

        Returns
        -------
        assembled_context : str
            Human-readable context block.
        token_estimate : int
            Rough estimate of token count (word-count × 1.3).
        """
        lines: list[str] = []

        role = context.get("role")
        if role:
            lines.append(f"Role: {role}")

        audience = context.get("audience")
        if audience:
            lines.append(f"Audience: {audience}")

        goal = context.get("goal")
        if goal:
            lines.append(f"Goal: {goal}")

        constraints = context.get("constraints") or []
        if constraints:
            lines.append("Constraints:")
            for c in constraints:
                lines.append(f"  - {c}")

        output_format = context.get("output_format")
        if output_format:
            lines.append(f"Output Format: {output_format}")

        reference_text = context.get("reference_text")
        if reference_text:
            lines.append(f"Reference Material:\n{reference_text}")

        assembled_context = "\n".join(lines)
        token_estimate = ContextBuilder.estimate_tokens(assembled_context)

        return assembled_context, token_estimate

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """Simple word-count × 1.3 heuristic for token estimation."""
        word_count = len(text.split())
        return int(word_count * 1.3)
