import os
from dotenv import load_dotenv

load_dotenv()

class VoiceAgent:
    def speak(self, text: str, language_code: str = "en") -> bytes:
        try:
            # For now, return None to avoid ElevenLabs dependency issues
            # In production, you can implement ElevenLabs integration here
            print(f"Voice generation requested: {text}")
            return None
        except Exception as e:
            print(f"Error generating speech: {e}")
            return None

def generate_health_alert(recommendation: str, patient_id: str) -> bytes:
    agent = VoiceAgent()
    audio = agent.speak(recommendation, language_code="sw")
    return audio