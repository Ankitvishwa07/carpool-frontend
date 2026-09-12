import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [19.076, 72.8777]; // Mumbai default
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export default function LocationPicker({ label, value, onChange, id }) {
  const inputId = id || `loc-picker-${label?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'input'}`;
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [query, setQuery] = useState(value?.address || '');
  const [prevAddress, setPrevAddress] = useState(value?.address);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  if (value?.address !== undefined && value.address !== prevAddress) {
    setPrevAddress(value.address);
    setQuery(value.address || '');
  }

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

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center = value?.lat && value?.lng ? [value.lat, value.lng] : DEFAULT_CENTER;
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

    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (value?.lat && value?.lng && mapRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - value.lat) > 0.0001 || Math.abs(currentPos.lng - value.lng) > 0.0001) {
        mapRef.current.setView([value.lat, value.lng], 13);
        markerRef.current.setLatLng([value.lat, value.lng]);
      }
    }
  }, [value?.lat, value?.lng]);

  const handleSearchChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${NOMINATIM_BASE}/search?q=${encodeURIComponent(text)}&format=json&limit=5`
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setQuery(place.display_name);
    setSuggestions([]);
    mapRef.current?.setView([lat, lng], 14);
    markerRef.current?.setLatLng([lat, lng]);
    onChange({ lat, lng, address: place.display_name });
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapRef.current?.setView([lat, lng], 14);
        markerRef.current?.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 cursor-pointer">
          <span aria-hidden="true">📍</span> {label}
        </label>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="text-[11px] text-[#16A34A] hover:underline flex items-center gap-1 font-bold focus-ring rounded-lg px-1"
          aria-label={`Use my current location for ${label}`}
        >
          <span aria-hidden="true">🎯</span> Use My Location
        </button>
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          <input
            id={inputId}
            value={query}
            onChange={handleSearchChange}
            placeholder="Search address or landmark..."
            aria-label={label}
            className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold pr-9 text-slate-900 placeholder:text-slate-400 focus-ring"
          />
          {loading && (
            <div className="absolute right-3 w-4 h-4 rounded-full border-2 border-[#16A34A] border-t-transparent animate-spin"></div>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="absolute z-30 w-full bg-white border border-emerald-100 rounded-xl shadow-xl mt-1.5 max-h-52 overflow-y-auto divide-y divide-emerald-50">
            {suggestions.map((place) => (
              <button
                type="button"
                key={place.place_id}
                onClick={() => handleSelectSuggestion(place)}
                className="block w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-[#16A34A] transition-colors focus-ring"
              >
                <span className="font-bold block truncate text-slate-900">{place.display_name.split(',')[0]}</span>
                <span className="text-[11px] text-slate-500 truncate block">{place.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-emerald-200 dark:border-emerald-800 shadow-sm">
        <div ref={mapContainerRef} className="w-full h-44 sm:h-52 z-10 touch-pan-y" />
      </div>

      <p className="text-[11px] text-slate-500 flex items-center gap-1">
        <span>💡</span> Search an address, click the map, or drag the pin to select location.
      </p>
    </div>
  );
}