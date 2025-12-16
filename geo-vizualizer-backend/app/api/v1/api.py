from fastapi import APIRouter

from app.api.v1.endpoints import converter, entities

api_router = APIRouter()
api_router.include_router(converter.router, prefix="/files", tags=["converter"])
api_router.include_router(entities.router, prefix="/entities", tags=["entities"])