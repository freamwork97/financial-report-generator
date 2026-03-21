# 기업 재무제표 자동 분석 리포트 생성기

## 프로젝트 구조
financial-report-generator/
├── backend/
│   ├── data/          # DART API 수집, yfinance
│   ├── metrics/       # 재무 지표 계산 엔진
│   ├── llm/           # Claude API 프롬프트 + 스트리밍
│   └── api/           # FastAPI 엔드포인트
├── frontend/          # React + Recharts 대시보드
├── pdf/               # WeasyPrint PDF 생성
└── tests/

## 기술 스택
- Backend: Python 3.11, FastAPI, pandas, numpy, uv
- Data: DART OpenAPI, yfinance
- LLM: Anthropic Claude API (claude-sonnet-4-6)
- Frontend: React 18, Recharts, TailwindCSS
- PDF: WeasyPrint
- DB: SQLite (캐시)

## 핵심 원칙
- LLM은 절대 숫자를 계산하지 않는다. Python이 계산한 값만 주입한다.
- 모든 재무 지표는 소수점 2자리까지 반올림해서 표시한다.
- DART API 응답은 SQLite에 캐싱해 중복 호출을 방지한다.
- FastAPI 엔드포인트는 LLM 분석을 스트리밍으로 반환한다.

## 공유 태스크 리스트
에이전트는 태스크를 시작할 때 status를 in_progress로,
완료 시 completed로 업데이트한다.