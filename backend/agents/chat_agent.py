import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import json

# In-memory storage for chat sessions (in production, use a database)
chat_sessions = {}

def initialize_chat(patient_id: str) -> Dict[str, Any]:
    """
    Initialize a new chat session for a patient.
    
    Args:
        patient_id: Unique identifier for the patient
        
    Returns:
        Dictionary containing session information
    """
    session_id = str(uuid.uuid4())
    
    # Create new session
    chat_sessions[session_id] = {
        'patient_id': patient_id,
        'created_at': datetime.now().isoformat(),
        'messages': [],
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

def chat_with_agent(session_id: str, message: str) -> str:
    """
    Process a chat message and return AI response.
    
    Args:
        session_id: Chat session identifier
        message: User's message
        
    Returns:
        AI assistant's response
    """
    if session_id not in chat_sessions:
        return "❌ Session not found. Please start a new chat."
    
    session = chat_sessions[session_id]
    
    # Add user message to session
    user_message = {
        'role': 'user',
        'content': message,
        'timestamp': datetime.now().isoformat()
    }
    session['messages'].append(user_message)
    
    # Generate AI response based on message content
    ai_response = generate_health_response(message, session)
    
    # Add AI response to session
    ai_message = {
        'role': 'assistant',
        'content': ai_response,
        'timestamp': datetime.now().isoformat()
    }
    session['messages'].append(ai_message)
    
    return ai_response

def generate_health_response(message: str, session: Dict[str, Any]) -> str:
    """
    Generate a contextual health response based on the user's message.
    
    Args:
        message: User's input message
        session: Current chat session data
        
    Returns:
        AI-generated response
    """
    message_lower = message.lower()
    
    # Emergency keywords
    emergency_keywords = ['emergency', 'urgent', 'severe pain', 'bleeding', 'contractions', 'water broke']
    if any(keyword in message_lower for keyword in emergency_keywords):
        return "🚨 This sounds like an emergency! Please call your healthcare provider immediately or go to the nearest emergency room. If you're experiencing severe symptoms, call emergency services right away."
    
    # Symptom-related responses
    if any(symptom in message_lower for symptom in ['pain', 'ache', 'cramp', 'discomfort']):
        return "I understand you're experiencing some discomfort. Can you tell me more about the location and intensity of the pain? Also, when did it start and has it been getting worse?"
    
    # Nutrition-related responses
    if any(nutrition in message_lower for nutrition in ['food', 'eat', 'diet', 'nutrition', 'vitamin']):
        return "Nutrition is very important during pregnancy! I'd recommend consulting with your healthcare provider about your specific nutritional needs. Generally, focus on a balanced diet with plenty of fruits, vegetables, lean proteins, and whole grains."
    
    # Exercise-related responses
    if any(exercise in message_lower for exercise in ['exercise', 'workout', 'fitness', 'activity']):
        return "Exercise during pregnancy is generally beneficial, but it's important to consult with your healthcare provider first. Low-impact activities like walking, swimming, and prenatal yoga are often recommended."
    
    # General pregnancy questions
    if any(preg in message_lower for preg in ['pregnant', 'pregnancy', 'baby', 'fetus']):
        return "Congratulations on your pregnancy! I'm here to help with any questions you have about maternal health. What specific aspect of pregnancy would you like to know more about?"
    
    # Hospital/clinic requests
    if any(location in message_lower for location in ['hospital', 'clinic', 'doctor', 'near me', 'nearby']):
        return "I can help you find nearby healthcare facilities. Please share your location or the area you're in, and I'll provide you with the closest hospitals and clinics."
    
    # Default response
    return "I'm here to help with your maternal health questions. Could you please provide more details about what you'd like to know? I can help with symptoms, nutrition, exercise, or any other pregnancy-related concerns."

def get_session_history(session_id: str) -> Dict[str, Any]:
    """
    Retrieve chat session history.
    
    Args:
        session_id: Chat session identifier
        
    Returns:
        Session data including message history
    """
    if session_id not in chat_sessions:
        return {'error': 'Session not found'}
    
    return chat_sessions[session_id]

def update_session_context(session_id: str, context_updates: Dict[str, Any]) -> bool:
    """
    Update session context with new information.
    
    Args:
        session_id: Chat session identifier
        context_updates: New context information
        
    Returns:
        True if successful, False otherwise
    """
    if session_id not in chat_sessions:
        return False
    
    session = chat_sessions[session_id]
    session['context'].update(context_updates)
    return True