import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api/storage", tags=["storage"])

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "media")
os.makedirs(MEDIA_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(MEDIA_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    # Return local URL for the file
    url = f"/api/storage/{filename}"
    return {
        "success": True,
        "url": url,
        "filename": filename
    }

@router.get("/{filename}")
async def get_file(filename: str):
    file_path = os.path.join(MEDIA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_path)
