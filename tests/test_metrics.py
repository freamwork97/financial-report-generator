import pytest
from backend.metrics.calculator import calculate_metrics, _safe_div, _to_uk


def test_safe_div_normal():
    assert _safe_div(100, 200, 100) == 50.0


def test_safe_div_zero_denominator():
    assert _safe_div(100, 0) is None


def test_safe_div_none_denominator():
    assert _safe_div(100, None) is None


def test_to_uk():
    assert _to_uk(1_000_000_000_000) == 10000.0  # 1조 = 10000억원


def test_calculate_metrics_basic():
    current = {
        "revenue": 1_000_000_000_000,  # 1조원
        "gross_profit": 300_000_000_000,
        "operating_profit": 150_000_000_000,
        "net_profit": 100_000_000_000,
        "total_assets": 2_000_000_000_000,
        "total_liabilities": 800_000_000_000,
        "total_equity": 1_200_000_000_000,
        "current_assets": 500_000_000_000,
        "current_liabilities": 300_000_000_000,
        "cash": 100_000_000_000,
        "inventories": 50_000_000_000,
        "depreciation": 30_000_000_000,
        "finance_costs": 10_000_000_000,
    }

    m = calculate_metrics(current)

    assert m.revenue == 10000.0
    assert m.operating_margin == 15.0
    assert m.net_margin == 10.0
    assert m.gross_margin == 30.0
    assert m.roe is not None
    assert m.debt_to_equity is not None
    assert m.current_ratio is not None


def test_calculate_metrics_with_growth():
    current = {
        "revenue": 1_200_000_000_000,
        "operating_profit": 180_000_000_000,
        "net_profit": 120_000_000_000,
        "total_assets": 2_200_000_000_000,
        "total_equity": 1_300_000_000_000,
        "total_liabilities": 900_000_000_000,
        "current_assets": 600_000_000_000,
        "current_liabilities": 350_000_000_000,
    }
    previous = {
        "revenue": 1_000_000_000_000,
        "operating_profit": 150_000_000_000,
        "net_profit": 100_000_000_000,
        "total_assets": 2_000_000_000_000,
    }

    m = calculate_metrics(current, previous)

    assert m.revenue_growth == 20.0  # 20% growth
    assert m.operating_profit_growth == 20.0
    assert m.net_profit_growth == 20.0
