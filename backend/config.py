from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    dart_api_key: str = ""
    anthropic_api_key: str = ""
    db_path: str = "cache.db"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
