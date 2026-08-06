// src/components/LocationPicker.jsx
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker icons reference image files via relative paths
// that break under bundlers like Vite — this points them at a CDN instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [19.076, 72.8777]; // Mumbai — reasonable default for this app's audience
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * A search-box + draggable-pin map that resolves to {lat, lng, address}.
 * Used for both origin and destination pickers in PostTripPage and
 * SearchTripsPage, so the geocoding/marker logic only lives in one place.
 * Built on Leaflet + OpenStreetMap/Nominatim — no API key or billing needed.
 */
export default function LocationPicker({ label, value, onChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  // Initialize the map once.
  useEffect(() => {
    if (mapRef.current) return;

    const center = value?.lat ? [value.lat, value.lng] : DEFAULT_CENTER;
    const map = L.map(mapContainerRef.current).setView(center, value?.lat ? 13 : 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker(center, { draggable: true }).addTo(map);

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      reverseGeocode(lat, lng);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      reverseGeocode(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setQuery(address);
      onChange({ lat, lng, address });
    } catch {
      onChange({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
    }
  };

  const handleSearchChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `${NOMINATIM_BASE}/search?q=${encodeURIComponent(text)}&format=json&limit=5`
      );
      const data = await res.json();
      setSuggestions(data || []);
    }, 500); // Nominatim's usage policy asks for max ~1 request/sec — 500ms gives headroom
  };

  const handleSelectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setQuery(place.display_name);
    setSuggestions([]);
    mapRef.current.setView([lat, lng], 14);
    markerRef.current.setLatLng([lat, lng]);
    onChange({ lat, lng, address: place.display_name });
  };

  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <input
          value={query}
          onChange={handleSearchChange}
          placeholder="Search for an address..."
          className="w-full border rounded-md px-3 py-2 text-sm mb-2"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-md shadow-sm mt-[-4px] max-h-48 overflow-y-auto">
            {suggestions.map((place) => (
              <button
                type="button"
                key={place.place_id}
                onClick={() => handleSelectSuggestion(place)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                {place.display_name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div ref={mapContainerRef} className="w-full h-56 rounded-md border" />
      <p className="text-xs text-gray-400 mt-1">Search, click the map, or drag the pin to set the exact spot.</p>
    </div>
  );
}