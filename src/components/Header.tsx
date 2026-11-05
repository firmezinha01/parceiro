import React from 'react';
import { Power, Volume2, VolumeX, ShieldCheck, ChevronDown } from 'lucide-react';
import { DriverProfile, VehicleType } from '../types';
import { sound } from '../sound';

interface HeaderProps {
  driver: DriverProfile;
  onToggleOnline: () => void;
  onChangeVehicle: (type: VehicleType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const vehicleLabels: Record<VehicleType, { label: string; icon: string }> = {
  moto: { label: 'Moto', icon: '🏍️' },
  carro: { label: 'Carro Hatch/Sedan', icon: '🚗' },
  fiorino: { label: 'Fiorino / Utilitário', icon: '🚐' },
  van: { label: 'Van de Carga', icon: '🚚' },
  carreto: { label: 'Carreto / Caminhonete', icon: '🛻' },
  caminhao: { label: 'Caminhão 3/4', icon: '🚛' },
};

export const Header: React.FC<HeaderProps> = ({
  driver,
  onToggleOnline,
  onChangeVehicle,
  soundEnabled,
  onToggleSound,
}) => {
  const [showVehicleMenu, setShowVehicleMenu] = React.useState(false);

  return (
    <header className="bg-lala-charcoal text-white px-4 pt-3 pb-3 sticky top-0 z-30 shadow-md">
      {/* Top row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          {/* New Mascot Logo */}
          <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-lg shadow-black/30 overflow-hidden shrink-0 border border-orange-500/30">
            <img 
              src="/logo-character.png" 
              alt="Logo Parceiro" 
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-base tracking-tight text-white flex items-center">
                <span>PAR</span><span className="text-lala-orange">CEIRO</span>
              </h1>
              <span className="bg-lala-orange text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Motorista
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <ShieldCheck className="w-3 h-3 text-lala-green inline" />
              <span>{driver.name.split(' ')[0]}</span>
              <span>•</span>
              <span className="text-yellow-400 font-medium">★ {driver.rating}</span>
            </div>
          </div>
        </div>

        {/* Top actions: Sound & Today Earnings */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            title={soundEnabled ? 'Silenciar alertas sonoros' : 'Ativar alertas sonoros'}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-lala-orange" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>

          <div className="bg-white/10 px-2.5 py-1 rounded-xl text-right">
            <span className="block text-[9px] text-gray-400 uppercase font-semibold">Hoje</span>
            <span className="text-xs font-extrabold text-lala-green">
              R$ {driver.todayEarnings.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row: Online Toggle & Vehicle selector */}
      <div className="flex items-center gap-2">
        {/* Big Online Button */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleOnline();
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
            driver.isOnline
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/50'
              : 'bg-zinc-800 text-gray-400 hover:text-white border border-zinc-700'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Power className="w-4 h-4" />
            {driver.isOnline && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </div>
          <span>{driver.isOnline ? 'VOCÊ ESTÁ ONLINE' : 'VOCÊ ESTÁ OFFLINE'}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${driver.isOnline ? 'bg-black/20 text-emerald-100' : 'bg-zinc-700 text-gray-400'}`}>
            {driver.isOnline ? 'Recebendo' : 'Pausado'}
          </span>
        </button>

        {/* Vehicle Badge */}
        <div className="relative">
          <button
            onClick={() => setShowVehicleMenu(!showVehicleMenu)}
            className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-gray-200 transition-colors"
          >
            <span>{vehicleLabels[driver.vehicleType].icon}</span>
            <span className="hidden sm:inline">{vehicleLabels[driver.vehicleType].label.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showVehicleMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <div className="text-[10px] text-gray-400 px-2 py-1 font-semibold uppercase">
                Seu Veículo Atual
              </div>
              {(Object.keys(vehicleLabels) as VehicleType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onChangeVehicle(type);
                    setShowVehicleMenu(false);
                    sound.playClick();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                    driver.vehicleType === type
                      ? 'bg-lala-orange text-white font-bold'
                      : 'text-gray-300 hover:bg-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{vehicleLabels[type].icon}</span>
                    <span>{vehicleLabels[type].label}</span>
                  </span>
                  {driver.vehicleType === type && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
