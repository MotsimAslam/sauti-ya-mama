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

load_dotenv()

# ----------------------------
# Keys (prefer environment variables)
# ----------------------------
# NOTE: replace or set these in Render environment variables (recommended).
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
AI_ML_API_KEY = os.getenv("AI_ML_API_KEY", "9d0da856e8cc438c95e659b35e76a378")  # fallback only

# ----------------------------
# Robust imports: support both 'agents' and 'services' package names
# ----------------------------
chat_agent_mod = None
google_maps_service = None
orchestrator_mod = None

# chat_agent import (preferred: agents; fallback: services)
try:
    import agents.chat_agent as chat_agent_mod
except Exception:
    try:
        import services.chat_agent as chat_agent_mod
    except Exception:
        chat_agent_mod = None

# google_maps import (preferred: agents; fallback: services)
try:
    # agents.google_maps expected to export google_maps_service
    from agents.google_maps import google_maps_service  # type: ignore
except Exception:
    try:
        from services.google_maps import google_maps_service  # type: ignore
    except Exception:
        google_maps_service = None

# orchestrator (optional)
try:
    import agents.orchestrator_agent as orchestrator_mod
except Exception:
    try:
        import services.orchestrator_agent as orchestrator_mod
    except Exception:
        orchestrator_mod = None

# ----------------------------
# Helper: call AI (Mistral primary, AI/ML fallback)
# ----------------------------
def call_ai(messages: list, model: str = "mistral-medium") -> str:
    """
    Try Mistral API first. If not available or fails, fallback to the AI/ML API.
    Returns text reply or an error message.
    """
    # Primary: Mistral (if provided)
    if MISTRAL_API_KEY:
        try:
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}"}
            payload = {"model": model, "messages": messages, "temperature": 0.7}
            resp = requests.post(url, headers=headers, json=payload, timeout=12)
            resp.raise_for_status()
            data = resp.json()
            # Safe extraction
            return data.get("choices", [])[0].get("message", {}).get("content", "")
        except Exception as e:
            print(f"⚠️ Mistral call failed: {e}\n{traceback.format_exc()}")

    # Fallback: AI/ML API (user-provided key)
    if AI_ML_API_KEY:
        try:
            url = "https://api.aimlapi.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {AI_ML_API_KEY}"}
            payload = {"model": "gpt-4o-mini", "messages": messages, "temperature": 0.7}
            resp = requests.post(url, headers=headers, json=payload, timeout=12)
            resp.raise_for_status()
            data = resp.json()
            return data.get("choices", [])[0].get("message", {}).get("content", "")
        except Exception as e:
            print(f"❌ AI/ML fallback failed: {e}\n{traceback.format_exc()}")

    return "Sorry, I’m unable to reach the AI service right now."

# ----------------------------
# FastAPI app
# ----------------------------
app = FastAPI(title="Sauti Ya Mama API (robust imports)", version="2.0")

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
    if chat_agent_mod and hasattr(chat_agent_mod, "initialize_chat"):
        return chat_agent_mod.initialize_chat(patient_id)
    # minimal fallback
    return {"session_id": "fallback-" + str(datetime.utcnow().timestamp()), "patient_id": patient_id, "status": "initialized"}

def safe_chat_with_agent(session_id: str, message: str, latitude=None, longitude=None):
    """
    Call chat agent robustly supporting both older and newer signatures.
    Returns a normalized dict: {'reply': str, 'session_id': str, 'hospitals': optional list}
    """
    # If module missing, return friendly fallback
    if not chat_agent_mod:
        return {"reply": "Sorry, chat service not available.", "session_id": session_id}

    # Try signature that accepts latitude/longitude
    try:
        result = chat_agent_mod.chat_with_agent(session_id, message, latitude, longitude)
    except TypeError:
        # older signature: chat_with_agent(session_id, message)
        try:
            result = chat_agent_mod.chat_with_agent(session_id, message)
        except Exception as e:
            print("Error calling chat_agent.chat_with_agent:", e, traceback.format_exc())
            return {"reply": "Chat agent error.", "session_id": session_id}
    except Exception as e:
        print("Error calling chat_agent.chat_with_agent:", e, traceback.format_exc())
        return {"reply": "Chat agent error.", "session_id": session_id}

    # result might be string or dict
    if isinstance(result, str):
        return {"reply": result, "session_id": session_id}
    if isinstance(result, dict):
        # standardize keys
        reply = result.get("reply") or result.get("content") or result.get("message") or str(result)
        return {"reply": reply, "session_id": result.get("session_id", session_id), "hospitals": result.get("hospitals")}
    # fallback
    return {"reply": str(result), "session_id": session_id}

# ----------------------------
# Routes
# ----------------------------
@app.get("/")
def read_root():
    return {"message": "Sauti Ya Mama API running (robust)."}

@app.post("/api/chat/initialize")
def init_chat(req: dict):
    try:
        pid = req.get("patient_id", "demo_user")
        return safe_initialize_chat(pid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Init chat error: {e}")

@app.post("/api/chat/message")
def handle_chat_message(req: ChatRequest):
    try:
        # ensure session
        if not req.session_id:
            s = safe_initialize_chat(req.patient_id or "demo_user")
            req.session_id = s.get("session_id")

        # if location provided, ask agent to store context if function exists
        try:
            if (req.latitude or req.longitude) and chat_agent_mod and hasattr(chat_agent_mod, "update_session_context"):
                chat_agent_mod.update_session_context(req.session_id, {"location": {"lat": req.latitude, "lng": req.longitude}})
        except Exception as e:
            print("Warning: failed to update session context with location:", e)

        # Call chat agent (supports both signatures)
        res = safe_chat_with_agent(req.session_id, req.message, req.latitude, req.longitude)
        reply = res.get("reply", "")

        # If message requests hospitals, try lookup (use session context location first)
        hospitals = None
        keywords = ["hospital", "clinic", "doctor", "near me", "nearby", "emergency"]
        if any(k in req.message.lower() for k in keywords):
            # fetch location from session context if available
            loc = None
            try:
                if chat_agent_mod and hasattr(chat_agent_mod, "chat_sessions"):
                    sess = getattr(chat_agent_mod, "chat_sessions")
                    loc = sess.get(req.session_id, {}).get("context", {}).get("location")
            except Exception:
                loc = None

            # prefer location from request if provided
            if not loc and req.latitude and req.longitude:
                loc = {"lat": req.latitude, "lng": req.longitude}

            # call google maps service if present
            if loc and google_maps_service and hasattr(google_maps_service, "find_nearby_hospitals"):
                try:
                    hospitals = google_maps_service.find_nearby_hospitals(loc["lat"], loc["lng"])
                    # if google maps returns dict {"hospitals":..., "ai_summary":...} handle both
                    if isinstance(hospitals, dict):
                        # returned structure produced by some implementations
                        hospitals = hospitals.get("hospitals", hospitals.get("clinics", []))
                except Exception as e:
                    print("Warning: google maps lookup failed:", e, traceback.format_exc())
                    hospitals = None

        return {
            "reply": reply,
            "session_id": req.session_id,
            "hospitals": hospitals,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        print("Unhandled chat_message error:", e, traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Chat error: {e}")

@app.get("/api/chat/history/{session_id}")
def get_history(session_id: str):
    if chat_agent_mod and hasattr(chat_agent_mod, "get_session_history"):
        try:
            return chat_agent_mod.get_session_history(session_id)
        except Exception as e:
            print("get_history error:", e, traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))
    return {"error": "chat agent module not loaded or get_session_history missing."}

@app.post("/api/analyze-symptoms")
def analyze_symptoms(req: SymptomRequest):
    # If orchestrator available, use it
    if orchestrator_mod and hasattr(orchestrator_mod, "Orchestrator"):
        try:
            orch = orchestrator_mod.Orchestrator()
            result = orch.handle_user_input(req.patient_id, req.symptom_text)
            return result
        except Exception as e:
            print("Orchestrator error:", e, traceback.format_exc())

    # fallback: call AI to analyze symptoms
    try:
        messages = [
            {"role": "system", "content": "You are a maternal health assistant. Classify risk: LOW/MEDIUM/HIGH and give short advice."},
            {"role": "user", "content": f"Patient id: {req.patient_id}\nSymptoms: {req.symptom_text}"}
        ]
        analysis = call_ai(messages)
        return {"analysis": analysis}
    except Exception as e:
        print("analyze_symptoms fallback error:", e, traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# ----------------------------
# Run app locally (uvicorn) - Render will ignore this block and run your start command
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
