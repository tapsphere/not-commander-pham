from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
load_dotenv()
from database import engine
from models import Base

# app = FastAPI(title="PlayOps API")
app = FastAPI(title="PlayOps API", redirect_slashes=False)

# Create tables automatically on startup
@app.on_event("startup")
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Configure CORS for local development
from routers import auth, templates, games, storage, customizations, profiles, framework, results, chat, design_elements

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(templates.router)
app.include_router(games.router)
app.include_router(storage.router)
app.include_router(profiles.router)
app.include_router(framework.router)
app.include_router(results.router)
app.include_router(chat.router)
app.include_router(customizations.router)
app.include_router(design_elements.router)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
