from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.orchestrator_agent import Orchestrator
from services.google_maps import google_maps_service
from agents.chat_agent import initialize_chat, chat_with_agent
from typing import Optional
import os
from dotenv import load_dotenv
from datetime import datetime
import base64

# -------------------------------
# Load Environment Variables
# -------------------------------
load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
CORAL_API_KEY = os.getenv("CORAL_API_KEY")
AI_ML_API_KEY = os.getenv("AI_ML_API_KEY")

# -------------------------------
# FastAPI app config
# -------------------------------
app = FastAPI(
    title="Sauti Ya Mama API",
    description="Backend for Maternal Health Agent powered by Mistral + Coral + AI/ML APIs",
    version="2.0.0"
)

# ✅ CORS settings for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sauti-ya-mama-peu3.vercel.app",
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# 📌 Models
# -------------------------------
class SymptomRequest(BaseModel):
    patient_id: str
    symptom_text: str

class ClinicRequest(BaseModel):
    latitude: float
    longitude: float
    radius: int = 10000

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    patient_id: str
    message: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# -------------------------------
# 📌 Root endpoint
# -------------------------------
@app.get("/")
def read_root():
    return {"message": "Sauti Ya Mama API is running with Mistral + Coral + AI/ML integrations!"}

# -------------------------------
# 📌 Symptom analysis
# -------------------------------
@app.post("/api/analyze-symptoms")
def analyze_symptoms(request: SymptomRequest):
    try:
        orchestrator = Orchestrator()
        result = orchestrator.handle_user_input(request.patient_id, request.symptom_text)

        # Encode audio alert if present
        if "audio_alert" in result:
            result["audio_alert"] = base64.b64encode(result["audio_alert"]).decode("utf-8")

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------
# 📌 Patient history
# -------------------------------
@app.get("/api/patient/{patient_id}")
def get_patient(patient_id: str):
    from agents.triage_agent import get_patient_history
    return get_patient_history(patient_id)

# -------------------------------
# 📌 Nearby clinics (direct call)
# -------------------------------
@app.post("/api/nearby-clinics")
def get_nearby_clinics(request: ClinicRequest):
    try:
        hospitals = google_maps_service.find_nearby_hospitals(
            request.latitude,
            request.longitude,
            request.radius
        )
        return {"clinics": hospitals}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching clinics: {str(e)}")

# -------------------------------
# 📌 Geocoding
# -------------------------------
@app.get("/api/geocode/{address}")
def geocode_address(address: str):
    try:
        geocode_result = google_maps_service.client.geocode(address)
        if geocode_result:
            location = geocode_result[0]["geometry"]["location"]
            return {
                "latitude": location["lat"],
                "longitude": location["lng"],
                "formatted_address": geocode_result[0]["formatted_address"]
            }
        return {"error": "Address not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------
# 📌 Chat APIs
# -------------------------------
@app.post("/api/chat/initialize")
def init_chat_session(request: dict):
    try:
        patient_id = request.get("patient_id", "demo_user")
        return initialize_chat(patient_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/message")
def handle_chat_message(request: ChatRequest):
    try:
        # Create session if not provided
        if not request.session_id:
            session_info = initialize_chat(request.patient_id)
            request.session_id = session_info["session_id"]

        # Call chat agent (Mistral)
        ai_reply = chat_with_agent(request.session_id, request.message)

        # ✅ Check if user asks for hospitals/clinics
        keywords = ["hospital", "clinic", "doctor", "near me", "nearby"]
        hospitals = None
        if any(word in request.message.lower() for word in keywords):
            if request.latitude and request.longitude:
                hospitals = google_maps_service.find_nearby_hospitals(
                    request.latitude,
                    request.longitude,
                    radius=5000
                )

        return {
            "reply": ai_reply,
            "session_id": request.session_id,
            "hospitals": hospitals,
            "timestamp": datetime.now().isoformat(),
            "integrations": {
                "mistral": bool(MISTRAL_API_KEY),
                "coral": bool(CORAL_API_KEY),
                "ai_ml": bool(AI_ML_API_KEY)
            }
        }
    except Exception as e:
        print(f"Error in chat message handler: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

# -------------------------------
# 📌 Run app
# -------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
