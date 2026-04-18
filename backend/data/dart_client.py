import httpx
import zipfile
import io
import xml.etree.ElementTree as ET
from backend.config import get_settings
from backend.data.cache import get_cache


DART_BASE_URL = "https://opendart.fss.or.kr/api"
FS_DIV_LABELS = {
    "CFS": "연결재무제표",
    "OFS": "개별재무제표",
}


class DartClient:
    def __init__(self):
        self.api_key = get_settings().dart_api_key
        self.base_url = DART_BASE_URL

    async def _get(self, endpoint: str, params: dict) -> dict:
        cache = await get_cache()
        cached = await cache.get(endpoint, params)
        if cached:
            return cached

        req_params = dict(params)
        req_params["crtfc_key"] = self.api_key
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(f"{self.base_url}/{endpoint}.json", params=req_params)
            response.raise_for_status()
            data = response.json()

        if data.get("status") == "000":
            await cache.set(endpoint, params, data)
        return data

    async def _load_corp_list(self) -> list[dict]:
        """DART 전체 법인 목록 다운로드 및 파싱 (캐시 168h)"""
        cache = await get_cache()
        cached = await cache.get("corp_list_all_v2", {})
        if cached:
            return cached.get("items", [])

        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.get(
                f"{self.base_url}/corpCode.xml",
                params={"crtfc_key": self.api_key},
            )
            resp.raise_for_status()

        zf = zipfile.ZipFile(io.BytesIO(resp.content))
        xml_data = zf.read("CORPCODE.xml")
        root = ET.fromstring(xml_data.decode("utf-8"))

        items = []
        for item in root.findall("list"):
            stock_code = item.findtext("stock_code", "").strip()
            items.append({
                "corp_code": item.findtext("corp_code", "").strip(),
                "corp_name": item.findtext("corp_name", "").strip(),
                "stock_code": stock_code if stock_code else None,
                "modify_date": item.findtext("modify_date", "").strip(),
            })

        await cache.set("corp_list_all_v2", {}, {"items": items}, ttl_hours=168)
        return items

    async def search_company(self, company_name: str) -> list[dict]:
        """기업명으로 법인 검색 (로컬 필터링)"""
        all_corps = await self._load_corp_list()
        query = company_name.strip().lower()
        results = [
            c for c in all_corps
            if query in c["corp_name"].lower()
        ]
        # 상장사 우선 정렬
        results.sort(key=lambda x: (x["stock_code"] is None, x["corp_name"]))
        return results[:20]

    async def get_corp_code(self, stock_code: str) -> str | None:
        """주식 종목코드로 DART 법인코드 조회"""
        all_corps = await self._load_corp_list()
        for corp in all_corps:
            if corp.get("stock_code") == stock_code:
                return corp["corp_code"]
        return None

    async def get_financial_statements(
        self,
        corp_code: str,
        year: int,
        report_code: str = "11011",
        fs_div: str | None = None,
    ) -> dict:
        """
        재무제표 조회 (단일 회사)
        연결재무제표(CFS) → 개별재무제표(OFS) 순으로 폴백
        report_code: 11011=사업보고서, 11012=반기보고서, 11013=1분기보고서, 11014=3분기보고서
        """
        fs_divs = [fs_div] if fs_div else ["CFS", "OFS"]
        result = {}
        for current_fs_div in fs_divs:
            params = {
                "corp_code": corp_code,
                "bsns_year": str(year),
                "reprt_code": report_code,
                "fs_div": current_fs_div,
            }
            result = await self._get("fnlttSinglAcntAll", params)
            if result.get("status") == "000":
                enriched = dict(result)
                enriched["_requested_year"] = year
                enriched["_resolved_year"] = year
                enriched["_fs_div"] = current_fs_div
                enriched["_fs_div_label"] = FS_DIV_LABELS.get(current_fs_div, current_fs_div)
                return enriched

        return result

    async def get_company_info(self, corp_code: str) -> dict:
        """기업 기본 정보 조회"""
        return await self._get("company", {"corp_code": corp_code})
