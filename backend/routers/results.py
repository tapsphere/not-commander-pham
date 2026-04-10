from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/api/results", tags=["results"])

# @router.get("/", response_model=List[schemas.ValidatorTestResultResponse])
@router.get("", response_model=List[schemas.ValidatorTestResultResponse])
async def get_results(
    template_id: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(models.ValidatorTestResult)
    
    if template_id:
        if template_id.startswith('eq.'):
            template_id = template_id[3:]
        query = query.filter(models.ValidatorTestResult.template_id == template_id)
        
    # Usually we filter by creator's templates, but for now we just return them for the user or template
    result = await db.execute(query)
    return result.scalars().all()
