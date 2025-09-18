import googlemaps
import os
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

class GoogleMapsService:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_MAPS_API_KEY not found in environment variables")
        self.client = googlemaps.Client(key=self.api_key)

    def find_nearby_hospitals(self, latitude: float, longitude: float, radius: int = 10000) -> List[Dict]:
        try:
            places_result = self.client.places_nearby(
                location=(latitude, longitude),
                radius=radius,
                type='hospital',
                keyword='maternity|women|health'
            )
            
            hospitals = []
            for place in places_result.get('results', [])[:10]:
                place_details = self.client.place(
                    place_id=place['place_id'],
                    fields=['name', 'formatted_address', 'formatted_phone_number', 'geometry', 'rating', 'opening_hours']
                )
                
                hospital_data = {
                    'name': place.get('name'),
                    'address': place.get('vicinity', place_details['result'].get('formatted_address', '')),
                    'phone': place_details['result'].get('formatted_phone_number', 'Not available'),
                    'location': place['geometry']['location'],
                    'distance': self._calculate_distance(latitude, longitude, 
                                                       place['geometry']['location']['lat'],
                                                       place['geometry']['location']['lng']),
                    'rating': place.get('rating', 'Not rated'),
                    'open_now': place_details['result'].get('opening_hours', {}).get('open_now', None),
                    'place_id': place['place_id']
                }
                hospitals.append(hospital_data)
            
            hospitals.sort(key=lambda x: x['distance'])
            return hospitals
            
        except Exception as e:
            print(f"Google Maps API error: {e}")
            return []

    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c

google_maps_service = GoogleMapsService()