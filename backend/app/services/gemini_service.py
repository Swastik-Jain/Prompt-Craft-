from __future__ import annotations

import time
import logging
from typing import Any, Dict

import google.generativeai as genai

from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure the Gemini SDK with the API key once at import time
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)


class GeminiService:
    """Wrapper around google.generativeai for PromptCraft AI."""

    def __init__(self):
        self._api_key = settings.gemini_api_key

    def _get_model(self, model_name: str) -> genai.GenerativeModel:
        return genai.GenerativeModel(model_name=model_name)

    async def generate(
        self,
        prompt: str,
        model_name: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> Dict[str, Any]:
        """
        Generate a response from Gemini.

        Returns a dict with keys:
            response_text, latency_ms, input_tokens, output_tokens
        """
        effective_model = model_name or settings.model_name

        if not self._api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured. Set it in your .env file."
            )

        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )

        model = self._get_model(effective_model)

        start = time.monotonic()
        try:
            response = model.generate_content(
                prompt,
                generation_config=generation_config,
            )
        except Exception as exc:
            logger.exception("Gemini generate_content failed: %s", exc)
            raise

        latency_ms = (time.monotonic() - start) * 1000.0

        response_text = ""
        try:
            response_text = response.text
        except Exception:
            # Fallback: join parts
            if response.candidates:
                parts = response.candidates[0].content.parts
                response_text = " ".join(p.text for p in parts if hasattr(p, "text"))

        # Token counts (may be None if not returned)
        input_tokens: int | None = None
        output_tokens: int | None = None
        try:
            usage = response.usage_metadata
            input_tokens = usage.prompt_token_count
            output_tokens = usage.candidates_token_count
        except Exception:
            pass

        return {
            "response_text": response_text,
            "latency_ms": round(latency_ms, 2),
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }

    async def optimize_prompt(
        self,
        raw_prompt: str,
        strategy: str,
        context: Dict[str, Any] | None = None,
    ) -> str:
        """
        Send a meta-prompt to Gemini instructing it to rewrite the user's
        prompt using the given strategy.

        Returns only the rewritten prompt string.
        """
        from app.services.prompt_optimizer import PromptOptimizer

        meta_prompt = PromptOptimizer.build_meta_prompt(raw_prompt, strategy, context or {})

        result = await self.generate(
            prompt=meta_prompt,
            model_name=settings.model_name,
            temperature=0.4,  # Lower temp for deterministic rewrites
            max_tokens=1024,
        )
        return result["response_text"].strip()


# Singleton
gemini_service = GeminiService()
