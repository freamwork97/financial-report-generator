from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import get_settings
from backend.api.routes import router
from backend.api.pdf_routes import pdf_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="재무제표 분석 리포트 생성기",
        description="DART 데이터 기반 AI 재무 분석",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router)
    app.include_router(pdf_router)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.on_event("startup")
    async def preload_corp_list():
        import asyncio
        from backend.data.dart_client import DartClient
        async def _load():
            try:
                await DartClient()._load_corp_list()
            except Exception:
                pass
        asyncio.create_task(_load())

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api.main:app", host="0.0.0.0", port=8000, reload=True)
