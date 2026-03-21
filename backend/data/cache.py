import aiosqlite
import json
import hashlib
from datetime import datetime, timedelta
from backend.config import get_settings


class Cache:
    def __init__(self):
        self.db_path = get_settings().db_path

    async def init(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS api_cache (
                    key TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    expires_at TEXT NOT NULL
                )
            """)
            await db.commit()

    def _make_key(self, prefix: str, params: dict) -> str:
        raw = json.dumps(params, sort_keys=True, ensure_ascii=False)
        return f"{prefix}:{hashlib.md5(raw.encode()).hexdigest()}"

    async def get(self, prefix: str, params: dict) -> dict | None:
        key = self._make_key(prefix, params)
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT data, expires_at FROM api_cache WHERE key = ?", (key,)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    expires_at = datetime.fromisoformat(row[1])
                    if datetime.now() < expires_at:
                        return json.loads(row[0])
                    else:
                        await db.execute("DELETE FROM api_cache WHERE key = ?", (key,))
                        await db.commit()
        return None

    async def set(self, prefix: str, params: dict, data: dict, ttl_hours: int = 24):
        key = self._make_key(prefix, params)
        now = datetime.now()
        expires_at = now + timedelta(hours=ttl_hours)
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """INSERT OR REPLACE INTO api_cache (key, data, created_at, expires_at)
                   VALUES (?, ?, ?, ?)""",
                (key, json.dumps(data, ensure_ascii=False), now.isoformat(), expires_at.isoformat()),
            )
            await db.commit()


_cache = Cache()


async def get_cache() -> Cache:
    await _cache.init()
    return _cache
