from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
import requests

# -------------------------------
# Load API keys
# -------------------------------
load_dotenv()
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
AI_ML_API_KEY = os.getenv("AI_ML_API_KEY", "9d0da856e8cc438c95e659b35e76a378")

if not MISTRAL_API_KEY and not AI_ML_API_KEY:
    raise RuntimeError("❌ Missing MISTRAL_API_KEY or AI_ML_API_KEY in environment variables.")

# -------------------------------
# Internal services
# -------------------------------
from services.chat_agent import (
    initialize_chat,
    chat_with_agent,
    get_session_history,
    update_session_context,
)
from services.google_maps import google_maps_service


# -------------------------------
# FastAPI Setup
# -------------------------------
app = FastAPI(title="Sauti Ya Mama - Backend")

# Allow frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sauti-ya-mama-peu3.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# Request Models
# -------------------------------
class InitChatRequest(BaseModel):
    patient_id: str


class ChatMessageRequest(BaseModel):
    session_id: str
    message: str


class ContextUpdateRequest(BaseModel):
    session_id: str
    context_updates: dict


class AnalyzeSymptomsRequest(BaseModel):
    symptoms: str
    patient_age: int
    patient_history: str


# -------------------------------
# AI Utility: Call Mistral + Fallback AI/ML
# -------------------------------
def call_ai(messages: list, model: str = "mistral-medium") -> str:
    """Primary: Mistral, Fallback: AI/ML API"""
    if MISTRAL_API_KEY:
        try:
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}"}
            payload = {"model": model, "messages": messages, "temperature": 0.7}
            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"⚠️ Mistral failed: {e}, falling back to AI/ML API")

    # fallback: AI/ML API
    try:
        url = "https://api.aimlapi.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {AI_ML_API_KEY}"}
        payload = {"model": "gpt-4o-mini", "messages": messages, "temperature": 0.7}
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"❌ AI/ML API failed: {e}")
        return "Sorry, I’m unable to process your request at the moment."


# -------------------------------
# Routes
# -------------------------------
@app.get("/")
async def root():
    return {"message": "Welcome to Sauti Ya Mama Backend API"}


@app.post("/api/init-chat")
async def init_chat(req: InitChatRequest):
    return initialize_chat(req.patient_id)


@app.post("/api/chat/message")
async def chat_message(req: ChatMessageRequest):
    reply = chat_with_agent(req.session_id, req.message)
    return {"reply": reply}


@app.get("/api/chat/history/{session_id}")
async def chat_history(session_id: str):
    return get_session_history(session_id)


@app.post("/api/chat/context")
async def chat_context(req: ContextUpdateRequest):
    success = update_session_context(req.session_id, req.context_updates)
    return {"success": success}


@app.post("/api/analyze-symptoms")
async def analyze_symptoms(req: AnalyzeSymptomsRequest):
    """
    Analyze symptoms using AI with fallback.
    """
    messages = [
        {
            "role": "system",
            "content": "You are a maternal health assistant. Provide safe analysis of symptoms.",
        },
        {
            "role": "user",
            "content": (
                f"Patient age: {req.patient_age}\n"
                f"History: {req.patient_history}\n"
                f"Symptoms: {req.symptoms}\n"
                "Please analyze and classify the risk as LOW, MEDIUM, or HIGH. "
                "Provide a short explanation and advice."
            ),
        },
    ]

    reply = call_ai(messages)
    return {"analysis": reply}


# -------------------------------
# Run App (local only)
# -------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
