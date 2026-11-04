# ⚡ PromptCraft AI

**An Intelligent Prompt Engineering and Context Optimization Platform**

PromptCraft AI helps you transform basic user instructions into structured, optimized prompts, manage relevant context, generate LLM responses, and **evaluate how prompt and context engineering affect response quality**.

---

## 🏗️ Architecture

```
Frontend (React + Vite + Tailwind)   ←→   Backend (Python + FastAPI)   ←→   Gemini API
        Port 5173                              Port 8000                    google-generativeai
                                            SQLite Database
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run server
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run development server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📱 Application Screens

| Route | Screen | Purpose |
|-------|--------|---------|
| `/` | Dashboard | Overview of experiments, scores, and analytics |
| `/studio` | Prompt Studio | Enter raw prompts, select strategy, optimize |
| `/context` | Context Builder | Configure role, audience, constraints |
| `/compare` | Comparison | Side-by-side response comparison + evaluation |
| `/history` | History | Browse, reuse, and delete saved experiments |

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|---------|---------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/prompts/optimize` | Generate optimized prompt |
| `POST` | `/api/prompts/generate` | Generate LLM response |
| `POST` | `/api/experiments/compare` | Run original vs optimized |
| `POST` | `/api/experiments/{id}/evaluate` | Evaluate saved responses |
| `GET` | `/api/experiments` | List all experiments |
| `GET` | `/api/experiments/{id}` | Get experiment details |
| `DELETE` | `/api/experiments/{id}` | Delete experiment |
| `GET` | `/api/analytics/summary` | Dashboard metrics |

### Example Request

```json
POST /api/prompts/optimize
{
  "prompt": "Explain machine learning",
  "strategy": "role_based",
  "context": {
    "role": "Machine Learning Instructor",
    "audience": "Beginner CSE student",
    "goal": "Understand ML fundamentals",
    "constraints": ["Use simple language", "Include real-world examples"],
    "output_format": "step-by-step",
    "reference_text": ""
  }
}
```

---

## 🧩 Modules

| Module | Description |
|--------|------------|
| **Prompt Engineering Engine** | Converts vague instructions into structured prompts using zero-shot, role-based, few-shot, or context-aware strategies |
| **Context Engineering Engine** | Organizes role, audience, goals, and constraints before sending to LLM |
| **LLM Integration Engine** | Secure Gemini API client with retry, error handling, and token tracking |
| **Response Comparison Engine** | Side-by-side comparison of original vs optimized responses |
| **Evaluation Engine** | Scores responses on relevance, completeness, and format compliance |
| **Experiment History** | SQLite-backed storage for all experiments and results |
| **Analytics Dashboard** | Visualized metrics including score trends and latency comparisons |

---

## 📊 Prompting Strategies

| Strategy | Description |
|----------|------------|
| **Zero-Shot** | Clear task-focused instructions without examples |
| **Role-Based** | Assign an expert persona to guide tone and depth |
| **Few-Shot** | Incorporate example input/output pairs |
| **Context-Aware** | Weave in audience, goals, constraints, and reference material |

---

## 🗄️ Database Schema

```
Experiment
  ├── id, title, original_prompt, optimized_prompt
  ├── strategy, context_json, model_name, created_at
  └── ResponseRuns[]
        ├── id, variant (original/optimized)
        ├── response_text, latency_ms, tokens
        └── Evaluations[]
              ├── relevance_score, completeness_score
              ├── format_score, overall_score
              └── evaluator, feedback
```

---

## 🧪 Running Tests

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```
GEMINI_API_KEY=your_key_here
DATABASE_URL=sqlite+aiosqlite:///./promptcraft.db
MODEL_NAME=gemini-1.5-flash
CORS_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📁 Project Structure

```
promptcraft-ai/
├── frontend/               # React + Vite + Tailwind
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route-level pages
│       ├── services/       # API client
│       ├── context/        # React context (state)
│       └── hooks/          # Custom hooks
│
├── backend/                # FastAPI + SQLAlchemy
│   └── app/
│       ├── api/            # Route handlers
│       ├── core/           # Config + Database
│       ├── models/         # SQLAlchemy ORM models
│       ├── schemas/        # Pydantic schemas
│       ├── services/       # Business logic
│       └── utils/          # Helpers
│
├── docs/                   # Architecture + methodology docs
└── README.md
```

---

## 📝 Academic Notes

This project demonstrates:
- **Prompt Engineering**: Systematic transformation of user intent into structured prompts
- **Context Engineering**: Strategic organization of background information for LLMs
- **Controlled Experiments**: Fair comparison using identical model, temperature, and evaluation criteria
- **Evaluation Methodology**: Multi-metric scoring (relevance, completeness, format) with LLM-as-judge option

> Evaluation scores are estimates, not measures of factual accuracy. Cross-reference a subset with human review for academic credibility.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios
- **Backend**: FastAPI, SQLAlchemy (async), Pydantic v2, aiosqlite
- **LLM**: Google Gemini API (`google-generativeai`)
- **Database**: SQLite
- **Testing**: Pytest

---

*Built as part of a Skill-Based Mini Project on Prompt Engineering & Context Engineering in Large Language Models.*

