import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint } from '../types';
import { Navigation, Compass, MapPin } from 'lucide-react';

interface InteractiveMapProps {
  pickup?: LocationPoint;
  delivery?: LocationPoint;
  driverPosition?: { lat: number; lng: number };
  showRoute?: boolean;
  className?: string;
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickup,
  delivery,
  driverPosition = { lat: -23.5615, lng: -46.6559 },
  showRoute = true,
  className = 'w-full h-64',
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [currentGps, setCurrentGps] = useState<{ lat: number; lng: number }>(driverPosition);
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [routeDistanceText, setRouteDistanceText] = useState<string>('');

  // 1. Get real GPS location from device
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentGps({ lat, lng });
          setGpsActive(true);
        },
        (err) => {
          console.log('GPS permissão ou indisponível, usando coordenadas padrão:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // 2. Initialize and render Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const startLat = currentGps.lat;
      const startLng = currentGps.lng;

      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // 100% Free OpenStreetMap tile server - Zero API keys, no watermarks, full detail
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Custom icon for Driver (animated pulse)
      const driverIcon = L.divIcon({
        className: 'custom-driver-pin',
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,102,0,0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #FF6600; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Custom Pin A (Pickup Coleta)
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-pin',
        html: `
          <div style="background: #10B981; color: white; font-weight: 900; font-size: 13px; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            <span style="transform: rotate(45deg);">A</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      // Custom Pin B (Delivery Entrega)
      const deliveryIcon = L.divIcon({
        className: 'custom-delivery-pin',
        html: `
          <div style="background: #EF4444; color: white; font-weight: 900; font-size: 13px; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            <span style="transform: rotate(45deg);">B</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const allCoords: [number, number][] = [];

      // Add driver marker
      L.marker([currentGps.lat, currentGps.lng], { icon: driverIcon })
        .addTo(map)
        .bindPopup('<b>Você (Motorista Parceiro)</b>');
      allCoords.push([currentGps.lat, currentGps.lng]);

      // Add pickup marker
      if (pickup) {
        L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<b>Ponto A (Coleta)</b><br/>${pickup.address}`);
        allCoords.push([pickup.lat, pickup.lng]);
      }

      // Add delivery marker
      if (delivery) {
        L.marker([delivery.lat, delivery.lng], { icon: deliveryIcon })
          .addTo(map)
          .bindPopup(`<b>Ponto B (Entrega)</b><br/>${delivery.address}`);
        allCoords.push([delivery.lat, delivery.lng]);
      }

      // Real street routing with OSRM
      if (showRoute && allCoords.length >= 2) {
        // Construct OSRM url
        const coordString = allCoords.map(c => `${c[1]},${c[0]}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

        fetch(osrmUrl)
          .then(res => res.json())
          .then(routeData => {
            if (routeData.routes && routeData.routes[0]) {
              const route = routeData.routes[0];
              const geojsonCoords = route.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]);
              
              // Shadow glow path
              L.polyline(geojsonCoords, {
                color: '#FF6600',
                weight: 8,
                opacity: 0.35,
              }).addTo(map);

              // Solid path
              L.polyline(geojsonCoords, {
                color: '#FF6600',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }).addTo(map);

              if (route.distance) {
                const km = (route.distance / 1000).toFixed(1);
                setRouteDistanceText(`${km} km pela rota mais rápida`);
              }

              map.fitBounds(L.latLngBounds(geojsonCoords), { padding: [50, 50] });
            } else {
              // Fallback straight polyline
              drawFallbackLine(allCoords, map);
            }
          })
          .catch(() => {
            drawFallbackLine(allCoords, map);
          });
      } else if (allCoords.length === 1) {
        map.setView([allCoords[0][0], allCoords[0][1]], zoom);
      }

      mapInstanceRef.current = map;
    } catch (e) {
      console.warn('Leaflet error:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickup, delivery, currentGps.lat, currentGps.lng, showRoute, zoom]);

  const drawFallbackLine = (coords: [number, number][], map: L.Map) => {
    L.polyline(coords, {
      color: '#FF6600',
      weight: 5,
      opacity: 0.9,
      dashArray: '10, 8',
    }).addTo(map);
    map.fitBounds(L.latLngBounds(coords), { padding: [45, 45] });
  };

  const handleCenterGps = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentGps.lat, currentGps.lng], 16, { animate: true });
    }
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-md border border-gray-200/80 bg-slate-100 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Route distance indicator banner */}
      {routeDistanceText && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-bold text-gray-800 shadow-md border border-gray-200 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-lala-orange animate-pulse" />
          <span>{routeDistanceText}</span>
        </div>
      )}

      {/* Center GPS button */}
      <button
        onClick={handleCenterGps}
        className="absolute top-2.5 right-2.5 z-10 w-9 h-9 bg-white/95 hover:bg-white text-gray-700 rounded-xl shadow-md border border-gray-200 flex items-center justify-center transition-all active:scale-95"
        title="Centralizar na minha posição"
      >
        <Compass className={`w-5 h-5 ${gpsActive ? 'text-emerald-600' : 'text-gray-500'}`} />
      </button>

      {/* GPS Status Pill */}
      <div className="absolute bottom-2.5 right-2.5 z-10 bg-white/90 backdrop-blur px-2.5 py-1 rounded-xl text-[10px] font-bold text-gray-700 shadow border border-gray-200 flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-emerald-500 animate-ping' : 'bg-lala-orange'}`} />
        <span>{gpsActive ? 'GPS Real Conectado' : 'GPS Parceiro Live'}</span>
      </div>
    </div>
  );
};
