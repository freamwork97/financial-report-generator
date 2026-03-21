from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from urllib.parse import quote
import tempfile
import os

from backend.api.schemas import ReportRequest
from backend.data.dart_client import DartClient
from backend.data.yfinance_client import YFinanceClient
from backend.metrics.calculator import parse_dart_financials, calculate_metrics
from backend.llm.claude_client import stream_analysis
def generate_pdf(*args, **kwargs):
    from pdf.generator import generate_pdf as _generate_pdf
    return _generate_pdf(*args, **kwargs)

pdf_router = APIRouter(prefix="/api")
dart = DartClient()
yf_client = YFinanceClient()


@pdf_router.post("/report/pdf")
async def generate_report_pdf(req: ReportRequest):
    """PDF 리포트 생성"""
    current_data = await dart.get_financial_statements(req.corp_code, req.year)
    if current_data.get("status") != "000":
        raise HTTPException(404, "재무제표 조회 실패")

    current = parse_dart_financials(current_data)
    try:
        prev_data = await dart.get_financial_statements(req.corp_code, req.year - 1)
        previous = parse_dart_financials(prev_data) if prev_data.get("status") == "000" else None
    except Exception:
        previous = None

    metrics = calculate_metrics(current, previous)

    try:
        market_data = await yf_client.get_market_data(req.stock_code)
        price_data = await yf_client.get_stock_price(req.stock_code, "1y")
        price_history = price_data.get("prices", [])
    except Exception:
        market_data = {}
        price_history = []

    # LLM 분석 전체 텍스트 수집
    analysis_parts = []
    async for chunk in stream_analysis(req.company_name, req.year, metrics, market_data):
        analysis_parts.append(chunk)
    analysis_text = "".join(analysis_parts)

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        output_path = tmp.name

    generate_pdf(req.company_name, req.year, metrics, analysis_text, price_history, output_path)

    filename = f"{req.company_name}_{req.year}_재무분석리포트.pdf"
    encoded_filename = quote(filename)
    return FileResponse(
        output_path,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"},
    )
