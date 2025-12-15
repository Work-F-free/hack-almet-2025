import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str
    VERSION: str
    API_V1_STR: str
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_POOL_SIZE: int
    DB_MAX_OVERFLOW: int
    DB_POOL_TIMEOUT: int
    FRONTEND_HOST: str

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


def _load_yaml(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


@lru_cache()
def get_settings() -> Settings:
    """
    Load settings from YAML file.
    Override path via CONFIG_FILE env var if needed.
    """
    default_path = Path(__file__).resolve().parents[2] / "config" / "settings.yaml"
    config_path = Path(os.getenv("CONFIG_FILE", default_path))
    data = _load_yaml(config_path)
    return Settings(**data)


settings = get_settings()


