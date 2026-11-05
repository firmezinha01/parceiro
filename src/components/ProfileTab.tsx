import React, { useState } from 'react';
import { 
  User, ShieldCheck, Car, Star, Award, Settings, 
  HelpCircle, ChevronRight, Sliders, Bell, PhoneCall, CheckCircle2 
} from 'lucide-react';
import { DriverProfile, VehicleType } from '../types';
import { sound } from '../sound';

interface ProfileTabProps {
  driver: DriverProfile;
  onChangeVehicle: (type: VehicleType) => void;
  onUpdateDriver: (updated: Partial<DriverProfile>) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  driver,
  onChangeVehicle,
  onUpdateDriver,
}) => {
  const [maxRadius, setMaxRadius] = useState(25);
  const [acceptFragile, setAcceptFragile] = useState(true);
  const [acceptHeavy, setAcceptHeavy] = useState(true);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSaveSettings = () => {
    sound.playClick();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto pb-24">
      {/* Driver Card Header */}
      <div className="bg-gradient-to-b from-lala-charcoal to-zinc-900 text-white p-5 shadow-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-lala-orange shadow-lg"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-900" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-base truncate">{driver.name}</h2>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{driver.phone}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-amber-400/20 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{driver.rating}</span>
              </span>
              <span className="text-[11px] text-gray-400">
                {driver.totalTrips} corridas realizadas
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Badge */}
        <div className="mt-4 bg-zinc-800/80 border border-zinc-700 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lala-orange/20 text-lala-orange flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Veículo Cadastrado</span>
              <p className="text-xs font-bold text-gray-100">{driver.vehicleModel}</p>
              <p className="text-[11px] text-gray-400">Placa: {driver.vehiclePlate}</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg">
            Aprovado
          </span>
        </div>
      </div>

      {/* Driver Score Statistics */}
      <div className="p-4 grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-gray-200/80 text-center shadow-sm">
          <span className="text-xl font-black text-gray-900 block">{driver.rating}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Avaliação</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-gray-200/80 text-center shadow-sm">
          <span className="text-xl font-black text-emerald-600 block">{driver.acceptanceRate}%</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Aceitação</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-gray-200/80 text-center shadow-sm">
          <span className="text-xl font-black text-blue-600 block">99.8%</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Conclusão</span>
        </div>
      </div>

      {/* Dispatch Settings */}
      <div className="px-4 space-y-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Sliders className="w-4 h-4 text-lala-orange" />
            <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Preferências de Despacho & Raio
            </h3>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
              <span>Raio Máximo de Coleta</span>
              <span className="text-lala-orange font-extrabold">{maxRadius} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={maxRadius}
              onChange={(e) => setMaxRadius(Number(e.target.value))}
              className="w-full accent-lala-orange cursor-pointer"
            />
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Você só receberá chamados com ponto de coleta até essa distância.
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
              <span className="font-medium">Aceitar encomendas frágeis</span>
              <input
                type="checkbox"
                checked={acceptFragile}
                onChange={(e) => setAcceptFragile(e.target.checked)}
                className="w-4 h-4 accent-lala-orange rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
              <span className="font-medium">Aceitar volumes pesados (+50kg)</span>
              <input
                type="checkbox"
                checked={acceptHeavy}
                onChange={(e) => setAcceptHeavy(e.target.checked)}
                className="w-4 h-4 accent-lala-orange rounded"
              />
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all"
          >
            {savedAlert ? '✓ Preferências Salvas!' : 'Salvar Preferências'}
          </button>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Central de Ajuda Parceiro
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <a
              href="tel:0800000000"
              onClick={(e) => { e.preventDefault(); alert('Central de Emergência Parceiro: 0800 123 4567'); }}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-gray-800">Telefone de Emergência 24h</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </a>

            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-950 text-xs">
              <span className="font-bold block text-[11px]">Versão do App</span>
              <span className="text-[10px] text-orange-700">Parceiro Motorista v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
