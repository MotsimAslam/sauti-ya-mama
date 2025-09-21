import googlemaps
import os
from dotenv import load_dotenv
from math import radians, cos, sin, asin, sqrt
from openai import OpenAI

load_dotenv()

class GoogleMapsService:
    def __init__(self):
        # ✅ Google Maps setup
        api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not api_key:
            raise ValueError("❌ Missing GOOGLE_MAPS_API_KEY in .env file")
        self.client = googlemaps.Client(key=api_key)

        # ✅ Mistral setup (via OpenAI API)
        mistral_api_key = os.getenv("MISTRAL_API_KEY")
        if not mistral_api_key:
            raise ValueError("❌ Missing MISTRAL_API_KEY in .env file")
        self.mistral_client = OpenAI(api_key=mistral_api_key)

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        """
        Calculate great-circle distance (km) between two coordinates.
        """
        R = 6371  # Earth radius in km
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
        c = 2 * asin(sqrt(a))
        return round(R * c, 2)

    def find_nearby_hospitals(self, latitude: float, longitude: float, radius: int = 5000):
        """
        Finds nearby hospitals using Google Maps and enriches results with AI summary.
        """
        try:
            results = self.client.places_nearby(
                location=(latitude, longitude),
                radius=radius,
                type="hospital"
            )

            hospitals = []
            for place in results.get("results", []):
                loc = place["geometry"]["location"]
                distance_km = self._haversine_distance(
                    latitude, longitude, loc["lat"], loc["lng"]
                )

                hospitals.append({
                    "name": place.get("name"),
                    "address": place.get("vicinity"),
                    "rating": place.get("rating", "N/A"),
                    "user_ratings_total": place.get("user_ratings_total", 0),
                    "location": loc,
                    "distance_km": distance_km
                })

            # Sort by nearest first
            hospitals.sort(key=lambda h: h["distance_km"])

            # ✅ Generate a short AI summary using Mistral
            summary = self._summarize_hospitals(hospitals)

            return {
                "hospitals": hospitals,
                "ai_summary": summary
            }
        except Exception as e:
            print(f"Error fetching hospitals: {e}")
            return {"hospitals": [], "ai_summary": "⚠️ Could not fetch hospital data."}

    def _summarize_hospitals(self, hospitals):
        """
        Uses Mistral AI to summarize hospital data for users.
        """
        if not hospitals:
            return "No hospitals were found nearby."

        # Prepare a simple text list for Mistral
        hospital_text = "\n".join(
            [f"{h['name']} ({h['distance_km']} km away, rating {h['rating']})"
             for h in hospitals[:5]]
        )

        try:
            response = self.mistral_client.chat.completions.create(
                model="mistral-tiny",  # ✅ Using a light Mistral model
                messages=[
                    {"role": "system", "content": "You are a maternal health assistant."},
                    {"role": "user", "content": f"Here are some hospitals:\n{hospital_text}\n\nSummarize them in 2-3 sentences for a pregnant woman seeking care."}
                ],
                temperature=0.7
            )
            return response.choices[0].message["content"]
        except Exception as e:
            print(f"Error generating AI summary: {e}")
            return "Nearby hospitals found, but I couldn’t generate a summary."

# ✅ Export singleton (will be created when needed)
google_maps_service = None

def get_google_maps_service():
    """Get or create Google Maps service instance"""
    global google_maps_service
    if google_maps_service is None:
        google_maps_service = GoogleMapsService()
    return google_maps_service
