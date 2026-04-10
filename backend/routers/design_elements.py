from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

import models
import schemas
from database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/api/design-elements", tags=["design_elements"])

@router.get("/", response_model=List[schemas.DesignElementResponse])
async def get_design_elements(
    creator_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(models.DesignElement)
    if creator_id:
        query = query.filter(models.DesignElement.creator_id == creator_id)
        
    result = await db.execute(query.order_by(models.DesignElement.created_at.desc()))
    return result.scalars().all()

@router.post("/", response_model=schemas.DesignElementResponse)
async def create_design_element(
    element: schemas.DesignElementCreate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_element = models.DesignElement(
        id=str(uuid.uuid4()),
        creator_id=current_user.id,
        **element.dict()
    )
    db.add(new_element)
    await db.commit()
    await db.refresh(new_element)
    return new_element

@router.delete("/{element_id}")
async def delete_design_element(
    element_id: str,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.DesignElement).filter(models.DesignElement.id == element_id))
    element = result.scalars().first()
    
    if not element:
        raise HTTPException(status_code=404, detail="Design element not found")
        
    if element.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this element")
        
    await db.delete(element)
    await db.commit()
    return {"message": "Design element deleted successfully"}
