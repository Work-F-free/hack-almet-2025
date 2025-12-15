from typing import Dict, List

from fastapi import APIRouter, HTTPException, status

from app.schemas.item import Item, ItemCreate, ItemUpdate

router = APIRouter()

# Simple in-memory store to keep the scaffold runnable.
_ITEMS: Dict[int, Item] = {}
_ID_SEQ = 1


@router.get("/", response_model=List[Item])
def list_items() -> List[Item]:
    return list(_ITEMS.values())


@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate) -> Item:
    global _ID_SEQ
    item = Item(id=_ID_SEQ, **payload.dict())
    _ITEMS[_ID_SEQ] = item
    _ID_SEQ += 1
    return item


@router.get("/{item_id}", response_model=Item)
def get_item(item_id: int) -> Item:
    item = _ITEMS.get(item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.put("/{item_id}", response_model=Item)
def update_item(item_id: int, payload: ItemUpdate) -> Item:
    stored = _ITEMS.get(item_id)
    if not stored:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    updated = stored.copy(update=payload.dict(exclude_unset=True))
    _ITEMS[item_id] = updated
    return updated


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int) -> None:
    if item_id not in _ITEMS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    _ITEMS.pop(item_id)
    return None

