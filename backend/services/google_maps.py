import googlemaps
import os
from dotenv import load_dotenv
from math import radians, cos, sin, asin, sqrt

load_dotenv()

class GoogleMapsService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not api_key:
            raise ValueError("❌ Missing GOOGLE_MAPS_API_KEY in .env file")
        self.client = googlemaps.Client(key=api_key)

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
            return hospitals
        except Exception as e:
            print(f"Error fetching hospitals: {e}")
            return []

# ✅ Export singleton
google_maps_service = GoogleMapsService()
