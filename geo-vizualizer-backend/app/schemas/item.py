from pydantic import BaseModel


class ItemBase(BaseModel):
    name: str
    description: str | None = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    name: str | None = None


class Item(ItemBase):
    id: int

    class Config:
        orm_mode = True


