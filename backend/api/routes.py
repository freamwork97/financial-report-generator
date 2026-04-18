from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from dataclasses import asdict
import json

from backend.api.schemas import ReportRequest, MetricsResponse
from backend.data.dart_client import DartClient
from backend.data.yfinance_client import YFinanceClient
from backend.metrics.calculator import parse_dart_financials, calculate_metrics
from backend.llm.claude_client import stream_analysis

router = APIRouter(prefix="/api")
dart = DartClient()
yf_client = YFinanceClient()


@router.get("/search")
async def search_company(q: str = Query(..., description="회사명")):
    """DART 기업 검색"""
    results = await dart.search_company(q)
    return {"results": results[:20]}


@router.post("/metrics")
async def get_metrics(req: ReportRequest):
    """재무 지표 계산 (Python만 계산)"""
    # 당기
    current_data = await dart.get_financial_statements(req.corp_code, req.year, req.report_code)
    if current_data.get("status") != "000":
        raise HTTPException(404, f"재무제표 조회 실패: {current_data.get('message', '')}")
    current = parse_dart_financials(current_data)
    fs_div = current_data.get("_fs_div")

    # 전기 (동일 분기 전년도)
    try:
        prev_data = await dart.get_financial_statements(
            req.corp_code,
            req.year - 1,
            req.report_code,
            fs_div=fs_div,
        )
        previous = parse_dart_financials(prev_data) if prev_data.get("status") == "000" else None
    except Exception:
        previous = None

    metrics = calculate_metrics(current, previous)

    # 시장 데이터
    try:
        market_data = await yf_client.get_market_data(req.stock_code)
    except Exception:
        market_data = {}

    # 주가 데이터
    try:
        price_data = await yf_client.get_stock_price(req.stock_code, period="1y")
    except Exception:
        price_data = {"prices": []}

    return {
        "metrics": asdict(metrics),
        "market_data": market_data,
        "price_history": price_data.get("prices", []),
        "raw_financials": {k: v for k, v in current.items() if v is not None},
        "statement_info": {
            "requested_year": req.year,
            "resolved_year": current_data.get("_resolved_year", req.year),
            "fs_div": fs_div,
            "fs_div_label": current_data.get("_fs_div_label"),
        },
    }


@router.post("/analyze/stream")
async def analyze_stream(req: ReportRequest):
    """LLM 스트리밍 분석 (SSE)"""
    # 재무 지표 계산
    current_data = await dart.get_financial_statements(req.corp_code, req.year, req.report_code)
    if current_data.get("status") != "000":
        raise HTTPException(404, "재무제표 조회 실패")
    current = parse_dart_financials(current_data)
    fs_div = current_data.get("_fs_div")

    try:
        prev_data = await dart.get_financial_statements(
            req.corp_code,
            req.year - 1,
            req.report_code,
            fs_div=fs_div,
        )
        previous = parse_dart_financials(prev_data) if prev_data.get("status") == "000" else None
    except Exception:
        previous = None

    metrics = calculate_metrics(current, previous)

    try:
        market_data = await yf_client.get_market_data(req.stock_code)
    except Exception:
        market_data = {}

    async def generate():
        async for chunk in stream_analysis(req.company_name, req.year, metrics, market_data, req.report_code):
            yield f"data: {json.dumps({'text': chunk}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/price/{stock_code}")
async def get_price(stock_code: str, period: str = "1y"):
    """주가 데이터 조회"""
    data = await yf_client.get_stock_price(stock_code, period)
    return data
