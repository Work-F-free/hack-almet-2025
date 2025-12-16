from pathlib import Path
from string import Template
import yaml
import os

class Settings:
    def __init__(self, settings_path: str = "/app/config/settings.yaml"):
        self.settings_path = Path(settings_path)
        self._load_yaml()

    def _load_yaml(self):
        # читаем YAML-шаблон и подставляем env переменные
        with open(self.settings_path) as f:
            content = Template(f.read()).safe_substitute(os.environ)
        data = yaml.safe_load(content)

        self.PROJECT_NAME = data["PROJECT_NAME"]
        self.VERSION = data["VERSION"]
        self.API_V1_STR = data["API_V1_STR"]
        self.DB_USER = data["DB_USER"]
        self.DB_PASSWORD = data["DB_PASSWORD"]
        self.DB_HOST = data["DB_HOST"]
        self.DB_PORT = data["DB_PORT"]
        self.DB_NAME = data["DB_NAME"]
        self.DB_POOL_SIZE = data["DB_POOL_SIZE"]
        self.DB_MAX_OVERFLOW = data["DB_MAX_OVERFLOW"]
        self.DB_POOL_TIMEOUT = data["DB_POOL_TIMEOUT"]
        self.FRONTEND_HOST = data["FRONTEND_HOST"]

    @property
    def DATABASE_URL(self) -> str:
        # формируем только после инициализации объекта
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


# создаём единственный объект настроек
settings = Settings()
