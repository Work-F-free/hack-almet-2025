import shutil
import tempfile
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.converter import Converter

router = APIRouter()


@router.post("/convert", status_code=status.HTTP_200_OK)
async def convert_file(
    file: UploadFile,
    db: AsyncSession = Depends(deps.get_db),
) -> dict:
    """
    Accept a well file, parse it, and persist Well + Curve data to DB.
    Returns a summary of saved entities.
    """
    # Save uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False) as tmp_in:
        shutil.copyfileobj(file.file, tmp_in)
        input_path = Path(tmp_in.name)

    converter = Converter()
    result = await converter.convert_well_file(db, file_path=str(input_path))

    return result


@router.post("/convert/batch", status_code=status.HTTP_200_OK)
async def convert_file_batch(
    files: List[UploadFile],
    db: AsyncSession = Depends(deps.get_db),
) -> list[dict]:
    """
    Accept multiple well files, parse and persist them sequentially.
    Returns a list of summaries.
    """
    temp_paths: list[str] = []
    for file in files:
        with tempfile.NamedTemporaryFile(delete=False) as tmp_in:
            shutil.copyfileobj(file.file, tmp_in)
            temp_paths.append(tmp_in.name)

    converter = Converter()
    results = await converter.convert_well_file_batch(db, file_paths=temp_paths)
    return results


@router.post("/convert/welltrack", status_code=status.HTTP_200_OK)
async def convert_welltrack(
    file: UploadFile,
    db: AsyncSession = Depends(deps.get_db),
) -> dict:
    """
    Accept a welltrack file and persist WellTrack rows for the wells inside.
    """
    with tempfile.NamedTemporaryFile(delete=False) as tmp_in:
        shutil.copyfileobj(file.file, tmp_in)
        input_path = Path(tmp_in.name)

    converter = Converter()
    result = await converter.convert_welltrack(db, file_path=str(input_path))
    return result


@router.post("/convert/formation-thickness", status_code=status.HTTP_200_OK)
async def convert_formation_thickness(
    file: UploadFile,
    db: AsyncSession = Depends(deps.get_db),
) -> dict:
    """
    Accept a formation_thickness file and persist FormationThickness rows.
    """
    with tempfile.NamedTemporaryFile(delete=False) as tmp_in:
        shutil.copyfileobj(file.file, tmp_in)
        input_path = Path(tmp_in.name)

    converter = Converter()
    result = await converter.convert_formation_thickness(db, file_path=str(input_path))
    return result


@router.post("/convert/effective-formation-thickness", status_code=status.HTTP_200_OK)
async def convert_effective_formation_thickness(
    file: UploadFile,
    db: AsyncSession = Depends(deps.get_db),
) -> dict:
    """
    Accept an effective_formation_thickness file and persist EffectiveFormationThickness rows.
    """
    with tempfile.NamedTemporaryFile(delete=False) as tmp_in:
        shutil.copyfileobj(file.file, tmp_in)
        input_path = Path(tmp_in.name)

    converter = Converter()
    result = await converter.convert_effective_formation_thickness(db, file_path=str(input_path))
    return result


