---
name: add-metric
description: Use when adding a new financial metric such as PBR, EPS, FCF, or any requested metric field. Ensures the calculator, tests, API schema, prompt table, and frontend metric card stay synchronized.
---

# Add Metric

Use this skill whenever the user asks to add or implement a financial metric.

## Required Inputs

Collect or infer these before implementation:

- Metric display name in Korean or English
- Formula, for example operating profit / revenue * 100
- Display unit, for example %, times, or hundred-million KRW
- Required DART account names, or confirmation that existing parsed fields are enough

If any input is missing, inspect existing code first. Ask the user only when the formula or intended meaning cannot be safely inferred.

## Implementation Steps

Follow this order.

1. Update `backend/metrics/calculator.py`.
   - Add a `float | None = None` field to `FinancialMetrics`.
   - Add calculation logic in `calculate_metrics()`.
   - Use `_safe_div(numerator, denominator, scale)` for division.
   - Add DART account-name mapping in `parse_dart_financials()` if the source account is not already parsed.
   - Never assign metric values from LLM output.

2. Update `tests/test_metrics.py`.
   - Add a normal-case test with a manually computed expected value.
   - Add a None or zero-denominator test that expects `None`.
   - Run `uv run pytest tests/test_metrics.py -v`.

3. Update `backend/api/schemas.py`.
   - Add the metric field to the response schema using `float | None = None` or the project's existing Pydantic style.

4. Update `backend/llm/prompts.py` only if the report should mention the new metric.
   - Inject the already-computed metric value.
   - Do not add text that asks the LLM to calculate, derive, or recompute the metric.

5. Update `frontend/src/components/MetricsDashboard.jsx`.
   - Add a metric card with the new field, unit, and short description.
   - Render null safely as `N/A` or with the existing project fallback.

## Verification Checklist

- `FinancialMetrics` contains the new field.
- `calculate_metrics()` computes the value in Python.
- None and zero-denominator behavior is tested.
- API schema exposes the new field.
- Prompt text contains no metric calculation request.
- Frontend displays the value and handles null safely.
- `uv run pytest tests/ -v` passes, or the failure is reported with exact details.
