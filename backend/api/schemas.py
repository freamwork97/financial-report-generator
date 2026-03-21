from pydantic import BaseModel
from typing import Optional


class CompanySearchRequest(BaseModel):
    query: str  # 회사명 또는 종목코드


class ReportRequest(BaseModel):
    corp_code: str
    stock_code: str  # yfinance 용 (예: "005930.KS")
    year: int
    company_name: str


class CompanyInfo(BaseModel):
    corp_code: str
    corp_name: str
    stock_code: Optional[str] = None
    modify_date: Optional[str] = None


class MetricsResponse(BaseModel):
    revenue: Optional[float] = None
    operating_profit: Optional[float] = None
    net_profit: Optional[float] = None
    total_assets: Optional[float] = None
    total_equity: Optional[float] = None
    total_debt: Optional[float] = None
    ebitda: Optional[float] = None
    gross_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    net_margin: Optional[float] = None
    roe: Optional[float] = None
    roa: Optional[float] = None
    ebitda_margin: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    interest_coverage: Optional[float] = None
    debt_ratio: Optional[float] = None
    asset_turnover: Optional[float] = None
    revenue_growth: Optional[float] = None
    operating_profit_growth: Optional[float] = None
    net_profit_growth: Optional[float] = None
    asset_growth: Optional[float] = None
