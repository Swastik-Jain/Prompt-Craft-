# Evaluation Results — PromptCraft AI

## Overview

This document records experimental results from running the PromptCraft AI benchmark suite.

> Fill in this table as you run experiments. Use the application's History and Comparison screens to retrieve scores.

---

## Benchmark Results

### Task 1: Explain Machine Learning

| Condition | Relevance | Completeness | Format | Overall | Latency (ms) | Tokens |
|-----------|-----------|--------------|--------|---------|--------------|--------|
| Baseline (raw) | — | — | — | — | — | — |
| Prompt-Engineered | — | — | — | — | — | — |
| Prompt + Context | — | — | — | — | — | — |

### Task 2: Summarize Causes of WWI

| Condition | Relevance | Completeness | Format | Overall | Latency (ms) | Tokens |
|-----------|-----------|--------------|--------|---------|--------------|--------|
| Baseline (raw) | — | — | — | — | — | — |
| Prompt-Engineered | — | — | — | — | — | — |
| Prompt + Context | — | — | — | — | — | — |

*(Add rows for all 12 benchmark tasks)*

---

## Aggregate Results

| Strategy | Avg Relevance | Avg Completeness | Avg Format | Avg Overall | Avg Latency |
|----------|--------------|-----------------|-----------|------------|------------|
| Zero-Shot | — | — | — | — | — |
| Role-Based | — | — | — | — | — |
| Few-Shot | — | — | — | — | — |
| Context-Aware | — | — | — | — | — |

---

## Hypothesis Validation

### H1: Prompt engineering improves relevance and format compliance
> **Result**: *(Fill after experiments)*  
> **Evidence**: *(Cite score delta)*

### H2: Context addition further improves completeness
> **Result**: *(Fill after experiments)*  
> **Evidence**: *(Cite score delta)*

### H3: Context-aware strategy produces most targeted responses
> **Result**: *(Fill after experiments)*  
> **Evidence**: *(Cite qualitative examples)*

---

## Human Review Subset

For 5 manually selected experiments, compare heuristic scores with human judgement:

| Task | Heuristic Overall | Human Overall | Agreement? | Notes |
|------|------------------|--------------|-----------|-------|
| Explain ML | — | — | — | — |
| WWI Summary | — | — | — | — |
| Python Sort | — | — | — | — |
| SQL Duplicates | — | — | — | — |
| Gradient Descent | — | — | — | — |

---

## Observations & Discussion

*(Write your analysis here after running experiments)*

Key observations:
1. 
2. 
3. 

Limitations:
- Gemini's responses are non-deterministic; small changes in wording can affect scores
- Heuristic evaluation cannot assess factual accuracy
- Sample size of 12 tasks limits statistical significance

---

## How to Reproduce

1. Start the backend: `cd backend && uvicorn app.main:app --reload`
2. Start the frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. For each benchmark task:
   a. Enter raw prompt in Prompt Studio
   b. Select strategy, click Optimize
   c. Add context in Context Builder
   d. Click Run Comparison
   e. Click Evaluate Responses
   f. Record scores from the Comparison screen

