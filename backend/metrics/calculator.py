import pandas as pd
import numpy as np
from dataclasses import dataclass


@dataclass
class FinancialMetrics:
    # 성장성 지표
    revenue_growth: float | None = None
    operating_profit_growth: float | None = None
    net_profit_growth: float | None = None
    asset_growth: float | None = None

    # 수익성 지표
    gross_margin: float | None = None
    operating_margin: float | None = None
    net_margin: float | None = None
    roe: float | None = None
    roa: float | None = None
    ebitda_margin: float | None = None

    # 안정성 지표
    current_ratio: float | None = None
    quick_ratio: float | None = None
    debt_to_equity: float | None = None
    interest_coverage: float | None = None
    debt_ratio: float | None = None

    # 활동성 지표
    asset_turnover: float | None = None
    inventory_turnover: float | None = None
    receivables_turnover: float | None = None

    # 절대값 (단위: 억원)
    revenue: float | None = None
    operating_profit: float | None = None
    net_profit: float | None = None
    total_assets: float | None = None
    total_equity: float | None = None
    total_debt: float | None = None
    ebitda: float | None = None


def _safe_div(numerator, denominator, scale: float = 1.0) -> float | None:
    try:
        if denominator == 0 or denominator is None or pd.isna(denominator):
            return None
        result = (float(numerator) / float(denominator)) * scale
        return round(result, 2)
    except (TypeError, ValueError, ZeroDivisionError):
        return None


def _to_uk(value) -> float | None:
    """단위를 억원으로 변환 (DART는 원 단위)"""
    try:
        v = float(value)
        return round(v / 1e8, 2)
    except (TypeError, ValueError):
        return None


def parse_dart_financials(dart_data: dict) -> dict[str, float | None]:
    """DART API 응답에서 주요 재무 항목 파싱"""
    items = dart_data.get("list", [])
    result = {}

    # 계정과목 매핑
    account_map = {
        "ifrs-full_Revenue": "revenue",
        "ifrs-full_GrossProfit": "gross_profit",
        "ifrs-full_ProfitLossFromOperatingActivities": "operating_profit",
        "dart_OperatingIncomeLoss": "operating_profit",
        "ifrs-full_ProfitLoss": "net_profit",
        "ifrs-full_Assets": "total_assets",
        "ifrs-full_Liabilities": "total_liabilities",
        "ifrs-full_Equity": "total_equity",
        "ifrs-full_CurrentAssets": "current_assets",
        "ifrs-full_CurrentLiabilities": "current_liabilities",
        "ifrs-full_Inventories": "inventories",
        "ifrs-full_TradeAndOtherCurrentReceivables": "receivables",
        "ifrs-full_CashAndCashEquivalents": "cash",
        "ifrs-full_DepreciationAndAmortisationExpense": "depreciation",
        "dart_DepreciationCosts": "depreciation",
        "ifrs-full_FinanceCosts": "finance_costs",
        "ifrs-full_IncomeTaxExpense": "tax_expense",
    }

    for item in items:
        sj_div = item.get("sj_div", "")  # BS=재무상태표, IS=손익계산서, CF=현금흐름
        account_id = item.get("account_id", "")
        account_nm = item.get("account_nm", "")
        amount_str = item.get("thstrm_amount", "0") or "0"

        amount = None
        try:
            amount = float(amount_str.replace(",", "").replace(" ", ""))
        except ValueError:
            continue

        # ID 기반 매핑
        for dart_id, key in account_map.items():
            if account_id == dart_id and key not in result:
                result[key] = amount
                break

        # 계정명 기반 폴백 매핑
        if "매출액" in account_nm and "revenue" not in result:
            result["revenue"] = amount
        elif "영업이익" in account_nm and "operating_profit" not in result:
            result["operating_profit"] = amount
        elif "당기순이익" in account_nm and "net_profit" not in result:
            result["net_profit"] = amount
        elif account_nm in ("자산총계", "자산 합계") and "total_assets" not in result:
            result["total_assets"] = amount
        elif account_nm in ("부채총계", "부채 합계") and "total_liabilities" not in result:
            result["total_liabilities"] = amount
        elif account_nm in ("자본총계", "자본 합계") and "total_equity" not in result:
            result["total_equity"] = amount
        elif "유동자산" in account_nm and "current_assets" not in result:
            result["current_assets"] = amount
        elif "유동부채" in account_nm and "current_liabilities" not in result:
            result["current_liabilities"] = amount

    return result


def calculate_metrics(
    current: dict[str, float | None],
    previous: dict[str, float | None] | None = None,
) -> FinancialMetrics:
    """재무 지표 계산 (LLM은 이 결과만 사용)"""
    m = FinancialMetrics()

    # 절대값 (억원)
    m.revenue = _to_uk(current.get("revenue"))
    m.operating_profit = _to_uk(current.get("operating_profit"))
    m.net_profit = _to_uk(current.get("net_profit"))
    m.total_assets = _to_uk(current.get("total_assets"))
    m.total_equity = _to_uk(current.get("total_equity"))
    total_liabilities = current.get("total_liabilities")
    m.total_debt = _to_uk(total_liabilities)

    # EBITDA = 영업이익 + 감가상각비
    dep = current.get("depreciation", 0) or 0
    op = current.get("operating_profit") or 0
    ebitda_raw = op + dep
    m.ebitda = _to_uk(ebitda_raw)

    # 수익성
    revenue = current.get("revenue")
    gross_profit = current.get("gross_profit")
    m.gross_margin = _safe_div(gross_profit, revenue, 100)
    m.operating_margin = _safe_div(current.get("operating_profit"), revenue, 100)
    m.net_margin = _safe_div(current.get("net_profit"), revenue, 100)
    m.roe = _safe_div(current.get("net_profit"), current.get("total_equity"), 100)
    m.roa = _safe_div(current.get("net_profit"), current.get("total_assets"), 100)
    m.ebitda_margin = _safe_div(ebitda_raw, revenue, 100)

    # 안정성
    m.current_ratio = _safe_div(current.get("current_assets"), current.get("current_liabilities"), 100)
    cash = current.get("cash", 0) or 0
    inv = current.get("inventories", 0) or 0
    current_assets = current.get("current_assets", 0) or 0
    current_liab = current.get("current_liabilities")
    m.quick_ratio = _safe_div(current_assets - inv, current_liab, 100)
    m.debt_to_equity = _safe_div(total_liabilities, current.get("total_equity"), 100)
    total_assets = current.get("total_assets")
    m.debt_ratio = _safe_div(total_liabilities, total_assets, 100)
    finance_costs = current.get("finance_costs")
    m.interest_coverage = _safe_div(current.get("operating_profit"), finance_costs)

    # 활동성
    m.asset_turnover = _safe_div(revenue, total_assets)
    m.inventory_turnover = _safe_div(revenue, current.get("inventories"))
    m.receivables_turnover = _safe_div(revenue, current.get("receivables"))

    # 성장성 (전년도 비교)
    if previous:
        prev_revenue = previous.get("revenue")
        prev_op = previous.get("operating_profit")
        prev_np = previous.get("net_profit")
        prev_assets = previous.get("total_assets")

        m.revenue_growth = _safe_div(
            (current.get("revenue", 0) or 0) - (prev_revenue or 0), prev_revenue, 100
        ) if prev_revenue else None
        m.operating_profit_growth = _safe_div(
            (current.get("operating_profit", 0) or 0) - (prev_op or 0), prev_op, 100
        ) if prev_op else None
        m.net_profit_growth = _safe_div(
            (current.get("net_profit", 0) or 0) - (prev_np or 0), prev_np, 100
        ) if prev_np else None
        m.asset_growth = _safe_div(
            (current.get("total_assets", 0) or 0) - (prev_assets or 0), prev_assets, 100
        ) if prev_assets else None

    return m
