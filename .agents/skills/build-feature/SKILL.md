---
name: build-feature
description: Use when implementing a full-stack feature in the financial report generator. Coordinates data, metrics, API, frontend, and QA work for features that cross multiple layers.
---

# Build Feature

Use this skill for new features that affect more than one layer of the financial report generator.

## Phase 1: Requirements

Identify:

- Required data: new DART account, yfinance field, or existing data
- Whether a new financial metric is needed
- API endpoint or schema changes
- Frontend scope: new component, existing component change, chart, or page
- Validation needed: unit test, API/frontend contract check, prompt audit, or manual verification

Create `_workspace/00_requirements.md` when the feature is large enough to need coordination.

## Phase 2: Agent Coordination

Codex custom agents are available as project-scoped TOML files in `.codex/agents/`.

Use subagents when the user asks for parallel work or when the feature has separable layer ownership:

- `data_agent`: DART/yfinance collection and cache behavior
- `metrics_agent`: DART parsing and financial metric calculation
- `api_agent`: FastAPI schemas, routes, streaming, and prompts
- `frontend_agent`: React, Recharts, TailwindCSS, and API consumption
- `qa_agent`: tests, contract checks, prompt audit, and cache consistency

Inferred design: Claude `TeamCreate`, `TaskCreate`, `SendMessage`, and `TeamDelete` map to Codex subagent spawning, follow-up messages, waiting for results, and closing completed agent threads. Codex documentation describes spawning and managing subagents, but not Claude's exact team/task primitives.

## Phase 3: Implementation Order

Use this dependency chain unless the local code proves a different order is safer:

```text
data -> metrics -> API -> frontend -> QA
```

Layer responsibilities:

- Data: document new raw inputs, parser assumptions, cache keys, TTL, and output shape.
- Metrics: calculate all numbers in Python, add tests, and define units.
- API: expose schema fields, route behavior, streaming output, and prompt injection.
- Frontend: render new data safely, handle loading and null states, and keep field names aligned.
- QA: run tests, compare API schema to frontend references, audit prompts for calculation requests, and report gaps.

## Phase 4: Artifacts

For coordinated work, keep concise notes in `_workspace/`:

- `_workspace/01_data_spec.md`
- `_workspace/02_metrics_impl.md`
- `_workspace/03_api_impl.md`
- `_workspace/04_frontend_impl.md`
- `_workspace/05_qa_report.md`

Each artifact should include changed files, important decisions, and any remaining risks.

## Phase 5: Verification

Run:

```bash
uv run pytest tests/ -v
```

Also verify:

- API schema fields match frontend metric references.
- Prompt text does not ask the LLM to calculate financial metrics.
- Frontend null handling prevents render errors.
- Cache hit and miss paths return compatible shapes.

## Error Handling

- Missing DART account: ask the data layer to provide available account names, then update the metrics mapping.
- Test failure: identify the owning layer and fix there before broad refactoring.
- API/frontend mismatch: synchronize `backend/api/schemas.py` and frontend field references.
- Prompt calculation request detected: update the prompt so it only consumes Python-computed values.
