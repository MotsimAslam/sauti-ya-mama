import os
from dotenv import load_dotenv

load_dotenv()

# Try to import Supabase, but make it optional
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("Supabase not available - running without database features")

class SupabaseService:
    def __init__(self):
        if not SUPABASE_AVAILABLE:
            self.client = None
            return
            
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_SERVICE_KEY')
        self.client: Client = create_client(self.url, self.key)
    
    def save_chat_message(self, session_id: str, role: str, content: str, patient_id: str):
        if not SUPABASE_AVAILABLE or not self.client:
            print("Supabase not available - chat message not saved")
            return None
        try:
            data = {
                'session_id': session_id,
                'role': role,
                'content': content,
                'patient_id': patient_id
            }
            result = self.client.table('chat_messages').insert(data).execute()
            return result
        except Exception as e:
            print(f"Error saving chat message: {e}")
            return None
    
    def get_chat_history(self, session_id: str):
        if not SUPABASE_AVAILABLE or not self.client:
            print("Supabase not available - returning empty chat history")
            return []
        try:
            result = self.client.table('chat_messages')\
                .select('*')\
                .eq('session_id', session_id)\
                .order('created_at')\
                .execute()
            return result.data
        except Exception as e:
            print(f"Error fetching chat history: {e}")
            return []
    
    def create_user(self, email: str, password: str, user_data: dict):
        try:
            auth_response = self.client.auth.sign_up({
                'email': email,
                'password': password,
            })
            profile_data = {
                'id': auth_response.user.id,
                'email': email,
                **user_data
            }
            self.client.table('profiles').insert(profile_data).execute()
            return auth_response
        except Exception as e:
            print(f"Error creating user: {e}")
            return None

supabase_service = SupabaseService()