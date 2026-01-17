'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to recenter map when coordinates change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  
  return null;
}

interface MapViewProps {
  latitude: number;
  longitude: number;
  name: string;
}

export default function MapView({ latitude, longitude, name }: MapViewProps) {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={icon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{name}</p>
              <p className="text-xs text-gray-600 mt-1">
                {latitude}, {longitude}
              </p>
            </div>
          </Popup>
        </Marker>
        <RecenterMap lat={latitude} lng={longitude} />
      </MapContainer>
    </div>
  );
}
