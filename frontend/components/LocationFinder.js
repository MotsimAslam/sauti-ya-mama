import { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Phone, Star, Clock } from 'lucide-react';
import axios from 'axios';

export default function LocationFinder() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');

  const fetchNearbyClinics = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/nearby-clinics', {
        latitude: lat,
        longitude: lng,
        radius: 20000
      });
      setClinics(response.data.clinics);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      // Use mock data if API fails
      setClinics([
        {
          name: "Nairobi Women's Hospital",
          address: "Argwings Kodhek Rd, Nairobi",
          phone: "+254 703 082 000",
          location: {lat: -1.2921, lng: 36.8219},
          distance: 2.3,
          rating: 4.5,
          open_now: true
        },
        {
          name: "Aga Khan University Hospital",
          address: "3rd Parklands Avenue, Nairobi",
          phone: "+254 711 011 888",
          location: {lat: -1.2684, lng: 36.8065},
          distance: 3.1,
          rating: 4.7,
          open_now: true
        }
      ]);
    }
    setLoading(false);
  };

  const handleLocationSelect = (lat, lng) => {
    setUserLocation({ lat, lng });
    fetchNearbyClinics(lat, lng);
  };

  const handleSearch = async () => {
    if (searchAddress.trim()) {
      setLoading(true);
      try {
        // For demo purposes, use a fixed location
        handleLocationSelect(-1.2921, 36.8219);
      } catch (error) {
        console.error('Error geocoding address:', error);
        alert('Could not find this location. Please try a different address.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          placeholder="Enter your address or area..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
        >
          <Search size={20} className="mr-2" />
          Search
        </button>
      </div>

      {/* Map placeholder */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Map would be displayed here with Google Maps API</p>
          </div>
        </div>
      </div>

      {/* Clinics List */}
      {clinics.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            <MapPin className="text-red-500 mr-2" />
            Nearby Maternal Health Facilities ({clinics.length} found)
          </h3>
          
          <div className="space-y-4">
            {clinics.map((clinic, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{clinic.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      <MapPin size={14} className="inline mr-1" />
                      {clinic.address}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      <Phone size={14} className="inline mr-1" />
                      {clinic.phone}
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-sm">
                      <span className={`inline-flex items-center ${
                        clinic.open_now ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <Clock size={14} className="mr-1" />
                        {clinic.open_now === true ? 'Open now' : 
                         clinic.open_now === false ? 'Closed' : 'Hours not available'}
                      </span>
                      <span className="inline-flex items-center text-yellow-600">
                        <Star size={14} className="mr-1" />
                        {clinic.rating}
                      </span>
                      <span className="text-blue-600 font-semibold">
                        {clinic.distance.toFixed(1)} km away
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${clinic.location.lat},${clinic.location.lng}&travelmode=driving`;
                      window.open(url, '_blank');
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center ml-4"
                  >
                    <Navigation size={14} className="mr-1" />
                    Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Finding nearby clinics...</p>
        </div>
      )}
    </div>
  );
}