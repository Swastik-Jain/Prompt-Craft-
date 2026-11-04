from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    original_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    optimized_prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    strategy: Mapped[str] = mapped_column(String(50), nullable=False, default="zero_shot")
    context_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False, default="gemini-1.5-flash")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    response_runs: Mapped[list["ResponseRun"]] = relationship(
        "ResponseRun", back_populates="experiment", cascade="all, delete-orphan"
    )


class ResponseRun(Base):
    __tablename__ = "response_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    experiment_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False
    )
    variant: Mapped[str] = mapped_column(String(20), nullable=False)  # "original" / "optimized"
    response_text: Mapped[str] = mapped_column(Text, nullable=False)
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False)
    input_tokens: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    output_tokens: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    generation_settings_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    experiment: Mapped["Experiment"] = relationship("Experiment", back_populates="response_runs")
    evaluations: Mapped[list["Evaluation"]] = relationship(
        "Evaluation", back_populates="response_run", cascade="all, delete-orphan"
    )


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    response_run_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("response_runs.id", ondelete="CASCADE"), nullable=False
    )
    relevance_score: Mapped[float] = mapped_column(Float, nullable=False)
    completeness_score: Mapped[float] = mapped_column(Float, nullable=False)
    format_score: Mapped[float] = mapped_column(Float, nullable=False)
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)
    evaluator: Mapped[str] = mapped_column(String(20), nullable=False, default="auto")  # "auto" / "llm_judge"
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    response_run: Mapped["ResponseRun"] = relationship("ResponseRun", back_populates="evaluations")
