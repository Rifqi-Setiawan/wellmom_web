'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Loader2 } from 'lucide-react';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export function LocationMap({ latitude, longitude, onLocationChange }: LocationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung oleh browser Anda');
      return;
    }

    setIsDetecting(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        console.log('📍 Current location detected:', lat, lng);
        
        // Update marker and map
        if (markerRef.current && mapRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.setView([lat, lng], 15);
        }
        
        // Notify parent component
        onLocationChange(lat, lng);
        setIsDetecting(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Gagal mendeteksi lokasi';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Izin akses lokasi ditolak. Silakan aktifkan di pengaturan browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia';
            break;
          case error.TIMEOUT:
            errorMessage = 'Waktu deteksi lokasi habis';
            break;
        }
        
        setLocationError(errorMessage);
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(
        [latitude || -6.2088, longitude || 106.8456], // Default to Jakarta if no coordinates
        latitude && longitude ? 15 : 10
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Add draggable marker
      const marker = L.marker([latitude || -6.2088, longitude || 106.8456], {
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      // Handle marker drag
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onLocationChange(position.lat, position.lng);
        console.log('📍 Location updated:', position.lat, position.lng);
      });

      // Handle map click to move marker
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onLocationChange(e.latlng.lat, e.latlng.lng);
        console.log('📍 Location updated via click:', e.latlng.lat, e.latlng.lng);
      });
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker position when props change
  useEffect(() => {
    if (markerRef.current && latitude && longitude) {
      markerRef.current.setLatLng([latitude, longitude]);
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 15);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-3">
      {/* Detect Location Button */}
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={isDetecting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
      >
        {isDetecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mendeteksi lokasi...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Deteksi Lokasi Saya
          </>
        )}
      </button>

      {/* Error Message */}
      {locationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {locationError}
        </div>
      )}

      {/* Map */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[400px] rounded-lg border border-gray-200 z-0"
      />
      
      <p className="text-xs text-gray-500">
        💡 Klik pada peta atau geser marker untuk mengubah lokasi
      </p>
    </div>
  );
}
