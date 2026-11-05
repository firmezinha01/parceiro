import React, { useState } from 'react';
import { Layers, Flame, Navigation2, RefreshCw, Info } from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';
import { DriverProfile } from '../types';
import { sound } from '../sound';

interface MapTabProps {
  driver: DriverProfile;
}

export const MapTab: React.FC<MapTabProps> = ({ driver }) => {
  const [showHeatmap, setShowHeatmap] = useState(true);

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto pb-24 relative">
      {/* Top Banner overlay */}
      <div className="bg-white/95 backdrop-blur-md p-3.5 border-b border-gray-200/80 shadow-sm flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-lala-orange" />
            <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Zonas de Alta Demanda (Tarifa Dinâmica)
            </h3>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Posicione-se em áreas laranjas para receber pedidos com bônus de até +25%
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setShowHeatmap(!showHeatmap);
          }}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            showHeatmap ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {showHeatmap ? 'Calor Ativo' : 'Mapa Simples'}
        </button>
      </div>

      {/* Main Interactive Map */}
      <div className="flex-1 p-3 min-h-[360px]">
        <InteractiveMap
          className="w-full h-full min-h-[380px] shadow-md rounded-3xl"
          zoom={13}
        />
      </div>

      {/* Demand hotspots cards */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 px-1">
          <span>Regiões com mais chamadas agora</span>
          <span className="text-[10px] text-lala-orange">Atualizado há 1 min</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-orange-200 shadow-sm flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0 animate-ping" />
            <div>
              <span className="font-bold text-gray-900 block">Itaim Bibi & Faria Lima</span>
              <span className="text-[11px] text-orange-600 font-extrabold">+25% Dinâmico</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">38 pedidos esperando</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-orange-200 shadow-sm flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block">Brás & Pari (Comércio)</span>
              <span className="text-[11px] text-orange-600 font-extrabold">+15% Dinâmico</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">42 pedidos esperando</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
