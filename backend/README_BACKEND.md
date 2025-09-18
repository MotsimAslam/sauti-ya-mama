# Sauti Ya Mama - Backend Setup

## Installation
1. Create virtual environment: `python -m venv venv`
2. Activate: `source venv/bin/activate` (Linux/Mac) or `.\venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`

## Environment Variables
Copy `.env.example` to `.env` and add your API keys:
- ELEVENLABS_API_KEY
- MISTRAL_API_KEY
- GOOGLE_MAPS_API_KEY

## Run Server
```bash
uvicorn main:app --reload --port 8000