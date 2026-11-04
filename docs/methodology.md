# Methodology — PromptCraft AI

## Research Question

**Does structured prompt engineering, combined with explicit context engineering, produce measurably better LLM responses than naive zero-context prompting?**

---

## Experimental Design

To answer this rigorously, we run controlled experiments using three conditions:

| Condition | Prompt | Context |
|-----------|--------|---------|
| **Baseline** | Raw user prompt (e.g., "Explain machine learning") | None |
| **Prompt-Engineered** | Optimized prompt via selected strategy | None |
| **Prompt + Context** | Optimized prompt | Full context (role, audience, goals, constraints) |

Keeping model, temperature, and max_tokens identical across conditions ensures the only independent variable is the prompt structure.

---

## Prompting Strategies

### Zero-Shot
Rewrites the prompt to be unambiguous, task-specific, and instruction-complete — without adding examples.

**Example transformation:**
- Input: `"Explain machine learning"`
- Output: `"Provide a clear and concise explanation of machine learning, covering its definition, how it works, and common real-world applications."`

### Role-Based
Assigns an expert persona before the task instruction. Research shows that role assignment can improve relevance and depth.

**Example transformation:**
- Input: `"Explain machine learning"`
- Output: `"You are an experienced AI researcher and educator. Explain machine learning in a way that balances technical accuracy with accessibility."`

### Few-Shot
Instructs the LLM to frame its response after seeing 2–3 input/output examples embedded in the prompt. Useful for format-sensitive tasks.

### Context-Aware
Embeds role, audience description, learning goal, constraints, and expected output format directly into the system instruction. The most comprehensive strategy.

---

## Evaluation Metrics

| Metric | Type | Measurement |
|--------|------|-------------|
| **Relevance** | Qualitative (1–5) | Does the response answer the actual question? |
| **Completeness** | Qualitative (1–5) | Are all required points covered? |
| **Format Compliance** | Qualitative (1–5) | Does the response follow the requested output format? |
| **Overall Score** | Weighted average | `0.4×relevance + 0.3×completeness + 0.3×format` |
| **Latency (ms)** | Quantitative | Wall-clock time from API call to first byte |
| **Input Tokens** | Quantitative | Tokens in the prompt (from Gemini metadata) |
| **Output Tokens** | Quantitative | Tokens in the response |

### Scoring Rubric (1–5)

| Score | Meaning |
|-------|---------|
| 5 | Excellent — fully satisfies the criterion |
| 4 | Good — minor gaps |
| 3 | Adequate — partial satisfaction |
| 2 | Poor — significant deficiencies |
| 1 | Failing — criterion not met |

---

## Evaluation Approaches

### 1. Heuristic Evaluation (Automated)
- **Relevance**: keyword/n-gram overlap between prompt and response
- **Completeness**: response length thresholds (penalize < 100 words, reward > 300)
- **Format**: presence of format-related keywords (e.g., "step", numbered lists, JSON braces)

Heuristics are fast and consistent but cannot assess factual accuracy or nuanced quality.

### 2. LLM-as-Judge (Optional)
Send a structured scoring request to Gemini:
```
Given the following prompt and response, score on a 1–5 scale:
- Relevance
- Completeness
- Format compliance

Return JSON: {"relevance": X, "completeness": X, "format": X, "feedback": "..."}
```

LLM judges can be biased toward longer responses or their own style. Always cross-check a subset against human review.

### 3. Human Review (Recommended Subset)
For academic credibility, manually review 5–10 experiments and compare human scores to automated scores. Document any systematic discrepancies.

---

## Benchmark Task Set

Run experiments on these 12 predefined tasks to generate reproducible results:

| # | Task | Category | Expected Format |
|---|------|----------|----------------|
| 1 | Explain machine learning | Explanation | Step-by-step |
| 2 | Summarize the causes of World War I | Summarization | Bullet points |
| 3 | Write a Python function to sort a list | Coding | Code block |
| 4 | Extract named entities from a paragraph | Structured Data | JSON |
| 5 | Compare supervised vs unsupervised learning | Comparison | Table |
| 6 | Explain neural networks to a 10-year-old | Explanation | Paragraph |
| 7 | Write a SQL query to find duplicate emails | Coding | Code block |
| 8 | Summarize the key points of a research abstract | Summarization | Bullet points |
| 9 | What is the difference between HTTP and HTTPS? | Explanation | Paragraph |
| 10 | Generate a weekly study schedule | Structured Data | Table |
| 11 | Write a regex to validate email addresses | Coding | Code + explanation |
| 12 | Explain gradient descent intuitively | Explanation | Step-by-step |

---

## Expected Hypothesis

> **H1**: Prompt-engineered prompts will score higher on relevance and format compliance than raw prompts.
> 
> **H2**: Adding context (audience, goal, constraints) to an already-optimized prompt will further improve completeness scores.
>
> **H3**: Role-based prompting will produce longer and more structured responses, but context-aware prompting will produce the most targeted responses for specialized audiences.

---

## Validity Threats & Mitigations

| Threat | Mitigation |
|--------|-----------|
| Gemini's non-determinism | Use temperature=0.3 for benchmarks to reduce variance |
| Heuristic bias toward length | Normalize completeness score; manually review outliers |
| Order effects | Always run original prompt first to avoid Gemini caching |
| LLM judge bias | Only use as supplemental; primary evaluation is heuristic |
| Small sample size | 12 tasks × 3 conditions = 36 evaluations is a minimal but defensible set |

