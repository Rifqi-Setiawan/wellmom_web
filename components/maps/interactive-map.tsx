"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Dynamic import untuk menghindari SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false,
});

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  zoom?: number;
  height?: string;
}

interface NominatimResult {
  place_id: number;
  licence: string;
  powered_by: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

// Component untuk update map center (harus di dalam MapContainer)
// Ini akan dibuat secara dinamis di dalam MapContainer
const MapUpdaterComponent = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod;
      
      return function MapUpdater({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
        const map = useMap();
        
        useEffect(() => {
          map.setView([lat, lng], zoom);
        }, [lat, lng, zoom, map]);
        
        return null;
      };
    }),
  { ssr: false }
);

function MapComponent({
  latitude,
  longitude,
  onLocationChange,
  height = "400px",
  zoom: initialZoom = 15,
}: InteractiveMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLat, setDisplayLat] = useState(latitude);
  const [displayLng, setDisplayLng] = useState(longitude);
  const [zoom, setZoom] = useState(initialZoom);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update display coordinates when props change
  useEffect(() => {
    setDisplayLat(latitude);
    setDisplayLng(longitude);
  }, [latitude, longitude]);

  const updateLocation = useCallback(
    (lat: number, lng: number) => {
      setDisplayLat(lat);
      setDisplayLng(lng);
      if (onLocationChange) {
        onLocationChange(lat, lng);
      }
    },
    [onLocationChange],
  );

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplete search dengan debounce
  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(false);

    if (!value.trim()) {
      setSearchSuggestions([]);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&countrycodes=id&addressdetails=1`,
          {
            headers: {
              "User-Agent": "WellMom-WebApp/1.0",
            },
          }
        );
        const data: NominatimResult[] = await response.json();
        setSearchSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: NominatimResult) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    updateLocation(lat, lng);
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    setZoom(16);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=id`,
        {
          headers: {
            "User-Agent": "WellMom-WebApp/1.0",
          },
        }
      );
      const data: NominatimResult[] = await response.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        updateLocation(lat, lng);
        setSearchQuery(data[0].display_name);
        setZoom(16);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Get current location using geolocation API
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser Anda.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateLocation(lat, lng);
        setZoom(16);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Gagal mendapatkan lokasi saat ini. Pastikan izin lokasi sudah diberikan.");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 3));
  };

  return (
    <div className="relative" style={{ height }}>
      {/* Search Bar with Autocomplete */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 w-80">
        <div className="relative" ref={suggestionsRef}>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Cari lokasi..."
                className="pl-10 pr-10 h-9 text-sm"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            <Button type="submit" size="sm" className="h-9 px-3" disabled={isSearching}>
              <Search className="w-4 h-4" />
            </Button>
          </form>

          {/* Autocomplete Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
              {searchSuggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.display_name.split(",")[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {suggestion.display_name.split(",").slice(1).join(",").trim()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Location Button */}
      <div className="absolute top-4 left-[22rem] z-[1000]">
        <Button
          type="button"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="h-9 px-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-lg"
          title="Deteksi Lokasi Saat Ini"
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Map Container */}
      <div className="w-full h-full bg-gray-100 rounded-lg relative overflow-hidden">
        <MapContainer
          center={[displayLat, displayLng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          scrollWheelZoom={true}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[displayLat, displayLng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                updateLocation(position.lat, position.lng);
              },
            }}
          />
          <MapUpdaterComponent lat={displayLat} lng={displayLng} zoom={zoom} />
        </MapContainer>

        {/* Coordinates Display */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 text-sm z-[1000]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="font-mono text-xs">
              {displayLat.toFixed(6)}, {displayLng.toFixed(6)}
            </span>
          </div>
        </div>

        {/* Location Label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-4 pointer-events-none z-[999]">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            Lokasi Anda
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveMap(props: InteractiveMapProps) {
  return (
    <div className="w-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <MapComponent {...props} />
    </div>
  );
}

export default InteractiveMap;
