---
name: add-metric
description: 새로운 재무 지표를 추가할 때 반드시 사용. "X 지표 추가", "새 지표 구현", "재무 지표에 Y 추가", "PBR/EPS/FCF 같은 지표 추가" 요청 시 이 스킬을 사용할 것. 계산기 → API 스키마 → 프론트엔드 카드까지 풀스택 추가 워크플로우를 보장한다.
---

# Add Metric Skill

재무 지표를 추가할 때 계산기부터 프론트엔드 표시까지 누락 없이 구현하는 워크플로우.

## 왜 이 스킬이 필요한가

지표를 추가할 때 실수가 발생하는 지점은 항상 같다: 계산기에는 추가했는데 API 스키마에 없거나, 프론트가 null을 처리하지 못해 크래시가 나거나, LLM 프롬프트에 "계산해줘"가 섞이는 것. 이 스킬은 그 4개 체크포인트를 순서대로 강제한다.

## 입력

사용자가 제공해야 하는 정보:
- 지표 이름 (한글/영문)
- 계산 공식 (예: "영업이익 ÷ 매출액 × 100")
- 표시 단위 (%, 배, 억원 등)
- DART에서 필요한 계정명 (없으면 기존 파싱 필드로 계산 가능한지 확인)

## 구현 순서 (순서 변경 금지)

### Step 1: 계산기 (`backend/metrics/calculator.py`)

1. `FinancialMetrics` 데이터클래스에 필드 추가:
   ```python
   new_metric: float | None = None
   ```

2. `calculate_metrics()`에 계산 로직 추가:
   ```python
   # _safe_div(분자, 분모, scale) 활용
   metrics.new_metric = _safe_div(current.get("분자계정"), current.get("분모계정"), 100)
   ```

3. DART 계정명이 `parse_dart_financials()`에 없으면 매핑 추가

**절대 금지:** `metrics.new_metric = llm_result["value"]` 형태의 LLM 주입

### Step 2: 테스트 (`tests/test_metrics.py`)

```python
def test_new_metric():
    current = {"분자계정": 100_0000_0000, "분모계정": 500_0000_0000}  # 억원 단위 아님, 원 단위
    metrics = calculate_metrics(current, None)
    assert metrics.new_metric == 20.0  # 예상값 수기 계산
    
def test_new_metric_none_safe():
    metrics = calculate_metrics({"분모계정": 0}, None)
    assert metrics.new_metric is None  # ZeroDivisionError 없음
```

테스트 실행: `uv run pytest tests/test_metrics.py -v`

### Step 3: API 스키마 (`backend/api/schemas.py`)

`MetricsResponse` 모델에 필드 추가:
```python
new_metric: float | None = None
```

### Step 4: LLM 프롬프트 (`backend/llm/prompts.py`)

필요하다면 새 지표를 프롬프트 템플릿의 지표 테이블에 추가:
```python
| {지표명} | {value:.2f}{단위} |
```

**주의:** 프롬프트에 "X를 계산해줘" 금지. 이미 계산된 값을 주입할 것.

### Step 5: 프론트엔드 (`frontend/src/components/MetricsDashboard.jsx`)

1. 지표 카드 추가:
   ```jsx
   <MetricCard
     label="{지표명}"
     value={metrics.new_metric}
     unit="{단위}"
     description="{설명}"
   />
   ```

2. null 처리: `value ?? "N/A"` 패턴 사용. `value` 자체를 렌더링하면 null일 때 크래시.

## 검증 체크리스트

모든 스텝 완료 후 확인:

- [ ] `FinancialMetrics`에 필드 추가됨
- [ ] `calculate_metrics()`에 `_safe_div` 기반 계산 추가됨
- [ ] None/0 분모 테스트 통과
- [ ] `MetricsResponse` 스키마에 필드 동기화
- [ ] LLM 프롬프트에 계산 지시 없음 (계산된 값 주입만)
- [ ] 프론트엔드에서 null 안전하게 표시
- [ ] `uv run pytest tests/ -v` 전체 통과
