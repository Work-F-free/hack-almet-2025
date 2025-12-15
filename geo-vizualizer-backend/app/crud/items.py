from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


async def get(db: AsyncSession, item_id: int) -> Item | None:
    return await db.get(Item, item_id)


async def get_multi(db: AsyncSession) -> Sequence[Item]:
    result = await db.execute(select(Item).order_by(Item.id))
    return result.scalars().all()


async def create(db: AsyncSession, payload: ItemCreate) -> Item:
    db_obj = Item(name=payload.name, description=payload.description)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def update(db: AsyncSession, db_obj: Item, payload: ItemUpdate) -> Item:
    data = payload.dict(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)

    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def remove(db: AsyncSession, item_id: int) -> None:
    obj = await db.get(Item, item_id)
    if obj:
        await db.delete(obj)
        await db.commit()



