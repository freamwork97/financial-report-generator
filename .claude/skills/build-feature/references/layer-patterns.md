# 레이어별 구현 패턴 레퍼런스

## DART API 계정명 정규화 패턴

DART의 `account_nm`은 연도/사업자마다 표현이 다를 수 있다.
안전한 매핑 방법:

```python
ACCOUNT_MAP = {
    "revenue": ["매출액", "수익(매출액)", "영업수익"],
    "operating_profit": ["영업이익", "영업이익(손실)"],
    "net_profit": ["당기순이익", "당기순이익(손실)", "분기순이익"],
    "total_assets": ["자산총계"],
    "total_equity": ["자본총계"],
    "total_debt": ["부채총계"],
    "current_assets": ["유동자산"],
    "current_liabilities": ["유동부채"],
}

def find_account(items: list, keys: list[str]) -> float | None:
    for item in items:
        if item.get("account_nm") in keys:
            val = item.get("thstrm_amount", "").replace(",", "")
            return float(val) / 1e8 if val else None
    return None
```

## yfinance 시장 데이터 필드

```python
info = ticker.info
# 주요 필드
info["marketCap"]        # 시가총액 (원)
info["trailingPE"]       # PER (후행)
info["forwardPE"]        # PER (선행)
info["priceToBook"]      # PBR
info["trailingEps"]      # EPS
info["dividendYield"]    # 배당수익률
info["sector"]           # 섹터
info["industry"]         # 산업
```

## FastAPI SSE 스트리밍 패턴

```python
from fastapi.responses import StreamingResponse

async def generate():
    async for chunk in stream_analysis(...):
        yield f"data: {json.dumps({'text': chunk}, ensure_ascii=False)}\n\n"
    yield "data: [DONE]\n\n"

return StreamingResponse(generate(), media_type="text/event-stream",
    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
```

## React SSE 소비 패턴

```js
const response = await fetch('/api/analyze/stream', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(requestData)
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  const lines = text.split('\n').filter(l => l.startsWith('data: '));
  for (const line of lines) {
    const data = line.slice(6);
    if (data === '[DONE]') return;
    const { text: chunk } = JSON.parse(data);
    setAnalysis(prev => prev + chunk);
  }
}
```

## WeasyPrint PDF 생성 패턴

```python
# pdf/generator.py
from weasyprint import HTML, CSS

def generate_pdf(html_content: str, output_path: str):
    HTML(string=html_content).write_pdf(
        output_path,
        stylesheets=[CSS(filename='pdf/templates/report.css')]
    )
```

PDF용 HTML 템플릿은 `pdf/templates/`에 위치.
