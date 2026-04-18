import pandas as pd
import pytest

from backend.data import yfinance_client
from backend.data.yfinance_client import (
    YFinanceClient,
    _calculate_dividend_yield,
    _normalize_yield_percent,
)


def test_normalize_yield_percent_handles_fraction_and_percent():
    assert _normalize_yield_percent(0.025) == 2.5
    assert _normalize_yield_percent(2.5) == 2.5
    assert _normalize_yield_percent(None) is None


def test_calculate_dividend_yield_prefers_recent_dividend_history():
    dividends = pd.Series(
        [500, 500],
        index=[
            pd.Timestamp.now() - pd.Timedelta(days=300),
            pd.Timestamp.now() - pd.Timedelta(days=30),
        ],
    )

    result = _calculate_dividend_yield(
        {"currentPrice": 50000, "dividendYield": 0.01},
        dividends,
    )

    assert result == {
        "annual_dividend": 1000.0,
        "dividend_yield": 2.0,
        "dividend_yield_source": "ttm_dividends",
    }


def test_calculate_dividend_yield_falls_back_to_trailing_annual_rate():
    result = _calculate_dividend_yield(
        {"currentPrice": 50000, "trailingAnnualDividendRate": 1200},
        pd.Series(dtype=float),
    )

    assert result == {
        "annual_dividend": 1200.0,
        "dividend_yield": 2.4,
        "dividend_yield_source": "trailing_annual_dividend_rate",
    }


@pytest.mark.asyncio
async def test_get_market_data_calculates_dividend_yield_from_history(monkeypatch):
    class FakeCache:
        async def get(self, prefix, params):
            return None

        async def set(self, prefix, params, data, ttl_hours=24):
            self.data = data

    class FakeTicker:
        info = {
            "marketCap": 1_000_000,
            "currentPrice": 50000,
            "trailingPE": 12.345,
            "priceToBook": 1.234,
            "priceToSalesTrailing12Months": 2.345,
            "enterpriseToEbitda": 8.765,
            "dividendYield": 0.01,
            "beta": 0.987,
        }
        dividends = pd.Series(
            [1000],
            index=[pd.Timestamp.now() - pd.Timedelta(days=20)],
        )

        def __init__(self, ticker):
            self.ticker = ticker

    async def fake_get_cache():
        return FakeCache()

    monkeypatch.setattr(yfinance_client, "get_cache", fake_get_cache)
    monkeypatch.setattr(yfinance_client.yf, "Ticker", FakeTicker)

    data = await YFinanceClient().get_market_data("005930.KS")

    assert data["dividend_yield"] == 2.0
    assert data["annual_dividend"] == 1000.0
    assert data["dividend_yield_source"] == "ttm_dividends"
    assert data["pe_ratio"] == 12.35
