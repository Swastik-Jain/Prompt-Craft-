from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api import analytics, experiments, prompts

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database on startup."""
    logger.info("Starting PromptCraft AI backend…")
    await init_db()
    logger.info("Database initialised.")
    yield
    logger.info("Shutting down PromptCraft AI backend.")


app = FastAPI(
    title="PromptCraft AI",
    description="Prompt engineering & context optimization platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(prompts.router)
app.include_router(experiments.router)
app.include_router(analytics.router)


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["health"])
async def health_check():
    return {"status": "ok", "model": settings.model_name}
