import pytest

from backend.data.dart_client import DartClient


@pytest.mark.asyncio
async def test_get_financial_statements_falls_back_to_ofs_without_changing_year(monkeypatch):
    client = DartClient()
    calls = []

    async def fake_get(endpoint, params):
        calls.append(params)
        if params["fs_div"] == "OFS":
            return {"status": "000", "list": []}
        return {"status": "013", "message": "No data"}

    monkeypatch.setattr(client, "_get", fake_get)

    result = await client.get_financial_statements("00126380", 2025, "11011")

    assert [call["fs_div"] for call in calls] == ["CFS", "OFS"]
    assert {call["bsns_year"] for call in calls} == {"2025"}
    assert result["_resolved_year"] == 2025
    assert result["_fs_div"] == "OFS"
    assert result["_fs_div_label"] == "개별재무제표"


@pytest.mark.asyncio
async def test_get_financial_statements_does_not_fall_back_to_previous_year(monkeypatch):
    client = DartClient()
    calls = []

    async def fake_get(endpoint, params):
        calls.append(params)
        return {"status": "013", "message": "No data"}

    monkeypatch.setattr(client, "_get", fake_get)

    result = await client.get_financial_statements("00126380", 2025, "11011")

    assert result == {"status": "013", "message": "No data"}
    assert [call["bsns_year"] for call in calls] == ["2025", "2025"]


@pytest.mark.asyncio
async def test_get_financial_statements_respects_requested_fs_div(monkeypatch):
    client = DartClient()
    calls = []

    async def fake_get(endpoint, params):
        calls.append(params)
        return {"status": "000", "list": []}

    monkeypatch.setattr(client, "_get", fake_get)

    result = await client.get_financial_statements(
        "00126380",
        2024,
        "11011",
        fs_div="OFS",
    )

    assert len(calls) == 1
    assert calls[0]["fs_div"] == "OFS"
    assert result["_fs_div"] == "OFS"
