import anthropic
from backend.config import get_settings
from backend.llm.prompts import build_analysis_prompt
from backend.metrics.calculator import FinancialMetrics
from typing import AsyncIterator


async def stream_analysis(
    company_name: str,
    year: int,
    metrics: FinancialMetrics,
    market_data: dict,
) -> AsyncIterator[str]:
    """Claude API로 재무 분석 스트리밍"""
    client = anthropic.AsyncAnthropic(api_key=get_settings().anthropic_api_key)
    prompt = build_analysis_prompt(company_name, year, metrics, market_data)

    async with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        async for text in stream.text_stream:
            yield text
