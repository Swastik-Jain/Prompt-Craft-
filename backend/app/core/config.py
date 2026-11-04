from __future__ import annotations

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    gemini_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./promptcraft.db"
    model_name: str = "gemini-1.5-flash"
    cors_origins: List[str] = ["http://localhost:5173"]

    @field_validator("database_url", mode="before")
    @classmethod
    def fix_sqlite_url(cls, v: str) -> str:
        """Ensure async driver for SQLite URLs."""
        if v.startswith("sqlite:///") and not v.startswith("sqlite+aiosqlite"):
            return v.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
        return v

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


settings = Settings()
