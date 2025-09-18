import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Phone, Star, Clock, Navigation } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const center = {
  lat: -1.2921,
  lng: 36.8219
};

export default function ClinicMap({ clinics, onLocationSelect }) {
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          if (onLocationSelect) {
            onLocationSelect(position.coords.latitude, position.coords.longitude);
          }
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, [onLocationSelect]);

  const getDirections = (clinic) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${clinic.location.lat},${clinic.location.lng}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || center}
        zoom={userLocation ? 12 : 10}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#4285F4" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="4" fill="white"/>
                </svg>
              `)
            }}
          />
        )}

        {clinics.map((clinic, index) => (
          <Marker
            key={index}
            position={clinic.location}
            icon={{
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" fill="${clinic.open_now ? '#34A853' : '#EA4335'}"/>
                </svg>
              `)
            }}
            onClick={() => setSelectedClinic(clinic)}
          />
        ))}

        {selectedClinic && (
          <InfoWindow
            position={selectedClinic.location}
            onCloseClick={() => setSelectedClinic(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-lg mb-2">{selectedClinic.name}</h3>
              <p className="text-gray-600 text-sm mb-2">
                <MapPin size={14} className="inline mr-1" />
                {selectedClinic.address}
              </p>
              <p className="text-gray-600 text-sm mb-2">
                <Phone size={14} className="inline mr-1" />
                {selectedClinic.phone}
              </p>
              <p className="text-gray-600 text-sm mb-2">
                <Star size={14} className="inline mr-1" />
                Rating: {selectedClinic.rating}
              </p>
              <p className="text-gray-600 text-sm mb-3">
                <Clock size={14} className="inline mr-1" />
                {selectedClinic.open_now === true ? 'Open now' : 
                 selectedClinic.open_now === false ? 'Closed' : 'Hours not available'}
              </p>
              <p className="text-green-600 text-sm font-semibold mb-3">
                {selectedClinic.distance.toFixed(1)} km away
              </p>
              <button
                onClick={() => getDirections(selectedClinic)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center"
              >
                <Navigation size={14} className="mr-1" />
                Directions
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}