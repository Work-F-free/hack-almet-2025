from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.api import deps
from app.schemas import curve as curve_schema
from app.schemas import effective_formation_thickness as eft_schema
from app.schemas import formation_thickness as ft_schema
from app.schemas import well as well_schema
from app.schemas import welltrack as welltrack_schema

router = APIRouter()


@router.get("/wells", response_model=List[well_schema.Well])
async def list_wells(db: AsyncSession = Depends(deps.get_db)):
    return await crud.wells.get_multi(db)


@router.get("/welltracks", response_model=List[welltrack_schema.WellTrack])
async def list_welltracks(db: AsyncSession = Depends(deps.get_db)):
    return await crud.welltracks.get_multi(db)


@router.get("/curves", response_model=List[curve_schema.Curve])
async def list_curves(db: AsyncSession = Depends(deps.get_db)):
    return await crud.curves.get_multi(db)


@router.get("/formation-thickness", response_model=List[ft_schema.FormationThickness])
async def list_formation_thickness(db: AsyncSession = Depends(deps.get_db)):
    return await crud.formation_thickness.get_multi(db)


@router.get(
    "/effective-formation-thickness",
    response_model=List[eft_schema.EffectiveFormationThickness],
)
async def list_effective_formation_thickness(db: AsyncSession = Depends(deps.get_db)):
    return await crud.effective_formation_thickness.get_multi(db)


