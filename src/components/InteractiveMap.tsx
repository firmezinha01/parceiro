import React, { useEffect, useRef } from 'react';
import { LocationPoint } from '../types';

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
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Check if Leaflet is available globally from script tag or window
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const centerLat = pickup ? pickup.lat : driverPosition.lat;
      const centerLng = pickup ? pickup.lng : driverPosition.lng;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom pulse icon for Driver
      const driverIcon = L.divIcon({
        className: 'custom-driver-pin',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,102,0,0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 26px; height: 26px; border-radius: 50%; background: #FF6600; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Custom Pin A (Pickup)
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-pin',
        html: `
          <div style="background: #10B981; color: white; font-weight: 800; font-size: 13px; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
            <span style="transform: rotate(45deg);">A</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      // Custom Pin B (Delivery)
      const deliveryIcon = L.divIcon({
        className: 'custom-delivery-pin',
        html: `
          <div style="background: #EF4444; color: white; font-weight: 800; font-size: 13px; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
            <span style="transform: rotate(45deg);">B</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const boundsPoints: [number, number][] = [];

      // Add driver marker
      L.marker([driverPosition.lat, driverPosition.lng], { icon: driverIcon })
        .addTo(map)
        .bindPopup('<b>Você (Motorista)</b>');
      boundsPoints.push([driverPosition.lat, driverPosition.lng]);

      // Add pickup marker
      if (pickup) {
        L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<b>Ponto A (Coleta)</b><br/>${pickup.address}`);
        boundsPoints.push([pickup.lat, pickup.lng]);
      }

      // Add delivery marker
      if (delivery) {
        L.marker([delivery.lat, delivery.lng], { icon: deliveryIcon })
          .addTo(map)
          .bindPopup(`<b>Ponto B (Entrega)</b><br/>${delivery.address}`);
        boundsPoints.push([delivery.lat, delivery.lng]);
      }

      // Draw polyline route
      if (showRoute && boundsPoints.length >= 2) {
        L.polyline(boundsPoints, {
          color: '#FF6600',
          weight: 5,
          opacity: 0.8,
          dashArray: '8, 8',
        }).addTo(map);

        map.fitBounds(L.latLngBounds(boundsPoints), { padding: [40, 40] });
      }

      mapInstanceRef.current = map;
    } catch (e) {
      console.warn('Leaflet initialization error:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickup, delivery, driverPosition, showRoute, zoom]);

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-inner bg-slate-100 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {/* Visual map watermark indicator */}
      <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-semibold text-gray-600 shadow border border-gray-200">
        GPS Parceiro Live
      </div>
    </div>
  );
};
