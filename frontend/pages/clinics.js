// pages/clinics.js
import { useState } from "react";

export default function Clinics() {
  const [address, setAddress] = useState("");
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchClinics = async (lat, lng) => {
    setError("");
    setLoading(true);
    setClinics([]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nearby-clinics`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: lat,
            longitude: lng,
            radius: 10000, // 10 km radius
          }),
        }
      );

      const data = await res.json();
      setClinics(data.clinics || []);
    } catch (err) {
      console.error("Error fetching clinics:", err);
      setError("❌ Failed to fetch clinics.");
    }
    setLoading(false);
  };

  // 🔎 Search by address (geocode first)
  const searchClinicsByAddress = async () => {
    if (!address.trim()) {
      setError("⚠️ Please enter a location (city, area, or address).");
      return;
    }
    setError("");
    setLoading(true);
    setClinics([]);

    try {
      const geoRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/geocode/${encodeURIComponent(
          address
        )}`
      );
      const geoData = await geoRes.json();

      if (!geoData.latitude || !geoData.longitude) {
        setError("❌ Could not find location. Try a more specific address.");
        setLoading(false);
        return;
      }

      await fetchClinics(geoData.latitude, geoData.longitude);
    } catch (err) {
      console.error("Error geocoding:", err);
      setError("❌ Failed to fetch location data.");
      setLoading(false);
    }
  };

  // 📍 Use browser geolocation
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("❌ Geolocation not supported by your browser.");
      return;
    }

    setError("");
    setLoading(true);
    setClinics([]);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchClinics(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("Location access denied:", err);
        setError("⚠️ Could not access your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-xl font-bold text-pink-600 mb-4">
          Find Nearby Clinics & Hospitals
        </h1>

        {/* Search input */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your city, area, or address"
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-pink-600"
          />
          <button
            onClick={searchClinicsByAddress}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
          >
            Search
          </button>
        </div>

        {/* Use my location */}
        <div className="mb-4">
          <button
            onClick={useMyLocation}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            📍 Use My Current Location
          </button>
        </div>

        {loading && <p className="text-gray-500">🔍 Searching clinics...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Results */}
        <div className="mt-4 space-y-3">
          {clinics.length > 0 ? (
            clinics.map((clinic, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg shadow-sm bg-gray-50"
              >
                <h2 className="font-semibold text-lg">{clinic.name}</h2>
                <p className="text-gray-600">{clinic.address}</p>
                {clinic.rating && (
                  <p className="text-sm text-yellow-600">
                    ⭐ {clinic.rating} / 5
                  </p>
                )}
              </div>
            ))
          ) : (
            !loading && <p className="text-gray-500">No clinics found yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
