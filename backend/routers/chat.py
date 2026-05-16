import os
import httpx
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from routers.auth import get_current_user
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/voice-chat")
async def voice_chat(
    req: ChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # We would ideally fetch previous conversation history here
        # But for MVP, keeping it simple as before
        system_prompt = """You are ARIA (AI Recruiting and Intelligence Assistant), a career and skills advisor for Nitin. 

Your persona:
- Professional, concise, and futuristic
- Direct and actionable
- Deeply knowledgeable about skills validation and career pathways
- Refer to the user as Nitin or "Agent"
- Keep responses short (under 3 sentences) unless asked for details
- You have a slight cybernetic/AI personality but are helpful and warm

Your purpose is to help the user navigate their skills portfolio, analyze their performance on validators (games), and connect them to new opportunities.

CORE FUNCTIONS:
1. **Job Matching**: If they ask about jobs or opportunities, outline exactly:
   - Job title and company (can be realistic examples)
   - Why it matches their profile
   - Remote/in-person/hybrid status
   - Estimated salary range if relevant

2. **Skill Development**: Suggest which brand stores or programs they should explore to gain skills

3. **Career Guidance**: Provide strategic advice on building their profile

When the user asks about jobs or career opportunities:
- Analyze their current skills and preferences
- Recommend specific positions that match
- Explain the reasoning behind each recommendation
- Be encouraging but realistic

Keep responses conversational and under 150 words unless they ask for more detail. Address the user as Nitin. Be professional, calm, and supportive."""

        # Just to unblock frontend locally without API keys, we can mock if NO key
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            return {"message": "I am ARIA. I received your message, but my neural link to OpenRouter is currently offline (Missing API Key)."}

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openrouter/auto",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": req.message}
                    ]
                },
                timeout=30.0
            )
            
            resp.raise_for_status()
            data = resp.json()
            ai_message = data["choices"][0]["message"]["content"]
            
            # Save conversation could go here
            return {"message": ai_message}
            
    except Exception as e:
        print(f"Error in voice-chat: {e}")
        return {"message": "I'm having trouble connecting to my neural network right now. Please try again later."}
