import React, { useState, useRef } from 'react';
import { 
  User, ShieldCheck, Car, Star, Award, Settings, 
  HelpCircle, ChevronRight, Sliders, Bell, PhoneCall, CheckCircle2, 
  Camera, Edit3, Save, X 
} from 'lucide-react';
import { DriverProfile, VehicleType } from '../types';
import { sound } from '../sound';

interface ProfileTabProps {
  driver: DriverProfile;
  onChangeVehicle: (type: VehicleType) => void;
  onUpdateDriver: (updated: Partial<DriverProfile>) => void;
  onLogout?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  driver,
  onChangeVehicle,
  onUpdateDriver,
  onLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(driver.name);
  const [phone, setPhone] = useState(driver.phone);
  const [pixKey, setPixKey] = useState(driver.pixKey);
  const [vehicleModel, setVehicleModel] = useState(driver.vehicleModel);
  const [vehiclePlate, setVehiclePlate] = useState(driver.vehiclePlate);
  const [vehicleType, setVehicleType] = useState<VehicleType>(driver.vehicleType);
  const [avatar, setAvatar] = useState(driver.avatar);

  const [maxRadius, setMaxRadius] = useState(25);
  const [acceptFragile, setAcceptFragile] = useState(true);
  const [acceptHeavy, setAcceptHeavy] = useState(true);
  const [savedAlert, setSavedAlert] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real avatar image upload
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
      onUpdateDriver({ avatar: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCashSuccess();

    onUpdateDriver({
      name: name.trim(),
      phone: phone.trim(),
      pixKey: pixKey.trim(),
      vehicleModel: vehicleModel.trim(),
      vehiclePlate: vehiclePlate.trim().toUpperCase(),
      vehicleType,
      avatar,
    });

    onChangeVehicle(vehicleType);
    setIsEditing(false);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto pb-24">
      {/* Hidden file input for real avatar photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileSelect}
      />

      {/* Driver Card Header */}
      <div className="bg-gradient-to-b from-lala-charcoal to-zinc-900 text-white p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Meu Perfil Parceiro
          </span>
          <button
            onClick={() => {
              sound.playClick();
              setIsEditing(!isEditing);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isEditing ? 'bg-zinc-700 text-white' : 'bg-lala-orange text-white hover:bg-lala-orangeDark'
            }`}
          >
            {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Cancelar Edição' : 'Editar Dados'}</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
              src={avatar || driver.avatar}
              alt={driver.name}
              className="w-18 h-18 rounded-full object-cover border-2 border-lala-orange shadow-lg"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-lala-orange text-white flex items-center justify-center shadow border-2 border-zinc-900"
              title="Trocar Foto"
            >
              <Camera className="w-3 h-3" />
            </button>
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
                {driver.totalTrips} corridas
              </span>
            </div>
          </div>
        </div>

        {/* Current Vehicle Badge */}
        <div className="mt-4 bg-zinc-800/80 border border-zinc-700 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lala-orange/20 text-lala-orange flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Veículo Ativo</span>
              <p className="text-xs font-bold text-gray-100">{driver.vehicleModel}</p>
              <p className="text-[11px] text-gray-400">Placa: {driver.vehiclePlate}</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg">
            Aprovado
          </span>
        </div>
      </div>

      {savedAlert && (
        <div className="m-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Alterações salvas com sucesso no Supabase!</span>
        </div>
      )}

      {/* EDIT PROFILE FORM */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="p-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-gray-900">Editar Meus Dados</h3>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-lala-orange hover:underline flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Trocar Foto de Perfil</span>
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Telefone / WhatsApp</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Chave Pix para Saques</label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700 block mb-1">Categoria do Veículo</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none font-bold text-gray-800"
              >
                <option value="moto">🏍️ Moto</option>
                <option value="carro">🚗 Carro Comum</option>
                <option value="fiorino">🚐 Fiorino / Utilitário</option>
                <option value="van">🚚 Van de Carga</option>
                <option value="carreto">🛻 Carreto / Picape</option>
                <option value="caminhao">🚛 Caminhão 3/4</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Modelo do Veículo</label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Placa</label>
                <input
                  type="text"
                  required
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-lala-orange focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-1/3 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
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
                  <span className="text-[10px] text-orange-700">Parceiro Motorista v1.0 (Conectado ao Supabase)</span>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (confirm('Deseja sair da conta para cadastrar ou testar outro motorista?')) {
                        onLogout();
                      }
                    }}
                    className="w-full py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors mt-2"
                  >
                    Sair / Cadastrar Outro Motorista
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
