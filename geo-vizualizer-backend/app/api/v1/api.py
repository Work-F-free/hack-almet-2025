from fastapi import APIRouter

from app.api.v1.endpoints import converter, items, entities

api_router = APIRouter()
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(converter.router, prefix="/files", tags=["converter"])
api_router.include_router(entities.router, prefix="/entities", tags=["entities"])