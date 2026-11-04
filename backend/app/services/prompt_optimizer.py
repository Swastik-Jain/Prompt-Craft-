from __future__ import annotations

from typing import Any, Dict


class PromptOptimizer:
    """
    Builds meta-prompts that instruct Gemini to rewrite user prompts
    according to a chosen strategy.
    """

    STRATEGIES = {"zero_shot", "role_based", "few_shot", "context_aware"}

    @staticmethod
    def build_meta_prompt(
        raw_prompt: str,
        strategy: str,
        context: Dict[str, Any],
    ) -> str:
        """
        Return a fully assembled meta-prompt string ready to send to Gemini.
        """
        builder_map = {
            "zero_shot": PromptOptimizer._zero_shot,
            "role_based": PromptOptimizer._role_based,
            "few_shot": PromptOptimizer._few_shot,
            "context_aware": PromptOptimizer._context_aware,
        }

        builder = builder_map.get(strategy, PromptOptimizer._zero_shot)
        return builder(raw_prompt, context)

    # ── Strategy builders ──────────────────────────────────────────────────────

    @staticmethod
    def _zero_shot(raw_prompt: str, context: Dict[str, Any]) -> str:
        return (
            "You are a prompt engineering expert. Your task is to rewrite the following "
            "prompt to be clear, concise, and task-focused. Remove any ambiguity. "
            "Output ONLY the improved prompt text, with no explanation or preamble.\n\n"
            f"Original prompt:\n{raw_prompt}\n\n"
            "Rewritten prompt:"
        )

    @staticmethod
    def _role_based(raw_prompt: str, context: Dict[str, Any]) -> str:
        role = context.get("role", "domain expert")
        return (
            "You are a prompt engineering expert specialising in role-based prompts. "
            "Rewrite the following prompt so that it:\n"
            f"  1. Assigns the AI an expert role (suggested role: {role})\n"
            "  2. Clearly states the expertise and tone expected of that role\n"
            "  3. Frames the task from that expert's perspective\n\n"
            "Output ONLY the improved prompt, with no explanation or preamble.\n\n"
            f"Original prompt:\n{raw_prompt}\n\n"
            "Rewritten prompt:"
        )

    @staticmethod
    def _few_shot(raw_prompt: str, context: Dict[str, Any]) -> str:
        return (
            "You are a prompt engineering expert specialising in few-shot prompting. "
            "Rewrite the following prompt so that it includes 2–3 concrete input/output "
            "examples that demonstrate the desired behaviour. Place the examples before "
            "the actual task instruction.\n\n"
            "Output ONLY the improved prompt (with embedded examples), no explanation.\n\n"
            f"Original prompt:\n{raw_prompt}\n\n"
            "Rewritten prompt:"
        )

    @staticmethod
    def _context_aware(raw_prompt: str, context: Dict[str, Any]) -> str:
        role = context.get("role", "")
        audience = context.get("audience", "")
        goal = context.get("goal", "")
        constraints = context.get("constraints", [])
        output_format = context.get("output_format", "")
        reference_text = context.get("reference_text", "")

        context_block_parts = []
        if role:
            context_block_parts.append(f"Role: {role}")
        if audience:
            context_block_parts.append(f"Target audience: {audience}")
        if goal:
            context_block_parts.append(f"Goal: {goal}")
        if constraints:
            constraint_list = "\n".join(f"  - {c}" for c in constraints)
            context_block_parts.append(f"Constraints:\n{constraint_list}")
        if output_format:
            context_block_parts.append(f"Output format: {output_format}")
        if reference_text:
            context_block_parts.append(f"Reference material:\n{reference_text}")

        context_block = "\n".join(context_block_parts) if context_block_parts else "(none provided)"

        return (
            "You are a prompt engineering expert specialising in context-aware prompts. "
            "Rewrite the following prompt by weaving in ALL of the provided context details "
            "(role, audience, goal, constraints, output format, and reference material). "
            "The rewritten prompt should be comprehensive yet concise.\n\n"
            "Output ONLY the improved prompt, with no explanation or preamble.\n\n"
            "--- Context ---\n"
            f"{context_block}\n\n"
            "--- Original prompt ---\n"
            f"{raw_prompt}\n\n"
            "Rewritten prompt:"
        )
