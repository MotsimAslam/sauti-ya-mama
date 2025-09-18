import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import List, Dict
import json

load_dotenv()

class ChatAgent:
    """Agent responsible for handling conversational interactions"""
    
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_AI_API_KEY')
        if self.api_key:
            genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.chat_sessions = {}
    
    def initialize_chat_session(self, patient_id: str) -> str:
        """Initialize a new chat session for a patient"""
        session_id = f"session_{patient_id}_{len(self.chat_sessions)}"
        self.chat_sessions[session_id] = {
            'history': [],
            'patient_id': patient_id,
            'context': self._get_patient_context(patient_id)
        }
        return session_id
    
    def _get_patient_context(self, patient_id: str) -> str:
        """Get patient context for the chat"""
        from .triage_agent import get_patient_history
        history = get_patient_history(patient_id)
        
        context = f"""
        Patient: {history.get('name', 'Unknown')}
        Gestational Age: {history.get('gestational_age_weeks', 'Unknown')} weeks
        Known Conditions: {', '.join(history.get('known_conditions', []))}
        Language: {history.get('language', 'en')}
        
        You are a maternal health assistant. Provide helpful, accurate information about pregnancy,
        symptoms, and care. Always be supportive and encourage seeking professional medical help
        for serious concerns.
        """
        return context
    
    def send_message(self, session_id: str, message: str) -> Dict:
        """Process a user message and return agent response"""
        if session_id not in self.chat_sessions:
            return {"error": "Session not found"}
        
        session = self.chat_sessions[session_id]
        
        # Build conversation context
        conversation_context = session['context'] + "\n\nRecent conversation:\n"
        for msg in session['history'][-10:]:  # Last 10 messages for context
            conversation_context += f"{msg['role']}: {msg['content']}\n"
        
        # Generate response
        try:
            prompt = f"{conversation_context}\n\nUser: {message}\nAssistant:"
            response = self.model.generate_content(prompt)
            
            # Store in history
            session['history'].append({"role": "user", "content": message})
            session['history'].append({"role": "assistant", "content": response.text})
            
            return {
                "response": response.text,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": f"Failed to generate response: {str(e)}"}

# Coral Protocol integration
def initialize_chat(patient_id: str) -> Dict:
    agent = ChatAgent()
    session_id = agent.initialize_chat_session(patient_id)
    return {"session_id": session_id, "status": "created"}

def chat_with_agent(session_id: str, message: str) -> Dict:
    agent = ChatAgent()
    return agent.send_message(session_id, message)