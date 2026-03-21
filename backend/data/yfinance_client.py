import yfinance as yf
import pandas as pd
from backend.data.cache import get_cache
import json


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
        result = {
            "ticker": ticker,
            "prices": prices,
            "info": {
                "name": info.get("longName", ""),
                "market_cap": info.get("marketCap"),
                "pe_ratio": info.get("trailingPE"),
                "pb_ratio": info.get("priceToBook"),
                "dividend_yield": info.get("dividendYield"),
                "52w_high": info.get("fiftyTwoWeekHigh"),
                "52w_low": info.get("fiftyTwoWeekLow"),
                "current_price": info.get("currentPrice") or info.get("regularMarketPrice"),
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
        result = {
            "market_cap": info.get("marketCap"),
            "pe_ratio": round(float(info.get("trailingPE", 0) or 0), 2),
            "pb_ratio": round(float(info.get("priceToBook", 0) or 0), 2),
            "ps_ratio": round(float(info.get("priceToSalesTrailing12Months", 0) or 0), 2),
            "ev_ebitda": round(float(info.get("enterpriseToEbitda", 0) or 0), 2),
            "dividend_yield": round(float(info.get("dividendYield", 0) or 0) * 100, 2),
            "beta": round(float(info.get("beta", 0) or 0), 2),
        }

        await cache.set("yf_market", {"ticker": ticker}, result, ttl_hours=1)
        return result
