from __future__ import annotations

import pytest
from app.services.evaluation_service import EvaluationService


# ---------------------------------------------------------------------------
# Relevance scoring
# ---------------------------------------------------------------------------

class TestRelevanceScoring:
    def test_high_overlap(self):
        prompt = "explain machine learning algorithms"
        response = "Machine learning algorithms include supervised learning, unsupervised learning, and reinforcement learning."
        result = EvaluationService.heuristic_evaluate(prompt, response)
        assert result.relevance_score >= 3.0, "High keyword overlap should score >= 3"

    def test_low_overlap(self):
        prompt = "explain machine learning algorithms"
        response = "The weather today is sunny and warm with a gentle breeze from the north."
        result = EvaluationService.heuristic_evaluate(prompt, response)
        assert result.relevance_score <= 3.0, "Low keyword overlap should score <= 3"

    def test_exact_match(self):
        prompt = "what is python"
        response = "Python is a high-level programming language."
        result = EvaluationService.heuristic_evaluate(prompt, response)
        # 'python' and 'is' present → non-trivial overlap
        assert result.relevance_score >= 2.0

    def test_empty_response(self):
        prompt = "explain neural networks"
        response = "."
        result = EvaluationService.heuristic_evaluate(prompt, response)
        assert result.relevance_score >= 1.0
        assert result.relevance_score <= 5.0

    def test_score_within_bounds(self):
        prompt = "test prompt with various words"
        response = "test prompt various words here and there"
        result = EvaluationService.heuristic_evaluate(prompt, response)
        assert 1.0 <= result.relevance_score <= 5.0


# ---------------------------------------------------------------------------
# Completeness scoring
# ---------------------------------------------------------------------------

class TestCompletenessScoring:
    def test_very_short_response(self):
        result = EvaluationService.heuristic_evaluate("prompt", "Yes.")
        assert result.completeness_score == 1.0

    def test_short_response(self):
        result = EvaluationService.heuristic_evaluate(
            "prompt", "This is a short answer with about twenty words in it total here."
        )
        assert result.completeness_score == 2.0

    def test_medium_response(self):
        words = " ".join(["word"] * 50)
        result = EvaluationService.heuristic_evaluate("prompt", words)
        assert result.completeness_score == 3.0

    def test_long_response(self):
        words = " ".join(["word"] * 150)
        result = EvaluationService.heuristic_evaluate("prompt", words)
        assert result.completeness_score == 4.0

    def test_very_long_response(self):
        words = " ".join(["word"] * 250)
        result = EvaluationService.heuristic_evaluate("prompt", words)
        assert result.completeness_score == 5.0


# ---------------------------------------------------------------------------
# Overall score calculation
# ---------------------------------------------------------------------------

class TestOverallScoreCalculation:
    def test_overall_within_bounds(self):
        prompt = "explain deep learning"
        response = "Deep learning is a subset of machine learning using neural networks."
        result = EvaluationService.heuristic_evaluate(prompt, response)
        assert 1.0 <= result.overall_score <= 5.0

    def test_overall_weighted_average(self):
        """
        Verify the weighted average formula:
        overall = relevance*0.40 + completeness*0.35 + format*0.25
        """
        prompt = "explain deep learning"
        response = "Deep learning is a subset of machine learning using neural networks."
        result = EvaluationService.heuristic_evaluate(prompt, response)

        expected = round(
            result.relevance_score * 0.40
            + result.completeness_score * 0.35
            + result.format_score * 0.25,
            2,
        )
        # Allow tiny floating-point rounding difference
        assert abs(result.overall_score - expected) < 0.05

    def test_feedback_is_string(self):
        prompt = "test"
        response = "test response"
        result = EvaluationService.heuristic_evaluate(prompt, response)
        assert isinstance(result.feedback, str)
        assert len(result.feedback) > 0

    def test_evaluator_is_auto(self):
        result = EvaluationService.heuristic_evaluate("prompt", "response")
        assert result.evaluator == "auto"

    def test_format_score_with_bullet_format(self):
        context = {"output_format": "bullet list"}
        response = "- Item one\n- Item two\n- Item three"
        result = EvaluationService.heuristic_evaluate("list things", response, context)
        assert result.format_score >= 3.0

    def test_format_score_no_format(self):
        result = EvaluationService.heuristic_evaluate("prompt", "any response")
        assert result.format_score == 3.0  # Neutral when no format required


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------

class TestEdgeCases:
    def test_empty_prompt(self):
        result = EvaluationService.heuristic_evaluate("", "some response")
        assert 1.0 <= result.overall_score <= 5.0

    def test_all_scores_clamp_to_range(self):
        # Craft a scenario that could push scores out of range
        prompt = " ".join(["word"] * 100)
        response = " ".join(["word"] * 100)
        result = EvaluationService.heuristic_evaluate(prompt, response)
        for score in (
            result.relevance_score,
            result.completeness_score,
            result.format_score,
            result.overall_score,
        ):
            assert 1.0 <= score <= 5.0
