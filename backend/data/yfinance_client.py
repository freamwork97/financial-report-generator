import yfinance as yf
import pandas as pd
from backend.data.cache import get_cache


def _to_float(value) -> float | None:
    try:
        if value is None or pd.isna(value):
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _round_float(value, digits: int = 2) -> float | None:
    number = _to_float(value)
    return round(number, digits) if number is not None else None


def _normalize_yield_percent(value) -> float | None:
    """Yahoo may return dividend yields as either 0.025 or 2.5."""
    number = _to_float(value)
    if number is None or number <= 0:
        return None
    percent = number * 100 if number <= 1 else number
    return round(percent, 2)


def _current_price(info: dict) -> float | None:
    for key in ("currentPrice", "regularMarketPrice", "previousClose"):
        price = _to_float(info.get(key))
        if price and price > 0:
            return price
    return None


def _recent_dividend_total(dividends) -> float | None:
    if dividends is None or getattr(dividends, "empty", True):
        return None

    series = dividends.dropna()
    series = series[series > 0]
    if series.empty:
        return None

    index = pd.to_datetime(series.index)
    now = pd.Timestamp.now(tz=index.tz) if index.tz else pd.Timestamp.now()
    cutoff = now - pd.Timedelta(days=365)
    recent = series[index >= cutoff]
    if recent.empty:
        return None

    total = float(recent.sum())
    return round(total, 4) if total > 0 else None


def _calculate_dividend_yield(info: dict, dividends=None) -> dict:
    price = _current_price(info)
    annual_dividend = _recent_dividend_total(dividends)
    if price and annual_dividend:
        return {
            "annual_dividend": annual_dividend,
            "dividend_yield": round((annual_dividend / price) * 100, 2),
            "dividend_yield_source": "ttm_dividends",
        }

    annual_dividend = _to_float(info.get("trailingAnnualDividendRate"))
    if price and annual_dividend and annual_dividend > 0:
        return {
            "annual_dividend": round(annual_dividend, 4),
            "dividend_yield": round((annual_dividend / price) * 100, 2),
            "dividend_yield_source": "trailing_annual_dividend_rate",
        }

    yahoo_yield = _normalize_yield_percent(info.get("dividendYield"))
    if yahoo_yield is not None:
        return {
            "annual_dividend": None,
            "dividend_yield": yahoo_yield,
            "dividend_yield_source": "yahoo_dividend_yield",
        }

    annual_dividend = _to_float(info.get("dividendRate"))
    if price and annual_dividend and annual_dividend > 0:
        return {
            "annual_dividend": round(annual_dividend, 4),
            "dividend_yield": round((annual_dividend / price) * 100, 2),
            "dividend_yield_source": "dividend_rate",
        }

    return {
        "annual_dividend": None,
        "dividend_yield": None,
        "dividend_yield_source": None,
    }


class YFinanceClient:
    async def get_stock_price(self, ticker: str, period: str = "1y") -> dict:
        """주가 데이터 조회 (KRX: {종목코드}.KS 형식)"""
        cache = await get_cache()
        cached = await cache.get("yf_price", {"ticker": ticker, "period": period})
        if cached:
            return cached

        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)

        if hist.empty:
            return {"ticker": ticker, "prices": [], "info": {}}

        prices = [
            {
                "date": str(idx.date()),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
            for idx, row in hist.iterrows()
        ]

        info = stock.info
        dividend = _calculate_dividend_yield(info, hist.get("Dividends") if "Dividends" in hist else None)
        result = {
            "ticker": ticker,
            "prices": prices,
            "info": {
                "name": info.get("longName", ""),
                "market_cap": info.get("marketCap"),
                "pe_ratio": info.get("trailingPE"),
                "pb_ratio": info.get("priceToBook"),
                "dividend_yield": dividend["dividend_yield"],
                "annual_dividend": dividend["annual_dividend"],
                "dividend_yield_source": dividend["dividend_yield_source"],
                "52w_high": info.get("fiftyTwoWeekHigh"),
                "52w_low": info.get("fiftyTwoWeekLow"),
                "current_price": _current_price(info),
            },
        }

        await cache.set("yf_price", {"ticker": ticker, "period": period}, result, ttl_hours=1)
        return result

    async def get_market_data(self, ticker: str) -> dict:
        """시장 데이터 (시총, PER, PBR 등)"""
        cache = await get_cache()
        cached = await cache.get("yf_market", {"ticker": ticker})
        if cached:
            return cached

        stock = yf.Ticker(ticker)
        info = stock.info
        dividends = stock.dividends
        dividend = _calculate_dividend_yield(info, dividends)
        result = {
            "market_cap": info.get("marketCap"),
            "pe_ratio": _round_float(info.get("trailingPE")),
            "pb_ratio": _round_float(info.get("priceToBook")),
            "ps_ratio": _round_float(info.get("priceToSalesTrailing12Months")),
            "ev_ebitda": _round_float(info.get("enterpriseToEbitda")),
            "dividend_yield": dividend["dividend_yield"],
            "annual_dividend": dividend["annual_dividend"],
            "dividend_yield_source": dividend["dividend_yield_source"],
            "beta": _round_float(info.get("beta")),
        }

        await cache.set("yf_market", {"ticker": ticker}, result, ttl_hours=1)
        return result
