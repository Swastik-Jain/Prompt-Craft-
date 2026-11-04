from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# App fixture — import app after patching the DB so tests stay in-memory
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def client():
    """Synchronous TestClient using an in-memory SQLite DB."""
    import os
    os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
    os.environ.setdefault("GEMINI_API_KEY", "test-key")

    from app.main import app
    with TestClient(app) as c:
        yield c


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_health(client: TestClient):
    """GET /api/health should return 200 with status ok."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "model" in data


def test_optimize_prompt(client: TestClient):
    """POST /api/prompts/optimize should return an optimized prompt."""
    mock_result = "You are an expert. Please summarise the meeting notes clearly."

    with patch(
        "app.api.prompts.GeminiService.optimize_prompt",
        new_callable=AsyncMock,
        return_value=mock_result,
    ):
        response = client.post(
            "/api/prompts/optimize",
            json={
                "prompt": "summarise meeting notes",
                "strategy": "role_based",
                "context": {
                    "role": "Executive Assistant",
                    "audience": "C-suite",
                    "goal": "Concise summary",
                    "constraints": ["under 200 words"],
                    "output_format": "bullet list",
                },
            },
        )

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["original_prompt"] == "summarise meeting notes"
    assert data["optimized_prompt"] == mock_result
    assert data["strategy"] == "role_based"


def test_generate_prompt(client: TestClient):
    """POST /api/prompts/generate should return a Gemini response."""
    mock_result = {
        "response_text": "Paris is the capital of France.",
        "latency_ms": 312.5,
        "input_tokens": 10,
        "output_tokens": 8,
    }

    with patch(
        "app.api.prompts.GeminiService.generate",
        new_callable=AsyncMock,
        return_value=mock_result,
    ):
        response = client.post(
            "/api/prompts/generate",
            json={
                "prompt": "What is the capital of France?",
                "temperature": 0.5,
                "max_tokens": 128,
            },
        )

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["response_text"] == "Paris is the capital of France."
    assert data["latency_ms"] == 312.5
    assert data["input_tokens"] == 10
    assert data["output_tokens"] == 8


def test_optimize_prompt_missing_key(client: TestClient):
    """POST /api/prompts/optimize should return 503 when API key is missing."""
    with patch(
        "app.api.prompts.GeminiService.optimize_prompt",
        new_callable=AsyncMock,
        side_effect=ValueError("GEMINI_API_KEY is not configured."),
    ):
        response = client.post(
            "/api/prompts/optimize",
            json={"prompt": "hello", "strategy": "zero_shot"},
        )
    assert response.status_code == 503


def test_generate_prompt_gemini_error(client: TestClient):
    """POST /api/prompts/generate should return 502 on Gemini failures."""
    with patch(
        "app.api.prompts.GeminiService.generate",
        new_callable=AsyncMock,
        side_effect=RuntimeError("Quota exceeded"),
    ):
        response = client.post(
            "/api/prompts/generate",
            json={"prompt": "hello"},
        )
    assert response.status_code == 502
