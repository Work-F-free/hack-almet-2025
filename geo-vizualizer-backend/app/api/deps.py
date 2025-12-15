from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an async database session for request-scoped use.
    """
    async for session in get_session():
        yield session

