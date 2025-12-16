from fastapi import FastAPI

from app.db.base import Base
from app.db.session import engine

from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={"defaultModelsExpandDepth": -1},
)

# Список разрешенных origins
origins = [
    "http://localhost",
    settings.FRONTEND_HOST,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Только указанные домены
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
    expose_headers=["*"],  # Какие заголовки доступны клиенту
    max_age=600,  # Время кэширования preflight запросов в секундах
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["health"])
def healthcheck() -> dict[str, str]:
    """
    Lightweight endpoint for uptime checks.
    """
    return {"status": "ok"}


@app.on_event("startup")
async def on_startup() -> None:
    # Import models so that metadata is populated before table creation
    import app.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


