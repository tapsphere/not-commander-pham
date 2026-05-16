import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete
import models, schemas 
from routers.auth import get_current_user
from database import get_db

router = APIRouter(prefix="/api/customizations", tags=["customizations"])

@router.get("/", response_model=List[schemas.CustomizationResponse])
async def get_customizations(
    brand_id: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(models.BrandCustomization).options(
        selectinload(models.BrandCustomization.template).selectinload(models.GameTemplate.creator)
    )
    
    if brand_id:
        if brand_id.startswith('eq.'):
            brand_id = brand_id[3:]
        query = query.filter(models.BrandCustomization.brand_id == brand_id)
        
    query = query.order_by(models.BrandCustomization.created_at.desc())
    result = await db.execute(query)
    customizations = result.scalars().all()
    
    # Map the relations to match frontend expectation
    response_list = []
    for c in customizations:
        c_dict = {
            "id": c.id,
            "brand_id": c.brand_id,
            "template_id": c.template_id,
            "customization_prompt": c.customization_prompt,
            "generated_game_html": c.generated_game_html,
            "primary_color": c.primary_color,
            "secondary_color": c.secondary_color,
            "accent_color": c.accent_color,
            "background_color": c.background_color,
            "unique_code": c.unique_code,
            "published_at": c.published_at,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        }
        if c.template:
            template_data = {
                "name": c.template.name,
                "preview_image": c.template.preview_image,
                "creator_id": c.template.creator_id,
            }
            if c.template.creator and c.template.creator.profile:
                template_data["profiles"] = {
                    "full_name": c.template.creator.profile.full_name,
                    "bio": c.template.creator.profile.bio,
                    "avatar_url": c.template.creator.profile.avatar_url,
                }
            c_dict["game_templates"] = template_data
            
        response_list.append(c_dict)
        
    return response_list

@router.get("/live")
async def get_live_customizations(
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.sql import func
    now = func.now()
    
    query = select(models.BrandCustomization).options(
        selectinload(models.BrandCustomization.template)
    ).filter(
        models.BrandCustomization.visibility == "public",
        models.BrandCustomization.published_at.isnot(None),
        models.BrandCustomization.unique_code.isnot(None),
        models.BrandCustomization.live_start_date <= now,
        models.BrandCustomization.live_end_date >= now
    ).order_by(models.BrandCustomization.published_at.desc())
    
    result = await db.execute(query)
    customizations = result.scalars().all()
    
    # Also fetch the profiles to match brand_id -> brand_name
    brand_ids = list(set([c.brand_id for c in customizations]))
    profiles = []
    if brand_ids:
        profile_result = await db.execute(select(models.Profile).filter(models.Profile.user_id.in_(brand_ids)))
        profiles = profile_result.scalars().all()
    
    profile_map = {p.user_id: p.company_name for p in profiles}
    
    response_list = []
    for c in customizations:
        c_dict = {
            "id": c.id,
            "unique_code": c.unique_code,
            "brand_id": c.brand_id,
            "logo_url": c.logo_url,
            "primary_color": c.primary_color,
            "secondary_color": c.secondary_color,
            "brand_name": profile_map.get(c.brand_id)
        }
        if c.template:
            c_dict["game_templates"] = {
                "name": c.template.name,
                "preview_image": c.template.preview_image,
            }
        response_list.append(c_dict)
        
    return response_list

@router.post("/", response_model=schemas.CustomizationResponse)
async def create_customization(
    req: schemas.CustomizationCreate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req.brand_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    new_customization = models.BrandCustomization(
        id=str(uuid.uuid4()),
        brand_id=req.brand_id,
        template_id=req.template_id,
        customization_prompt=req.customization_prompt,
        generated_game_html=req.generated_game_html,
        logo_url=req.logo_url,
        primary_color=req.primary_color,
        secondary_color=req.secondary_color,
        accent_color=req.accent_color,
        background_color=req.background_color,
    )
    
    db.add(new_customization)
    await db.commit()
    await db.refresh(new_customization)
    
    # Needs to match response model shape (empty templates/etc initially)
    c_dict = {
        "id": new_customization.id,
        "brand_id": new_customization.brand_id,
        "template_id": new_customization.template_id,
        "customization_prompt": new_customization.customization_prompt,
        "generated_game_html": new_customization.generated_game_html,
        "primary_color": new_customization.primary_color,
        "secondary_color": new_customization.secondary_color,
        "accent_color": new_customization.accent_color,
        "background_color": new_customization.background_color,
        "logo_url": new_customization.logo_url,
        "unique_code": new_customization.unique_code,
        "published_at": new_customization.published_at,
        "created_at": new_customization.created_at,
        "updated_at": new_customization.updated_at,
    }
    return c_dict

@router.get("/public/{unique_code}")
async def get_public_customization(
    unique_code: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.BrandCustomization)
        .options(selectinload(models.BrandCustomization.template))
        .filter(
            models.BrandCustomization.unique_code == unique_code,
            models.BrandCustomization.published_at.isnot(None)
        )
    )
    custom = result.scalars().first()
    if not custom:
        raise HTTPException(status_code=404, detail="Customization not found or not published")
        
    c_dict = {
        "id": custom.id,
        "brand_id": custom.brand_id,
        "template_id": custom.template_id,
        "customization_prompt": custom.customization_prompt,
        "generated_game_html": custom.generated_game_html,
        "primary_color": custom.primary_color,
        "secondary_color": custom.secondary_color,
        "accent_color": custom.accent_color,
        "background_color": custom.background_color,
        "logo_url": custom.logo_url,
        "unique_code": custom.unique_code,
        "published_at": custom.published_at,
    }
    if custom.template:
        c_dict["game_templates"] = {
            "name": custom.template.name,
            "description": custom.template.description,
            "preview_image": custom.template.preview_image,
            "template_type": custom.template.template_type,
            "custom_game_url": custom.template.custom_game_url,
        }
    return c_dict

@router.get("/{id}")
async def get_customization(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.BrandCustomization)
        .options(selectinload(models.BrandCustomization.template))
        .filter(models.BrandCustomization.id == id)
    )
    custom = result.scalars().first()
    if not custom:
        raise HTTPException(status_code=404, detail="Customization not found")
        
    c_dict = {
        "id": custom.id,
        "brand_id": custom.brand_id,
        "template_id": custom.template_id,
        "customization_prompt": custom.customization_prompt,
        "generated_game_html": custom.generated_game_html,
        "primary_color": custom.primary_color,
        "secondary_color": custom.secondary_color,
        "accent_color": custom.accent_color,
        "background_color": custom.background_color,
        "logo_url": custom.logo_url,
        "unique_code": custom.unique_code,
        "published_at": custom.published_at,
    }
    if custom.template:
        c_dict["game_templates"] = {
            "name": custom.template.name,
            "description": custom.template.description,
            "preview_image": custom.template.preview_image,
            "template_type": custom.template.template_type,
            "custom_game_url": custom.template.custom_game_url,
        }
    return c_dict

@router.put("/{id}")
async def update_customization(
    id: str,
    update_data: dict,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.BrandCustomization).filter(
        models.BrandCustomization.id == id,
        models.BrandCustomization.brand_id == current_user.id
    ))
    custom = result.scalars().first()
    if not custom:
        raise HTTPException(status_code=404, detail="Customization not found or unauthorized")
        
    for key, value in update_data.items():
        if hasattr(custom, key):
            setattr(custom, key, value)
            
    await db.commit()
    await db.refresh(custom)
    return {"success": True}

@router.delete("/{id}")
async def delete_customization(
    id: str, 
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.BrandCustomization).filter(
        models.BrandCustomization.id == id,
        models.BrandCustomization.brand_id == current_user.id
    ))
    custom = result.scalars().first()
    if not custom:
        raise HTTPException(status_code=404, detail="Customization not found or unauthorized")
        
    await db.delete(custom)
    await db.commit()
    return {"success": True}
