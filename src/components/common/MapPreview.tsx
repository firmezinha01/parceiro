import React from 'react';
import { Address, VehicleModal, DeliveryStatus } from '../../types';
import { MapPin, Navigation, Bike, Car, Store, Flag } from 'lucide-react';

interface MapPreviewProps {
  origin: Address;
  destination: Address;
  dropoffAddress?: Address;
  modal?: VehicleModal;
  status?: DeliveryStatus;
  distanceKm?: number;
  durationMin?: number;
  className?: string;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  origin,
  destination,
  dropoffAddress,
  modal = 'moto',
  status = 'in_transit',
  distanceKm = 5.2,
  durationMin = 16,
  className = '',
}) => {
  // Coordenadas normalizadas em viewBox 600x320
  const pOrigin = { x: 100, y: 220 };
  const pDropoff = dropoffAddress ? { x: 260, y: 130 } : null;
  const pDest = { x: 500, y: 80 };

  // Posição estimada do entregador baseada no status
  let courierPos = { x: 100, y: 220 };
  if (status === 'created') {
    courierPos = { x: 80, y: 260 };
  } else if (status === 'at_dropoff') {
    courierPos = pDropoff || { x: 240, y: 150 };
  } else if (status === 'in_transit') {
    courierPos = pDropoff ? { x: 380, y: 100 } : { x: 300, y: 150 };
  } else if (status === 'delivered') {
    courierPos = { x: 500, y: 80 };
  }

  // Gera caminho da rota (SVG path curva suave)
  const pathD = pDropoff
    ? `M ${pOrigin.x} ${pOrigin.y} Q 180 200, ${pDropoff.x} ${pDropoff.y} T ${pDest.x} ${pDest.y}`
    : `M ${pOrigin.x} ${pOrigin.y} Q 280 260, 310 150 T ${pDest.x} ${pDest.y}`;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner select-none ${className}`}>
      {/* Mock Map Background Grid & Streets */}
      <svg className="w-full h-56 sm:h-64" viewBox="0 0 600 320" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Fundo do mapa */}
        <rect width="600" height="320" fill="#f1f5f9" />
        <rect width="600" height="320" fill="url(#grid)" />

        {/* Ruas simuladas de fundo */}
        <path d="M 0 100 L 600 120" stroke="#cbd5e1" strokeWidth="12" fill="none" opacity="0.6" />
        <path d="M 0 240 L 600 200" stroke="#cbd5e1" strokeWidth="10" fill="none" opacity="0.6" />
        <path d="M 180 0 L 150 320" stroke="#cbd5e1" strokeWidth="14" fill="none" opacity="0.5" />
        <path d="M 420 0 L 440 320" stroke="#cbd5e1" strokeWidth="12" fill="none" opacity="0.5" />
        <path d="M 80 0 C 120 150, 480 180, 560 320" stroke="#e2e8f0" strokeWidth="8" fill="none" />

        {/* Linha da Rota Principal */}
        <path
          d={pathD}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d={pathD}
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="6 4"
          className="animate-[dash_20s_linear_infinite]"
        />

        {/* Marcador Origem */}
        <g transform={`translate(${pOrigin.x - 12}, ${pOrigin.y - 28})`}>
          <circle cx="12" cy="12" r="10" fill="#3b82f6" opacity="0.2" />
          <circle cx="12" cy="12" r="6" fill="#2563eb" />
        </g>

        {/* Marcador Ponto Lojista (se houver) */}
        {pDropoff && (
          <g transform={`translate(${pDropoff.x - 14}, ${pDropoff.y - 28})`}>
            <circle cx="14" cy="14" r="14" fill="#a855f7" opacity="0.25" />
            <rect x="4" y="4" width="20" height="20" rx="4" fill="#9333ea" />
            <circle cx="14" cy="14" r="4" fill="#ffffff" />
          </g>
        )}

        {/* Marcador Destino */}
        <g transform={`translate(${pDest.x - 12}, ${pDest.y - 28})`}>
          <circle cx="12" cy="12" r="12" fill="#10b981" opacity="0.25" />
          <circle cx="12" cy="12" r="7" fill="#059669" />
          <circle cx="12" cy="12" r="3" fill="#ffffff" />
        </g>

        {/* Marcador Móvel do Entregador */}
        {status !== 'delivered' && (
          <g transform={`translate(${courierPos.x - 18}, ${courierPos.y - 18})`}>
            <circle cx="18" cy="18" r="16" fill="#f59e0b" opacity="0.3" className="animate-ping" />
            <circle cx="18" cy="18" r="15" fill="#d97706" />
            <circle cx="18" cy="18" r="12" fill="#ffffff" />
            <g transform="translate(10, 10)">
              {modal === 'moto' ? (
                <path d="M2 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0m8 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0M7 7l3-3h2l-2 5H7z" fill="#d97706" />
              ) : (
                <path d="M2 7l2-4h8l2 4v4H2V7zm2 5a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm8 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" fill="#d97706" />
              )}
            </g>
          </g>
        )}
      </svg>

      {/* Floating Info Overlay */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 text-xs font-medium text-slate-700">
        <div className="flex items-center gap-1 text-blue-600 font-bold">
          <Navigation className="w-3.5 h-3.5" />
          <span>{distanceKm} km</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1 text-slate-600">
          <span>~{durationMin} min</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1 font-semibold text-slate-800 capitalize">
          {modal === 'moto' ? <Bike className="w-3.5 h-3.5 text-amber-600" /> : <Car className="w-3.5 h-3.5 text-indigo-600" />}
          <span>{modal}</span>
        </div>
      </div>

      {/* Floating Legend Overlay */}
      <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span>Origem: {origin.neighborhood || 'Origem'}</span>
        </div>
        {dropoffAddress && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-600"></span>
            <span>Ponto Lojista</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>Destino: {destination.neighborhood || 'Destino'}</span>
        </div>
      </div>
    </div>
  );
};
