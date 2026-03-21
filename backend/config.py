from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    dart_api_key: str = ""
    anthropic_api_key: str = ""
    db_path: str = "cache.db"
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
