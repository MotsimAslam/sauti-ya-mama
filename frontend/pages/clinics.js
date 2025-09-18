import { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "500px" };
const center = { lat: -1.286389, lng: 36.817223 }; // Default Nairobi

export default function Clinics() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [location, setLocation] = useState(center);
  const [clinics, setClinics] = useState([]);
  const [city, setCity] = useState("Nairobi");

  // Fetch nearby clinics
  const fetchClinics = async (lat, lng) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    service.nearbySearch(
      {
        location: { lat, lng },
        radius: 5000, // 5km
        type: ["hospital", "clinic"],
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setClinics(results);
        }
      }
    );
  };

  // Handle city selection
  const handleCityChange = async (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: selectedCity }, (results, status) => {
      if (status === "OK") {
        const loc = results[0].geometry.location;
        const coords = { lat: loc.lat(), lng: loc.lng() };
        setLocation(coords);
        fetchClinics(coords.lat, coords.lng);
      }
    });
  };

  useEffect(() => {
    if (isLoaded) {
      fetchClinics(location.lat, location.lng);
    }
  }, [isLoaded]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-purple-600 text-white py-4 px-6 shadow flex justify-between items-center">
        <h1 className="text-lg font-bold">Find Nearby Clinics 🏥</h1>
        <select
          value={city}
          onChange={handleCityChange}
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold"
        >
          <option value="Nairobi">Nairobi</option>
          <option value="Kisumu">Kisumu</option>
          <option value="Mombasa">Mombasa</option>
          <option value="Kampala">Kampala</option>
        </select>
      </header>

      {/* Map */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={location}
        >
          {clinics.map((place, idx) => (
            <Marker
              key={idx}
              position={{
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }}
            />
          ))}
        </GoogleMap>

        {/* Clinic List */}
        <div className="mt-6 grid gap-4">
          {clinics.map((c, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <h2 className="font-bold text-purple-600">{c.name}</h2>
              <p className="text-sm text-gray-600">
                {c.vicinity || "Address not available"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
