from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import models, schemas
import uuid
from database import get_db

router = APIRouter(prefix="/api/framework", tags=["framework"])


# ✅ GET ALL SUB-COMPETENCIES
@router.get("/sub-competencies", response_model=List[schemas.SubCompetencyResponse])
async def get_sub_competencies(
    id: Optional[str] = None,
    competency_id: Optional[str] = None,
    statement: Optional[str] = Query(None, description="Filter by exact statement match"),
    db: AsyncSession = Depends(get_db)
):
    query = select(models.SubCompetency).options(
        selectinload(models.SubCompetency.competency)
    )

    if id:
        if id.startswith('eq.'):
            id = id[3:]
        elif id.startswith('in.('):
            ids = id[4:-1].split(',')
            query = query.filter(models.SubCompetency.id.in_(ids))
            id = None

    if id:
        query = query.filter(models.SubCompetency.id == id)

    if competency_id:
        if competency_id.startswith('eq.'):
            competency_id = competency_id[3:]
        query = query.filter(models.SubCompetency.competency_id == competency_id)

    if statement:
        if statement.startswith('eq.'):
            statement = statement[3:]
        query = query.filter(models.SubCompetency.statement == statement)

    result = await db.execute(query)
    subs = result.scalars().all()

    return subs or []  # ✅ prevents crash


# ✅ GET ALL MASTER COMPETENCIES (🔥 THIS WAS MISSING)
@router.get("/competencies", response_model=List[schemas.MasterCompetencyResponse])
async def get_master_competencies(
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(models.MasterCompetency).options(
        selectinload(models.MasterCompetency.sub_competencies)
    )

    if is_active is not None:
        query = query.filter(models.MasterCompetency.is_active == is_active)

    result = await db.execute(query)
    comps = result.scalars().all()

    return comps or []  # ✅ prevents crash


# ✅ CREATE MASTER COMPETENCY
@router.post("/competencies", response_model=schemas.MasterCompetencyResponse)
async def create_master_competency(
    req: schemas.MasterCompetencyCreate,
    db: AsyncSession = Depends(get_db)
):
    new_comp = models.MasterCompetency(
        id=str(uuid.uuid4()),
        name=req.name,
        cbe_category=req.cbe_category,
        departments=req.departments,
        is_active=True
    )
    db.add(new_comp)
    await db.commit()
    await db.refresh(new_comp)
    return new_comp


# ✅ DELETE MASTER COMPETENCY
@router.delete("/competencies/{id}")
async def delete_master_competency(id: str, db: AsyncSession = Depends(get_db)):
    comp_result = await db.execute(select(models.MasterCompetency).filter_by(id=id))
    comp = comp_result.scalar_one_or_none()
    if not comp:
        raise HTTPException(status_code=404, detail="Not found")

    await db.delete(comp)
    await db.commit()
    return {"status": "ok"}


# ✅ CREATE SUB-COMPETENCY
@router.post("/sub-competencies", response_model=schemas.SubCompetencyResponse)
async def create_sub_competency(
    req: schemas.SubCompetencyCreate,
    db: AsyncSession = Depends(get_db)
):
    new_sub = models.SubCompetency(
        id=str(uuid.uuid4()),
        competency_id=req.competency_id,
        statement=req.statement,
        action_cue=req.action_cue,
        tags=req.tags,
        display_order=req.display_order
    )
    db.add(new_sub)
    await db.commit()
    await db.refresh(new_sub)
    return new_sub


# ✅ DELETE SUB-COMPETENCY
@router.delete("/sub-competencies/{id}")
async def delete_sub_competency(id: str, db: AsyncSession = Depends(get_db)):
    sub_result = await db.execute(select(models.SubCompetency).filter_by(id=id))
    sub = sub_result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Not found")

    await db.delete(sub)
    await db.commit()
    return {"status": "ok"}


# ✅ MATCH SUB-COMPETENCIES (AI SUPPORT)
@router.post("/match-sub-competencies", response_model=List[schemas.SubCompetencyResponse])
async def match_sub_competencies(
    tags: List[str],
    db: AsyncSession = Depends(get_db)
):
    query = select(models.SubCompetency)
    result = await db.execute(query)
    subs = result.scalars().all()

    input_tags = [t.lower().strip() for t in tags]

    matched = []

    for sub in subs:
        if not sub.tags:
            continue

        sub_tags = [t.lower().strip() for t in sub.tags]

        if any(tag in sub_tags for tag in input_tags):
            matched.append(sub)

    return matched or []