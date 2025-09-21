# agents/chat_agent.py
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Prefer environment variable; fallback to provided API key only if env not set
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
AI_ML_API_KEY = os.getenv("AI_ML_API_KEY", "9d0da856e8cc438c95e659b35e76a378")

# In-memory storage (same as your original)
chat_sessions: Dict[str, Dict[str, Any]] = {}

# ---------------------------
# Helper: Call Mistral (primary) or AI/ML fallback
# ---------------------------
def _call_mistral(messages: list, model: str = "mistral-medium") -> Optional[str]:
    """Call Mistral chat completions. Return text or None on failure."""
    if not MISTRAL_API_KEY:
        return None
    try:
        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}"}
        payload = {"model": model, "messages": messages, "temperature": 0.7}
        resp = requests.post(url, headers=headers, json=payload, timeout=12)
        resp.raise_for_status()
        data = resp.json()
        # defensive extraction
        return data.get("choices", [])[0].get("message", {}).get("content", None)
    except Exception as e:
        print("⚠️ Mistral call failed:", e)
        return None

def _call_ai_ml_fallback(messages: list) -> Optional[str]:
    """Fallback to AI/ML API if provided. Return text or None on failure."""
    if not AI_ML_API_KEY:
        return None
    try:
        url = "https://api.aimlapi.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {AI_ML_API_KEY}"}
        payload = {"model": "gpt-4o-mini", "messages": messages, "temperature": 0.7}
        resp = requests.post(url, headers=headers, json=payload, timeout=12)
        resp.raise_for_status()
        data = resp.json()
        return data.get("choices", [])[0].get("message", {}).get("content", None)
    except Exception as e:
        print("⚠️ AI/ML fallback failed:", e)
        return None

# ---------------------------
# Classic rule-based fallback (your original)
# ---------------------------
def generate_health_response(message: str, session: Dict[str, Any]) -> str:
    message_lower = message.lower()

    emergency_keywords = ['emergency', 'urgent', 'severe pain', 'bleeding', 'contractions', 'water broke']
    if any(keyword in message_lower for keyword in emergency_keywords):
        return "🚨 This sounds like an emergency! Please call your healthcare provider immediately or go to the nearest emergency room. If you're experiencing severe symptoms, call emergency services right away."

    if any(symptom in message_lower for symptom in ['pain', 'ache', 'cramp', 'discomfort']):
        return "I understand you're experiencing some discomfort. Can you tell me more about the location and intensity of the pain? Also, when did it start and has it been getting worse?"

    if any(nutrition in message_lower for nutrition in ['food', 'eat', 'diet', 'nutrition', 'vitamin']):
        return "Nutrition is very important during pregnancy! I'd recommend consulting with your healthcare provider about your specific nutritional needs. Generally, focus on a balanced diet with plenty of fruits, vegetables, lean proteins, and whole grains."

    if any(exercise in message_lower for exercise in ['exercise', 'workout', 'fitness', 'activity']):
        return "Exercise during pregnancy is generally beneficial, but it's important to consult with your healthcare provider first. Low-impact activities like walking, swimming, and prenatal yoga are often recommended."

    if any(preg in message_lower for preg in ['pregnant', 'pregnancy', 'baby', 'fetus']):
        return "Congratulations on your pregnancy! I'm here to help with any questions you have about maternal health. What specific aspect of pregnancy would you like to know more about?"

    if any(location in message_lower for location in ['hospital', 'clinic', 'doctor', 'near me', 'nearby']):
        return "I can help you find nearby healthcare facilities. Please share your location or the area you're in, and I'll provide you with the closest hospitals and clinics."

    return "I'm here to help with your maternal health questions. Could you please provide more details about what you'd like to know? I can help with symptoms, nutrition, exercise, or any other pregnancy-related concerns."

# ---------------------------
# Public API: initialize_chat (same signature)
# ---------------------------
def initialize_chat(patient_id: str) -> Dict[str, Any]:
    session_id = str(uuid.uuid4())
    chat_sessions[session_id] = {
        'patient_id': patient_id,
        'created_at': datetime.now().isoformat(),
        'messages': [
            {
                "role": "system",
                "content": (
                    "You are a maternal health assistant. Provide empathetic, safe guidance. "
                    "Always encourage professional care for serious symptoms. "
                    "If the backend provides clinic/hospital data, incorporate it naturally."
                )
            }
        ],
        'context': {
            'patient_history': [],
            'current_symptoms': [],
            'risk_level': 'LOW'
        }
    }
    return {
        'session_id': session_id,
        'patient_id': patient_id,
        'status': 'initialized',
        'message': 'Chat session created successfully'
    }

# ---------------------------
# Public API: chat_with_agent (same signature)
# ---------------------------
def chat_with_agent(session_id: str, message: str) -> str:
    """
    Keep signature exactly the same as your original code.
    Will try Mistral -> AI/ML fallback -> original rule-based responder.
    """
    if session_id not in chat_sessions:
        return "❌ Session not found. Please start a new chat."

    session = chat_sessions[session_id]

    # Append user message
    user_message = {
        'role': 'user',
        'content': message,
        'timestamp': datetime.now().isoformat()
    }
    session['messages'].append(user_message)

    # Prepare messages for LLM (strip timestamps)
    history_messages = [
        {"role": msg.get("role", "user"), "content": msg.get("content", "")}
        for msg in session['messages']
        if msg.get("role") in ("system", "user", "assistant")
    ]

    # 1) Try Mistral
    ai_reply = None
    ai_reply = _call_mistral(history_messages)

    # 2) Fallback to AI/ML service if Mistral unavailable
    if ai_reply is None:
        ai_reply = _call_ai_ml_fallback(history_messages)

    # 3) If still None, use the original rule-based generator (guaranteed response)
    if ai_reply is None:
        ai_reply = generate_health_response(message, session)

    # Append assistant message
    ai_message = {
        'role': 'assistant',
        'content': ai_reply,
        'timestamp': datetime.now().isoformat()
    }
    session['messages'].append(ai_message)

    return ai_reply

# ---------------------------
# Other helpers (same as original)
# ---------------------------
def get_session_history(session_id: str) -> Dict[str, Any]:
    if session_id not in chat_sessions:
        return {'error': 'Session not found'}
    return chat_sessions[session_id]

def update_session_context(session_id: str, context_updates: Dict[str, Any]) -> bool:
    if session_id not in chat_sessions:
        return False
    session = chat_sessions[session_id]
    session['context'].update(context_updates)
    return True
