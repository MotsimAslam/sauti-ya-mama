from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.orchestrator_agent import Orchestrator
from services.google_maps import google_maps_service
import os
from dotenv import load_dotenv
from agents.chat_agent import initialize_chat, chat_with_agent
from typing import Optional



load_dotenv()

app = FastAPI(title="Sauti Ya Mama API", description="Backend for Maternal Health Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-vercel-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SymptomRequest(BaseModel):
    patient_id: str
    symptom_text: str

class ClinicRequest(BaseModel):
    latitude: float
    longitude: float
    radius: int = 10000

@app.get("/")
def read_root():
    return {"message": "Sauti Ya Mama API is running!"}

@app.post("/api/analyze-symptoms")
def analyze_symptoms(request: SymptomRequest):
    try:
        orchestrator = Orchestrator()
        result = orchestrator.handle_user_input(request.patient_id, request.symptom_text)
        
        audio_data = None
        if 'audio_alert' in result:
            import base64
            audio_data = base64.b64encode(result['audio_alert']).decode('utf-8')
            result['audio_alert'] = audio_data
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/patient/{patient_id}")
def get_patient(patient_id: str):
    from agents.triage_agent import get_patient_history
    return get_patient_history(patient_id)

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

@app.get("/api/geocode/{address}")
def geocode_address(address: str):
    try:
        geocode_result = google_maps_service.client.geocode(address)
        if geocode_result:
            location = geocode_result[0]['geometry']['location']
            return {
                "latitude": location['lat'],
                "longitude": location['lng'],
                "formatted_address": geocode_result[0]['formatted_address']
            }
        return {"error": "Address not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    patient_id: str
    message: str

@app.post("/api/chat/initialize")
def init_chat_session(patient_id: str):
    try:
        result = initialize_chat(patient_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/message")
def handle_chat_message(request: ChatRequest):
    try:
        if not request.session_id:
            # Initialize new session if none provided
            session_info = initialize_chat(request.patient_id)
            request.session_id = session_info['session_id']
        
        result = chat_with_agent(request.session_id, request.message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    # to deploy on vercel
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)