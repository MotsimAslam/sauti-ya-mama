import uuid
from datetime import datetime
from typing import Dict, Any
import os
import requests
from dotenv import load_dotenv

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
        "model": "mistral-medium",  # change if you use another Mistral model
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
                    "If asked about hospitals/clinics, the backend may provide a list—integrate it naturally in your response."
                ),
            }
        ],
        "context": {
            "patient_history": [],
            "current_symptoms": [],
            "risk_level": "LOW",
        },
    }

    return {
        "session_id": session_id,
        "patient_id": patient_id,
        "status": "initialized",
        "message": "Chat session created successfully",
    }


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

    # Prepare history (only role + content for LLM)
    history = [
        {"role": msg["role"], "content": msg["content"]}
        for msg in session["messages"]
        if msg["role"] in ["system", "user", "assistant"]
    ]

    # Call Mistral API
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
# Update Context
# -------------------------------
def update_session_context(session_id: str, context_updates: Dict[str, Any]) -> bool:
    if session_id not in chat_sessions:
        return False

    session = chat_sessions[session_id]
    session["context"].update(context_updates)
    return True
