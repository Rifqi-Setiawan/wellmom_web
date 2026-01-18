"use client";

import { useState, useCallback } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  zoom?: number;
  height?: string;
}

function MapComponent({
  latitude,
  longitude,
  onLocationChange,
  height = "400px",
}: InteractiveMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLat, setDisplayLat] = useState(latitude);
  const [displayLng, setDisplayLng] = useState(longitude);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      );
      const data = await response.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        updateLocation(lat, lng);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lat = displayLat - ((y - rect.height / 2) / rect.height) * 0.02;
    const lng = displayLng + ((x - rect.width / 2) / rect.width) * 0.02;

    updateLocation(lat, lng);
  };

  return (
    <div className="relative" style={{ height }}>
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lokasi..."
            className="w-48 h-8 text-sm"
          />
          <Button type="submit" size="sm" className="h-8 px-3">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg flex flex-col">
        <button
          type="button"
          onClick={() => {}}
          className="px-3 py-2 hover:bg-gray-100 rounded-t-lg border-b text-lg font-bold"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {}}
          className="px-3 py-2 hover:bg-gray-100 rounded-b-lg text-lg font-bold"
        >
          −
        </button>
      </div>

      {/* Map Container */}
      <div className="w-full h-full bg-gray-100 rounded-lg relative overflow-hidden">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${displayLng - 0.01}%2C${displayLat - 0.01}%2C${displayLng + 0.01}%2C${displayLat + 0.01}&layer=mapnik&marker=${displayLat}%2C${displayLng}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          title="Interactive Map"
        />

        {/* Coordinates Display */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="font-mono text-xs">
              {displayLat.toFixed(6)}, {displayLng.toFixed(6)}
            </span>
          </div>
        </div>

        {/* Location Label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-4 pointer-events-none z-10">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            Lokasi Anda
          </div>
        </div>

        {/* Click Overlay */}
        <div
          className="absolute inset-0 cursor-crosshair"
          onClick={handleMapClick}
        />
      </div>
    </div>
  );
}

export function InteractiveMap(props: InteractiveMapProps) {
  return <MapComponent {...props} />;
}

export default InteractiveMap;
