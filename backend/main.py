from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from database import engine
from models import Base

app = FastAPI(title="PlayOps API")

# Create tables automatically on startup
@app.on_event("startup")
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Configure CORS for local development
from routers import auth, templates, games, storage, customizations, profiles, framework, results, chat, design_elements

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8081",
        "http://127.0.0.1:8081"
    ],
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