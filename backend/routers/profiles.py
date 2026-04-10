import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
import models, schemas
from routers.auth import get_current_user
from database import get_db

router = APIRouter(prefix="/api/profiles", tags=["profiles"])

@router.get("/me", response_model=schemas.ProfileResponse)
async def get_my_profile(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Profile).filter(models.Profile.user_id == current_user.id))
    profile = result.scalars().first()
    
    if not profile:
        # Create default profile if it doesn't exist
        profile_id = str(uuid.uuid4())
        profile = models.Profile(
            id=profile_id,
            user_id=current_user.id,
            full_name=current_user.email.split('@')[0]
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        
    return profile

@router.put("/me", response_model=schemas.ProfileResponse)
async def update_my_profile(
    profile_data: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Profile).filter(models.Profile.user_id == current_user.id))
    profile = result.scalars().first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    update_data = profile_data.dict(exclude_unset=True)
    
    # Update fields
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    await db.commit()
    await db.refresh(profile)
    
    return profile

@router.get("/{user_id}", response_model=schemas.ProfileResponse)
async def get_profile_by_user_id(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Profile).filter(models.Profile.user_id == user_id))
    profile = result.scalars().first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return profile
