## 재무제표 분석 리포트 생성기

.PHONY: install backend frontend test

install:
	@echo ">>> Python 패키지 설치 (uv)"
	uv sync
	@echo ">>> Frontend 패키지 설치"
	cd frontend && npm install

backend:
	@echo ">>> Backend 서버 시작 (http://localhost:8000)"
	uv run uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	@echo ">>> Frontend 개발 서버 시작 (http://localhost:5173)"
	cd frontend && npm run dev

test:
	uv run pytest tests/ -v

dev:
	@echo ">>> 백엔드 + 프론트엔드 동시 실행"
	@trap 'kill 0' EXIT; \
	uv run uvicorn backend.api.main:app --reload --port 8000 & \
	cd frontend && npm run dev & \
	wait
