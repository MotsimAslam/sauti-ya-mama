from elevenlabs import generate, play, set_api_key
import os
from dotenv import load_dotenv

load_dotenv()
set_api_key(os.getenv("ELEVENLABS_API_KEY"))

class VoiceAgent:
    def speak(self, text: str, language_code: str = "en") -> bytes:
        try:
            audio = generate(
                text=text,
                voice="Bella",
                model="eleven_multilingual_v2"
            )
            return audio
        except Exception as e:
            print(f"Error generating speech: {e}")
            return None

def generate_health_alert(recommendation: str, patient_id: str) -> bytes:
    agent = VoiceAgent()
    audio = agent.speak(recommendation, language_code="sw")
    return audio