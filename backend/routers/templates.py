import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
import models, schemas 
from routers.auth import get_current_user
from database import get_db

router = APIRouter(prefix="/api/templates", tags=["templates"])

# @router.get("/", response_model=List[schemas.TemplateResponse])
@router.get("", response_model=List[schemas.TemplateResponse])
async def get_templates(
    creator_id: Optional[str] = None,
    is_published: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(models.GameTemplate)
    if creator_id:
        if creator_id.startswith('eq.'):
            creator_id = creator_id[3:]
        query = query.filter(models.GameTemplate.creator_id == creator_id)
    if is_published is not None:
        query = query.filter(models.GameTemplate.is_published == is_published)
        
    query = query.order_by(models.GameTemplate.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

# @router.post("/", response_model=schemas.TemplateResponse)
@router.post("", response_model=schemas.TemplateResponse)
async def create_template(
    template: schemas.TemplateCreate, 
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    template_id = str(uuid.uuid4())
    new_template = models.GameTemplate(
        **template.dict(),
        id=template_id,
        creator_id=current_user.id
    )
    
    db.add(new_template)
    await db.commit()
    await db.refresh(new_template)
    
    return new_template

@router.get("/{id}", response_model=schemas.TemplateResponse)
async def get_template_by_id(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.GameTemplate).filter(models.GameTemplate.id == id))
    template = result.scalars().first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.get("/{id}/runtimes")
async def get_template_runtimes(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ValidatorRuntime).filter(models.ValidatorRuntime.template_id == id))
    runtimes = result.scalars().all()
    return runtimes

@router.delete("/{id}")
async def delete_template(
    id: str, 
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.GameTemplate).filter(
        models.GameTemplate.id == id,
        models.GameTemplate.creator_id == current_user.id
    ))
    template = result.scalars().first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found or unauthorized")
        
    await db.delete(template)
    await db.commit()
    return {"success": True}

@router.put("/{id}", response_model=schemas.TemplateResponse)
async def update_template(
    id: str, 
    template_data: schemas.TemplateUpdate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.GameTemplate).filter(
        models.GameTemplate.id == id,
        models.GameTemplate.creator_id == current_user.id
    ))
    template = result.scalars().first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found or unauthorized")
        
    update_data = template_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)
        
    await db.commit()
    await db.refresh(template)
    return template
