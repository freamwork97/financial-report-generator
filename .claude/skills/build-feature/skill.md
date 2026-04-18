---
name: build-feature
description: 재무 리포트 생성기에 새 기능을 풀스택으로 구현할 때 반드시 사용. "새 기능 추가", "기능 구현", "~기능 만들어줘", "데이터-지표-API-프론트 전체 구현" 요청 시 이 스킬을 사용할 것. 에이전트 팀을 구성하여 레이어별로 병렬 구현 후 QA 검증까지 보장한다.
---

# Build Feature Orchestrator

재무 리포트 생성기의 기능을 에이전트 팀으로 풀스택 구현하는 오케스트레이터.

## 실행 모드: 에이전트 팀

## 에이전트 구성

| 팀원 | 에이전트 파일 | 역할 | 출력 |
|------|------------|------|------|
| data-agent | `.claude/agents/data-agent.md` | DART/yfinance 데이터 레이어 | `_workspace/01_data_spec.md` |
| metrics-agent | `.claude/agents/metrics-agent.md` | 재무 지표 계산 | `_workspace/02_metrics_impl.md` |
| api-agent | `.claude/agents/api-agent.md` | FastAPI 엔드포인트 + 프롬프트 | `_workspace/03_api_impl.md` |
| frontend-agent | `.claude/agents/frontend-agent.md` | React 컴포넌트 | `_workspace/04_frontend_impl.md` |
| qa-agent | `.claude/agents/qa-agent.md` | 통합 검증 | `_workspace/05_qa_report.md` |

## 워크플로우

### Phase 1: 요구사항 분석

1. 사용자 요청에서 다음을 파악:
   - 어떤 데이터가 필요한가? (새 DART 계정? yfinance 필드?)
   - 새 재무 지표인가 아니면 기존 지표 활용인가?
   - API 엔드포인트 추가/수정이 필요한가?
   - 프론트엔드 변경 범위 (새 컴포넌트? 기존 컴포넌트 수정?)

2. `_workspace/` 디렉토리 생성, `_workspace/00_requirements.md`에 분석 결과 저장

### Phase 2: 팀 구성 및 작업 할당

```
TeamCreate(
  team_name: "feature-build-team",
  members: [
    { name: "data-agent", agent_type: "general-purpose", model: "opus",
      prompt: ".claude/agents/data-agent.md 참조. 요구사항: _workspace/00_requirements.md" },
    { name: "metrics-agent", agent_type: "general-purpose", model: "opus",
      prompt: ".claude/agents/metrics-agent.md 참조. 요구사항: _workspace/00_requirements.md" },
    { name: "api-agent", agent_type: "general-purpose", model: "opus",
      prompt: ".claude/agents/api-agent.md 참조. 요구사항: _workspace/00_requirements.md" },
    { name: "frontend-agent", agent_type: "general-purpose", model: "opus",
      prompt: ".claude/agents/frontend-agent.md 참조. 요구사항: _workspace/00_requirements.md" },
    { name: "qa-agent", agent_type: "general-purpose", model: "opus",
      prompt: ".claude/agents/qa-agent.md 참조. 모든 레이어 구현 완료 후 검증 시작" }
  ]
)
```

작업 등록:
```
TaskCreate(tasks: [
  { title: "데이터 레이어 구현", assignee: "data-agent" },
  { title: "재무 지표 계산 구현", assignee: "metrics-agent", depends_on: ["데이터 레이어 구현"] },
  { title: "API 엔드포인트 구현", assignee: "api-agent", depends_on: ["재무 지표 계산 구현"] },
  { title: "프론트엔드 컴포넌트 구현", assignee: "frontend-agent", depends_on: ["API 엔드포인트 구현"] },
  { title: "통합 QA 검증", assignee: "qa-agent", depends_on: ["프론트엔드 컴포넌트 구현"] }
])
```

### Phase 3: 구현

**데이터 의존성 체인 (순서 중요):**
```
data-agent → metrics-agent → api-agent → frontend-agent
                                    ↓
                              qa-agent (마지막)
```

**팀원 간 통신 규칙:**
- data-agent가 새 파서 완료 → metrics-agent에게 SendMessage("데이터 스펙 준비됨, `_workspace/01_data_spec.md` 확인")
- metrics-agent가 새 지표 완료 → api-agent에게 SendMessage("FinancialMetrics 필드 추가됨, 스키마 동기화 필요")
- api-agent가 엔드포인트 완료 → frontend-agent에게 SendMessage("엔드포인트 URL과 응답 shape `_workspace/03_api_impl.md`에 있음")
- 모든 레이어 완료 → qa-agent에게 SendMessage("구현 완료, 검증 시작해줘")

**산출물 저장:**
각 에이전트는 구현 완료 후 변경한 파일 목록과 주요 결정사항을 `_workspace/{번호}_{에이전트}_{artifact}.md`에 기록.

### Phase 4: QA 검증

qa-agent가 수행:
1. `uv run pytest tests/ -v` 실행 및 결과 확인
2. API 스키마 ↔ 프론트 참조 경계면 비교
3. LLM 프롬프트 감사 (계산 지시 없음 확인)
4. `_workspace/05_qa_report.md`에 결과 저장

버그 발견 시:
- 해당 에이전트에게 즉시 SendMessage로 수정 요청
- 수정 완료 후 재검증

### Phase 5: 정리

1. 팀원들에게 종료 알림 (SendMessage to "all")
2. TeamDelete
3. `_workspace/` 보존
4. 사용자에게 요약: 변경 파일 목록, 새 기능 사용법

## 에러 핸들링

| 상황 | 대응 |
|------|------|
| DART 계정명 없음 | data-agent가 기존 계정명 목록 덤프, metrics-agent와 협의 |
| 테스트 실패 | qa-agent가 failing test를 해당 에이전트에게 전달, 수정 후 재실행 |
| 프론트 렌더 에러 | frontend-agent가 null 처리 패턴 재점검 |
| LLM 프롬프트 계산 감지 | api-agent에게 즉시 SendMessage, 프롬프트 수정 필수 |

## 테스트 시나리오

**정상 흐름:** "섹터 평균 대비 PBR 비교 기능 추가" 요청
1. data-agent: yfinance에서 섹터 데이터 수집 방법 확인
2. metrics-agent: PBR = 시가총액 / 자본총계 계산 추가
3. api-agent: `/api/metrics` 응답에 sector_pbr 필드 추가
4. frontend-agent: 섹터 비교 바 차트 컴포넌트 추가
5. qa-agent: 전체 검증 → PASS

**에러 흐름:** metrics-agent가 계산한 필드명과 api-agent 스키마 불일치
1. qa-agent가 경계면 검증 중 발견
2. api-agent에게 SendMessage("schemas.py에 `sector_pbr` 필드 없음")
3. api-agent 수정 → qa-agent 재검증 → PASS
