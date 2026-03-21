from dataclasses import asdict
from backend.metrics.calculator import FinancialMetrics


def build_analysis_prompt(
    company_name: str,
    year: int,
    metrics: FinancialMetrics,
    market_data: dict,
) -> str:
    m = {k: v for k, v in asdict(metrics).items() if v is not None}

    def fmt(key: str, unit: str = "") -> str:
        val = m.get(key)
        if val is None:
            return "N/A"
        return f"{val:,.2f}{unit}"

    prompt = f"""당신은 전문 기업 재무 분석가입니다. 아래 재무 데이터를 바탕으로 {company_name}의 {year}년 재무제표를 분석하세요.

## 중요 규칙
- 아래 제공된 숫자만 사용하세요. 절대 직접 계산하지 마세요.
- 모든 수치는 소수점 2자리까지 표시하세요.
- 한국어로 작성하세요.
- 구체적인 수치를 인용하며 분석하세요.

## 재무 데이터 ({year}년 기준)

### 규모 (단위: 억원)
- 매출액: {fmt('revenue', '억원')}
- 영업이익: {fmt('operating_profit', '억원')}
- 당기순이익: {fmt('net_profit', '억원')}
- 자산총계: {fmt('total_assets', '억원')}
- 자본총계: {fmt('total_equity', '억원')}
- EBITDA: {fmt('ebitda', '억원')}

### 수익성 지표
- 매출총이익률: {fmt('gross_margin', '%')}
- 영업이익률: {fmt('operating_margin', '%')}
- 순이익률: {fmt('net_margin', '%')}
- ROE: {fmt('roe', '%')}
- ROA: {fmt('roa', '%')}
- EBITDA 마진: {fmt('ebitda_margin', '%')}

### 안정성 지표
- 유동비율: {fmt('current_ratio', '%')}
- 당좌비율: {fmt('quick_ratio', '%')}
- 부채비율: {fmt('debt_to_equity', '%')}
- 이자보상배율: {fmt('interest_coverage', '배')}

### 성장성 지표
- 매출 성장률: {fmt('revenue_growth', '%')}
- 영업이익 성장률: {fmt('operating_profit_growth', '%')}
- 순이익 성장률: {fmt('net_profit_growth', '%')}

### 시장 지표
- PER: {market_data.get('pe_ratio', 'N/A')}배
- PBR: {market_data.get('pb_ratio', 'N/A')}배
- 시가총액: {f"{market_data.get('market_cap', 0)/1e8:,.0f}억원" if market_data.get('market_cap') else 'N/A'}

## 분석 항목 (각 항목을 상세히 작성하세요)

### 1. 종합 평가 (3-4문장)
전반적인 재무 건전성과 사업 성과를 평가하세요.

### 2. 수익성 분석
수익성 지표를 해석하고, 업종 평균 대비 수준을 논의하세요.

### 3. 성장성 분석
전년도 대비 성장률을 분석하고, 성장 동력과 리스크를 제시하세요.

### 4. 안정성 분석
재무 안정성과 부채 수준, 단기 유동성 위험을 평가하세요.

### 5. 투자 시사점
투자자 관점에서 매력도와 주의사항을 제시하세요.

### 6. 리스크 요인
주요 재무적 리스크를 3가지 이상 제시하세요.
"""
    return prompt
