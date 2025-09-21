import googlemaps
import os
from dotenv import load_dotenv
from math import radians, cos, sin, asin, sqrt
import requests

load_dotenv()

class GoogleMapsService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.ai_ml_key = os.getenv("AI_ML_API_KEY", "9d0da856e8cc438c95e659b35e76a378")

        if not self.api_key and not self.ai_ml_key:
            raise ValueError("❌ Missing GOOGLE_MAPS_API_KEY or AI/ML_API_KEY in .env file")

        if self.api_key:
            self.client = googlemaps.Client(key=self.api_key)
        else:
            self.client = None

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        """Calculate great-circle distance (km) between two coordinates."""
        R = 6371
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
        c = 2 * asin(sqrt(a))
        return round(R * c, 2)

    def _fallback_ai_ml(self, latitude: float, longitude: float, radius: int = 5000):
        """
        Use AI/ML API as fallback to suggest nearby hospitals.
        """
        try:
            url = "https://api.aimlapi.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.ai_ml_key}"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an assistant that suggests nearby hospitals and clinics.",
                    },
                    {
                        "role": "user",
                        "content": f"Find hospitals within {radius/1000} km of latitude {latitude}, longitude {longitude}. Return as a list with name, address, rating (if known).",
                    },
                ],
            }

            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"]

            # Very simple parsing (AI may output in bullet points or JSON-like)
            hospitals = []
            for line in text.split("\n"):
                if line.strip():
                    hospitals.append(
                        {
                            "name": line.strip().split(" - ")[0],
                            "address": line.strip(),
                            "rating": "N/A",
                            "user_ratings_total": 0,
                            "location": {"lat": latitude, "lng": longitude},
                            "distance_km": 0.0,
                        }
                    )
            return hospitals[:5] if hospitals else []
        except Exception as e:
            print(f"❌ AI/ML fallback failed: {e}")
            return []

    def find_nearby_hospitals(self, latitude: float, longitude: float, radius: int = 5000):
        """
        Try Google Maps first, fallback to AI/ML API if fails.
        """
        if self.client:
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

                hospitals.sort(key=lambda h: h["distance_km"])
                return hospitals
            except Exception as e:
                print(f"⚠️ Google Maps API failed: {e}")

        # fallback
        return self._fallback_ai_ml(latitude, longitude, radius)


# ✅ Export singleton
google_maps_service = GoogleMapsService()
