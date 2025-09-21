# backend/main.py
import os
import traceback
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests

# ----------------------------
# Load environment variables
# ----------------------------
load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
AI_ML_API_KEY = os.getenv("AI_ML_API_KEY", "9d0da856e8cc438c95e659b35e76a378")

# ----------------------------
# Import local modules (agents folder)
# ----------------------------
try:
    import agents.chat_agent as chat_agent
except ImportError:
    chat_agent = None

try:
    from agents.google_maps import google_maps_service
except ImportError:
    google_maps_service = None

try:
    import agents.orchestrator_agent as orchestrator_mod
except ImportError:
    orchestrator_mod = None

# ----------------------------
# AI call helper
# ----------------------------
def call_ai(messages: list, model: str = "mistral-medium") -> str:
    """Try Mistral first; fallback to AI/ML API."""
    # Primary: Mistral
    if MISTRAL_API_KEY:
        try:
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}"}
            payload = {"model": model, "messages": messages, "temperature": 0.7}
            resp = requests.post(url, headers=headers, json=payload, timeout=12)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"⚠️ Mistral failed: {e}\n{traceback.format_exc()}")

    # Fallback: AI/ML API
    try:
        url = "https://api.aimlapi.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {AI_ML_API_KEY}"}
        payload = {"model": "gpt-4o-mini", "messages": messages, "temperature": 0.7}
        resp = requests.post(url, headers=headers, json=payload, timeout=12)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"❌ AI/ML failed: {e}\n{traceback.format_exc()}")

    return "⚠️ Sorry, AI services are currently unavailable."

# ----------------------------
# FastAPI app
# ----------------------------
app = FastAPI(title="Sauti Ya Mama API", version="2.0")

# ✅ Allow both localhost and Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sauti-ya-mama-peu3.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Request Models
# ----------------------------
class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    patient_id: Optional[str] = "demo_user"
    message: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class SymptomRequest(BaseModel):
    patient_id: str
    symptom_text: str

# ----------------------------
# Utilities
# ----------------------------
def safe_initialize_chat(patient_id: str):
    if chat_agent and hasattr(chat_agent, "initialize_chat"):
        return chat_agent.initialize_chat(patient_id)
    return {
        "session_id": f"fallback-{datetime.utcnow().timestamp()}",
        "patient_id": patient_id,
        "status": "initialized",
    }

def safe_chat_with_agent(session_id: str, message: str, lat=None, lng=None):
    if not chat_agent:
        return {"reply": "Chat agent unavailable.", "session_id": session_id}

    try:
        # Try new signature with location
        return chat_agent.chat_with_agent(session_id, message, lat, lng)
    except TypeError:
        # Fallback to old signature
        return chat_agent.chat_with_agent(session_id, message)
    except Exception as e:
        print("Chat agent error:", e, traceback.format_exc())
        return {"reply": "⚠️ Chat agent error.", "session_id": session_id}

# ----------------------------
# Routes
# ----------------------------
@app.get("/")
def root():
    return {"message": "✅ Sauti Ya Mama API is running."}

@app.post("/api/chat/initialize")
def init_chat(req: dict):
    pid = req.get("patient_id", "demo_user")
    return safe_initialize_chat(pid)

@app.post("/api/chat/message")
def chat_message(req: ChatRequest):
    # Ensure session
    if not req.session_id:
        init = safe_initialize_chat(req.patient_id)
        req.session_id = init["session_id"]

    # Update session context with location
    if req.latitude and req.longitude and hasattr(chat_agent, "update_session_context"):
        try:
            chat_agent.update_session_context(req.session_id, {
                "location": {"lat": req.latitude, "lng": req.longitude}
            })
        except Exception:
            pass

    # Chat with AI
    res = safe_chat_with_agent(req.session_id, req.message, req.latitude, req.longitude)
    reply = res["reply"] if isinstance(res, dict) else str(res)

    # Check for hospital request
    hospitals = None
    if any(word in req.message.lower() for word in ["hospital", "clinic", "doctor", "nearby"]):
        if google_maps_service:
            try:
                hospitals = google_maps_service.find_nearby_hospitals(
                    req.latitude, req.longitude
                )
            except Exception as e:
                print("⚠️ Hospital lookup failed:", e)

    return {
        "reply": reply,
        "session_id": req.session_id,
        "hospitals": hospitals,
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/api/chat/history/{session_id}")
def chat_history(session_id: str):
    if chat_agent and hasattr(chat_agent, "get_session_history"):
        return chat_agent.get_session_history(session_id)
    return {"error": "Chat history not available."}

@app.post("/api/analyze-symptoms")
def analyze_symptoms(req: SymptomRequest):
    if orchestrator_mod and hasattr(orchestrator_mod, "Orchestrator"):
        orch = orchestrator_mod.Orchestrator()
        return orch.handle_user_input(req.patient_id, req.symptom_text)

    # Fallback
    messages = [
        {"role": "system", "content": "You are a maternal health assistant. Classify risk LOW/MEDIUM/HIGH and give advice."},
        {"role": "user", "content": f"Patient {req.patient_id} reports: {req.symptom_text}"},
    ]
    return {"analysis": call_ai(messages)}

# ----------------------------
# Local run (ignored by Render)
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
