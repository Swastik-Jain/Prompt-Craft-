# System Architecture — PromptCraft AI

## Overview

PromptCraft AI is a modular monolith split into a React frontend and a FastAPI backend.  
This design is intentional for a mini project: simpler to develop, test, and deploy than microservices, while still maintaining clean separation of concerns.

---

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Port 5173)                     │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌────────┐ │
│  │Dashboard │  │Prompt Studio │  │Context   │  │History │ │
│  │    /     │  │   /studio    │  │ Builder  │  │/history│ │
│  └──────────┘  └──────────────┘  │/context  │  └────────┘ │
│                                  └──────────┘              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          ExperimentContext (React State)             │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/JSON (Axios, proxy /api → :8000)
┌──────────────────────────▼──────────────────────────────────┐
│                   FastAPI Backend (Port 8000)                │
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────┐  │
│  │  /api/prompts   │  │/api/experiments  │  │/api/analy │  │
│  │  optimize       │  │  compare         │  │  tics     │  │
│  │  generate       │  │  evaluate        │  │  summary  │  │
│  └────────┬────────┘  │  CRUD            │  └───────────┘  │
│           │           └────────┬─────────┘                  │
│  ┌────────▼──────────────────▼─────────────────────────┐   │
│  │                     Services Layer                   │   │
│  │  GeminiService │ PromptOptimizer │ ContextBuilder    │   │
│  │  ComparisonService │ EvaluationService               │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │       SQLAlchemy ORM (async + aiosqlite)             │   │
│  │   Experiment ─── ResponseRun ─── Evaluation          │   │
│  └────────────────────────┬────────────────────────────┘   │
└──────────────────────────┬┘                                  │
                           │          SQLite File              │
                     promptcraft.db                            │
└──────────────────────────────────────────────────────────────┘
                           ▲
                           │ google-generativeai SDK
                    ┌──────┴──────┐
                    │  Gemini API │
                    │  (Cloud)    │
                    └────────────-┘
```

---

## Module Responsibilities

### Frontend Modules

| Module | File | Responsibility |
|--------|------|----------------|
| ExperimentContext | `context/ExperimentContext.jsx` | Global shared state for active experiment |
| useExperiment | `hooks/useExperiment.js` | API calls + state mutations |
| API Service | `services/api.js` | Axios wrapper for all endpoints |
| MainLayout | `components/layout/` | Sidebar + Navbar shell |
| Prompt components | `components/prompt/` | Editor, strategy selector, optimized display |
| Context components | `components/context/` | ContextForm with token estimator |
| Comparison components | `components/comparison/` | Side-by-side panels, metrics, radar chart |
| Pages | `pages/` | Route-level screens |

### Backend Modules

| Module | File | Responsibility |
|--------|------|----------------|
| Config | `core/config.py` | Environment variable loading |
| Database | `core/database.py` | SQLAlchemy async engine + session factory |
| ORM Models | `models/experiment.py` | Experiment, ResponseRun, Evaluation tables |
| Pydantic Schemas | `schemas/` | Request/response validation |
| Gemini Service | `services/gemini_service.py` | LLM API calls, timing, error handling |
| Prompt Optimizer | `services/prompt_optimizer.py` | Strategy-specific meta-prompt builder |
| Context Builder | `services/context_builder.py` | Context assembly + token estimation |
| Comparison Service | `services/comparison_service.py` | Runs both variants, persists ResponseRuns |
| Evaluation Service | `services/evaluation_service.py` | Heuristic + LLM-judge scoring |
| Metrics Utils | `utils/metrics.py` | Token counting, delta computation |

---

## Data Flow: Prompt Optimization

```
User Input (raw prompt + strategy)
    │
    ▼
POST /api/prompts/optimize
    │
    ▼
PromptOptimizer.build_meta_prompt(strategy, context)
    │  Constructs a system instruction for Gemini
    ▼
GeminiService.optimize_prompt(meta_prompt)
    │  Calls Gemini API
    ▼
Returns optimized_prompt string
    │
    ▼
Frontend displays in OptimizedPrompt component
```

## Data Flow: Comparison

```
User clicks "Run Comparison"
    │
    ▼
POST /api/experiments/compare
  { original_prompt, optimized_prompt, context, strategy, model }
    │
    ▼
ComparisonService
  ├── GeminiService.generate(original_prompt) → ResponseRun A
  └── GeminiService.generate(optimized_prompt) → ResponseRun B
    │  Both saved to DB
    ▼
Returns { experiment_id, original_run, optimized_run }
    │
    ▼
Frontend: ResponsePanel (original) | ResponsePanel (optimized)
    │
    ▼
User clicks "Evaluate"
    │
    ▼
POST /api/experiments/{id}/evaluate
    │
    ▼
EvaluationService.score(original_run) + score(optimized_run)
    │  Saves Evaluation rows
    ▼
ComparisonMetrics table + ScoreChart radar
```

---

## Security Considerations

- **API key never exposed to frontend** — stored only in `backend/.env`, accessed via `pydantic-settings`
- **CORS**: restricted to `http://localhost:5173` in development
- **Input validation**: all requests validated by Pydantic schemas before processing
- **SQL injection**: prevented by SQLAlchemy ORM (parameterized queries)

---

## Scalability Notes (Future)

| Concern | Current | Future |
|---------|---------|--------|
| Database | SQLite (file) | PostgreSQL |
| Auth | None | JWT / OAuth2 |
| LLM Provider | Gemini only | Multi-provider abstraction |
| Context retrieval | Manual paste | RAG with vector DB |
| Deployment | Local | Docker + cloud |

