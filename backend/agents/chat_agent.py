import uuid
from datetime import datetime
from typing import Dict, Any
import os
import requests
from dotenv import load_dotenv
from services.google_maps import google_maps_service  # ✅ integrate hospital lookup

# -------------------------------
# Load API Keys
# -------------------------------
load_dotenv()
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

if not MISTRAL_API_KEY:
    raise RuntimeError("❌ Missing MISTRAL_API_KEY in environment variables.")

# -------------------------------
# In-memory chat storage
# (for production, connect Supabase/Postgres)
# -------------------------------
chat_sessions: Dict[str, Dict[str, Any]] = {}


# -------------------------------
# Helper: Call Mistral API
# -------------------------------
def call_mistral(messages: list) -> str:
    """
    Send conversation history to Mistral API and return assistant reply.
    """
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}"}
    payload = {
        "model": "mistral-medium",
        "messages": messages,
        "temperature": 0.7,
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        raise RuntimeError(f"Mistral API error: {response.text}")

    data = response.json()
    return data["choices"][0]["message"]["content"]


# -------------------------------
# Initialize Chat Session
# -------------------------------
def initialize_chat(patient_id: str) -> Dict[str, Any]:
    """
    Initialize a new chat session for a patient.
    """
    session_id = str(uuid.uuid4())

    chat_sessions[session_id] = {
        "patient_id": patient_id,
        "created_at": datetime.now().isoformat(),
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a maternal health assistant. "
                    "Provide empathetic, safe, and supportive guidance for pregnant women. "
                    "Always encourage professional medical care when symptoms may be serious. "
                    "If asked about hospitals/clinics, use the hospital lookup service "
                    "and integrate the results naturally into your response."
                ),
            }
        ],
        "context": {
            "patient_history": [],
            "current_symptoms": [],
            "risk_level": "LOW",
            "location": {"lat": None, "lng": None},
        },
    }

    return {
        "session_id": session_id,
        "patient_id": patient_id,
        "status": "initialized",
        "message": "Chat session created successfully",
    }


# -------------------------------
# Detect hospital/clinic query
# -------------------------------
def _is_hospital_query(message: str) -> bool:
    keywords = ["hospital", "clinic", "nearby", "emergency", "care center"]
    return any(word in message.lower() for word in keywords)


# -------------------------------
# Chat With Agent
# -------------------------------
def chat_with_agent(session_id: str, message: str) -> str:
    """
    Process a chat message and return Mistral-generated response.
    """
    if session_id not in chat_sessions:
        return "❌ Session not found. Please start a new chat."

    session = chat_sessions[session_id]

    # Add user message
    user_message = {
        "role": "user",
        "content": message,
        "timestamp": datetime.now().isoformat(),
    }
    session["messages"].append(user_message)

    # Special case: Hospital lookup
    if _is_hospital_query(message):
        lat = session["context"]["location"].get("lat") or -1.2921  # default Nairobi
        lng = session["context"]["location"].get("lng") or 36.8219

        hospitals = google_maps_service.find_nearby_hospitals(lat, lng)

        if hospitals:
            formatted_list = "\n".join(
                [
                    f"🏥 {h['name']} - {h['address']} ({h['distance_km']} km away, Rating: {h['rating']})"
                    for h in hospitals[:5]
                ]
            )
            ai_response = (
                "Here are some nearby hospitals/clinics you can consider:\n\n"
                f"{formatted_list}\n\n"
                "👉 Please seek medical care promptly if your symptoms are severe."
            )
        else:
            ai_response = (
                "I tried to look up nearby hospitals but couldn’t fetch any results. "
                "Please check your location settings or try again."
            )

    else:
        # Normal flow: Ask Mistral
        history = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in session["messages"]
            if msg["role"] in ["system", "user", "assistant"]
        ]

        ai_response = call_mistral(history)

    # Add assistant reply
    ai_message = {
        "role": "assistant",
        "content": ai_response,
        "timestamp": datetime.now().isoformat(),
    }
    session["messages"].append(ai_message)

    return ai_response


# -------------------------------
# Retrieve Chat History
# -------------------------------
def get_session_history(session_id: str) -> Dict[str, Any]:
    if session_id not in chat_sessions:
        return {"error": "Session not found"}
    return chat_sessions[session_id]


# -------------------------------
# Update Context (e.g., patient location)
# -------------------------------
def update_session_context(session_id: str, context_updates: Dict[str, Any]) -> bool:
    if session_id not in chat_sessions:
        return False

    session = chat_sessions[session_id]
    session["context"].update(context_updates)
    return True
