# Financial Report Generator

## Repository Overview

This repository builds an automated corporate financial statement analysis report generator.

- `backend/data/`: DART OpenAPI collection, yfinance market data collection, and SQLite caching
- `backend/metrics/`: financial statement parsing and financial metric calculation
- `backend/llm/`: Claude API client, streaming, and prompt templates
- `backend/api/`: FastAPI routes, request/response schemas, and PDF endpoints
- `frontend/`: React 18 dashboard with Recharts and TailwindCSS
- `pdf/`: WeasyPrint PDF generation
- `tests/`: unit and integration tests

## Technology Stack

- Backend: Python 3.11, FastAPI, pandas, numpy, uv
- Data: DART OpenAPI, yfinance
- LLM: Anthropic Claude API
- Frontend: React 18, Recharts, TailwindCSS
- PDF: WeasyPrint
- Database/cache: SQLite

## Core Rules

- Never ask the LLM to calculate financial numbers. Python code must calculate every numeric financial metric before values are sent to prompts.
- Display financial ratios and percentages rounded to 2 decimal places.
- Cache DART API responses in SQLite to avoid duplicate external calls.
- Return LLM analysis from FastAPI endpoints as a streaming response.
- Keep API response schemas and frontend field access synchronized.
- Treat `null` metric values as valid missing data; frontend code must render them safely as `N/A` or an equivalent user-facing fallback.

## Workflow

- Before editing, inspect the owning layer and nearby tests.
- Keep changes scoped to the requested layer unless the contract requires cross-layer updates.
- When adding or changing a financial metric, update the calculator, tests, API schema, prompt table if needed, and frontend display together.
- When changing data collection, preserve cache-first behavior and document any new input or output shape for the metrics/API layer.
- When changing API responses, verify the frontend references the same field names.
- When changing prompts, audit that prompts only receive already-computed values and do not contain calculation requests such as "calculate" or "derive".

## Validation

- Run targeted tests for the changed layer.
- For metric or cross-layer changes, run:

```bash
uv run pytest tests/ -v
```

- For API/frontend boundary changes, compare `backend/api/schemas.py` fields with frontend `metrics.*` references.
- If validation cannot be run, report the command that was skipped and why.

## Output Expectations

- Summaries must list changed files and behavioral impact.
- For failures, include the exact failing command or check, the observed result, and the next required fix.
- Do not claim a metric is verified unless Python tests or an explicit manual calculation check confirms it.

## Project Task State

The previous Claude shared task list contained this completed item:

| id | task | status | owner |
| --- | --- | --- | --- |
| 2 | 재무지표 사전 페이지 구축 | completed | metrics-agent |
