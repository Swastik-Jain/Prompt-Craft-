from __future__ import annotations

from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(BASE_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        protected_namespaces=("settings_",),
    )

    gemini_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./promptcraft.db"
    model_name: str = "gemini-1.5-flash"
    cors_origins: Union[List[str], str] = ["http://localhost:5173"]

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
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
