from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.api import deps
from app.schemas.item import Item, ItemCreate, ItemUpdate

router = APIRouter()


@router.get("/", response_model=List[Item])
async def list_items(db: AsyncSession = Depends(deps.get_db)) -> List[Item]:
    items = await crud.items.get_multi(db)
    return list(items)


@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(payload: ItemCreate, db: AsyncSession = Depends(deps.get_db)) -> Item:
    return await crud.items.create(db, payload)


@router.get("/{item_id}", response_model=Item)
async def get_item(item_id: int, db: AsyncSession = Depends(deps.get_db)) -> Item:
    item = await crud.items.get(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.put("/{item_id}", response_model=Item)
async def update_item(item_id: int, payload: ItemUpdate, db: AsyncSession = Depends(deps.get_db)) -> Item:
    stored = await crud.items.get(db, item_id)
    if not stored:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    return await crud.items.update(db, stored, payload)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int, db: AsyncSession = Depends(deps.get_db)) -> None:
    item = await crud.items.get(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    await crud.items.remove(db, item_id)
    return None

