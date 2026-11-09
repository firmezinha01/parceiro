import React, { useState, useEffect } from 'react';
import { 
  Package, MapPin, ArrowRight, Car, Navigation, ShieldCheck, 
  Phone, MessageSquare, CheckCircle2, Clock, DollarSign, 
  AlertCircle, ChevronRight, X, Sparkles, User, RefreshCw 
} from 'lucide-react';
import { VehicleType, Order, LocationPoint } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { sound } from '../sound';
import { createRealOrderInSupabase, getDriverFromSupabase, supabase } from '../services/supabase';

interface ClientOrderFlowProps {
  onSwitchToDriver: () => void;
}

const vehicleOptions: { type: VehicleType; label: string; icon: string; capacity: string; basePrice: number; perKm: number }[] = [
  { type: 'moto', label: 'Moto', icon: '🏍️', capacity: 'Até 20kg • Rápido', basePrice: 18.50, perKm: 2.10 },
  { type: 'carro', label: 'Carro', icon: '🚗', capacity: 'Até 50kg • Encomendas', basePrice: 28.00, perKm: 2.80 },
  { type: 'fiorino', label: 'Fiorino / Utilitário', icon: '🚐', capacity: 'Até 650kg • Caixas e-commerce', basePrice: 48.90, perKm: 3.50 },
  { type: 'van', label: 'Van de Carga', icon: '🚚', capacity: 'Até 1.500kg • Volumosos', basePrice: 89.00, perKm: 4.80 },
  { type: 'carreto', label: 'Carreto / Picape', icon: '🛻', capacity: 'Até 1.000kg • Mudanças', basePrice: 110.00, perKm: 5.20 },
  { type: 'caminhao', label: 'Caminhão 3/4', icon: '🚛', capacity: 'Até 4.000kg • Pesado', basePrice: 175.00, perKm: 6.50 },
];

export const ClientOrderFlow: React.FC<ClientOrderFlowProps> = ({
  onSwitchToDriver,
}) => {
  // Form fields
  const [pickupAddress, setPickupAddress] = useState('Av. Paulista, 1578 - Bela Vista, São Paulo');
  const [pickupContact, setPickupContact] = useState('Carlos Eduardo');
  const [pickupPhone, setPickupPhone] = useState('(11) 98765-4321');
  const [pickupInstructions, setPickupInstructions] = useState('Retirar na portaria principal');

  const [deliveryAddress, setDeliveryAddress] = useState('Rua Augusta, 2400 - Cerqueira César, São Paulo');
  const [deliveryContact, setDeliveryContact] = useState('Fernanda Lima');
  const [deliveryPhone, setDeliveryPhone] = useState('(11) 99876-5432');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Entregar no 4º andar comercial');

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('fiorino');
  const [cargoType, setCargoType] = useState('Caixas de mercadorias');
  const [cargoWeight, setCargoWeight] = useState('35');
  const [clientNotes, setClientNotes] = useState('Carga frágil, favor manusear com cuidado.');
  const [paymentMethod, setPaymentMethod] = useState<'app' | 'dinheiro'>('app');

  // Active tracking state
  const [activeClientOrder, setActiveClientOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingGiven, setRatingGiven] = useState(5);

  // Simulated fixed coordinates for demo route
  const pickupPoint: LocationPoint = {
    address: pickupAddress,
    neighborhood: 'Bela Vista',
    city: 'São Paulo - SP',
    lat: -23.5615,
    lng: -46.6559,
    contactName: pickupContact,
    contactPhone: pickupPhone,
    instructions: pickupInstructions,
  };

  const deliveryPoint: LocationPoint = {
    address: deliveryAddress,
    neighborhood: 'Cerqueira César',
    city: 'São Paulo - SP',
    lat: -23.5552,
    lng: -46.6621,
    contactName: deliveryContact,
    contactPhone: deliveryPhone,
    instructions: deliveryInstructions,
  };

  // Calculate dynamic price based on vehicle
  const currentVehicleConfig = vehicleOptions.find(v => v.type === selectedVehicle) || vehicleOptions[2];
  const simulatedDistanceKm = 6.8;
  const totalPrice = Number((currentVehicleConfig.basePrice + simulatedDistanceKm * currentVehicleConfig.perKm).toFixed(2));

  // Listen to Supabase Realtime updates on this active client order
  useEffect(() => {
    if (!activeClientOrder) return;

    const channel = supabase
      .channel(`client-order:${activeClientOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${activeClientOrder.id}`,
        },
        async (payload) => {
          const updated = payload.new;
          sound.playNewOrderAlert();

          let driverDetails: Partial<Order> = {};
          if (updated.driver_id) {
            try {
              const dbDriver = await getDriverFromSupabase(updated.driver_id);
              if (dbDriver) {
                driverDetails = {
                  driverName: dbDriver.name,
                  driverPhone: dbDriver.phone,
                  driverPlate: dbDriver.vehiclePlate,
                  driverModel: dbDriver.vehicleModel,
                  driverAvatar: dbDriver.avatar,
                  driverRating: dbDriver.rating,
                };
              }
            } catch (err) {
              console.warn('Could not fetch driver details:', err);
            }
          }

          setActiveClientOrder(prev => {
            if (!prev) return null;
            return {
              ...prev,
              status: updated.status,
              driverId: updated.driver_id,
              ...driverDetails,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeClientOrder?.id]);

  // Handle client submitting a new delivery
  const handleRequestDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSubmitting(true);

    const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
    const newCode = `PRC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: newCode,
      createdAt: 'Agora',
      vehicleType: selectedVehicle,
      price: totalPrice,
      distanceToPickupKm: 1.2,
      totalDistanceKm: simulatedDistanceKm,
      estimatedMinutes: Math.round(simulatedDistanceKm * 2.5) + 5,
      paymentMethod: paymentMethod === 'app' ? 'app' : 'dinheiro',
      status: 'available',
      cargoType: cargoType.trim() || 'Volumes e Pacotes',
      cargoWeightKg: Number(cargoWeight) || 10,
      clientNotes: clientNotes.trim() || undefined,
      pickup: pickupPoint,
      delivery: deliveryPoint,
      senderName: pickupContact,
      recipientName: deliveryContact,
      pickupSecurityCode: pickupPin,
      deliverySecurityCode: deliveryPin,
    };

    // Save to real Supabase database
    const createdInDb = await createRealOrderInSupabase(newOrder);
    setIsSubmitting(false);

    if (createdInDb) {
      setActiveClientOrder(createdInDb);
    } else {
      setActiveClientOrder(newOrder);
    }

    sound.playCashSuccess();
  };

  const handleCancelOrder = () => {
    if (confirm('Deseja cancelar esta solicitação de entrega?')) {
      sound.playClick();
      setActiveClientOrder(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto">
      
      {/* Top Header */}
      <header className="bg-lala-charcoal text-white px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white p-0.5 flex items-center justify-center shadow overflow-hidden shrink-0 border border-orange-500/30">
              <img src="/logo-character.png" alt="Parceiro" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-base tracking-tight text-white flex items-center">
                  <span>PAR</span><span className="text-lala-orange">CEIRO</span>
                </h1>
                <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Solicitante
                </span>
              </div>
              <span className="text-[10px] text-gray-400 block font-semibold">
                Chamar Entregas & Fretes
              </span>
            </div>
          </div>

          {/* Switch to Driver Mode Button */}
          <button
            onClick={() => {
              sound.playClick();
              onSwitchToDriver();
            }}
            className="py-1.5 px-3 rounded-xl bg-lala-orange hover:bg-lala-orangeDark text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            title="Mudar para o Painel do Motorista"
          >
            <span>🚚</span>
            <span>Sou Motorista</span>
          </button>
        </div>
      </header>

      {/* VIEW 1: ACTIVE ORDER TRACKING (If user requested a delivery) */}
      {activeClientOrder ? (
        <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-20 animate-fade-in">
          
          {/* Status Tracker Banner */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Acompanhamento em Tempo Real • {activeClientOrder.code}
              </span>
              <span className="bg-orange-50 text-lala-orange text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-orange-200">
                R$ {activeClientOrder.price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Status Headline */}
            <div>
              {activeClientOrder.status === 'available' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-lala-orange animate-ping" />
                    <h3 className="font-black text-base text-gray-900">
                      Buscando motorista parceiro...
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    Notificando entregadores de {activeClientOrder.vehicleType.toUpperCase()} mais próximos da sua região.
                  </p>
                </div>
              )}

              {activeClientOrder.status === 'to_pickup' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-black text-base text-emerald-800">
                      Motorista a caminho da coleta!
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600">
                    O motorista aceitou seu pedido e está se deslocando até o Ponto A.
                  </p>
                </div>
              )}

              {activeClientOrder.status === 'at_pickup' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                    <h3 className="font-black text-base text-amber-900">
                      🚨 O motorista chegou no local de coleta!
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600">
                    O motorista está no Ponto A aguardando o carregamento dos pacotes.
                  </p>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-3 shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider block text-amber-100">
                        Senha de Segurança da Coleta
                      </span>
                      <p className="text-xs font-bold">Forneça este código ao motorista:</p>
                    </div>
                    <div className="bg-white text-amber-600 font-mono font-black text-2xl px-3 py-1 rounded-xl tracking-widest shadow-sm">
                      {activeClientOrder.pickupSecurityCode || '1234'}
                    </div>
                  </div>
                </div>
              )}

              {activeClientOrder.status === 'in_transit' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                    <h3 className="font-black text-base text-purple-900">
                      Em trânsito para a entrega!
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600">
                    Sua encomenda já está a caminho do destino final (Ponto B).
                  </p>
                  <div className="bg-blue-50 border border-blue-200 text-blue-950 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-500 block">Senha para Recebimento</span>
                      <span className="font-bold">Código a ser dado no destino:</span>
                    </div>
                    <span className="bg-blue-600 text-white font-mono font-black text-lg px-2.5 py-0.5 rounded-lg tracking-widest">
                      {activeClientOrder.deliverySecurityCode || '5678'}
                    </span>
                  </div>
                </div>
              )}

              {activeClientOrder.status === 'at_delivery' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="font-black text-base text-emerald-900">
                      🚨 O motorista chegou no destino!
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600">
                    O motorista está no Ponto B pronto para entregar as mercadorias.
                  </p>
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-3 shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider block text-emerald-100">
                        Senha de Entrega
                      </span>
                      <p className="text-xs font-bold">O destinatário deve fornecer ao motorista:</p>
                    </div>
                    <div className="bg-white text-emerald-700 font-mono font-black text-2xl px-3 py-1 rounded-xl tracking-widest shadow-sm">
                      {activeClientOrder.deliverySecurityCode || '5678'}
                    </div>
                  </div>
                </div>
              )}

              {activeClientOrder.status === 'completed' && (
                <div className="space-y-1 text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-lg text-emerald-900">
                    Entrega Concluída com Sucesso!
                  </h3>
                  <p className="text-xs text-gray-500">
                    O pacote foi entregue e assinado no destino.
                  </p>
                </div>
              )}
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5 pt-2 text-center text-[10px] font-bold">
              <div className={`p-1.5 rounded-lg ${
                activeClientOrder.status === 'available' ? 'bg-orange-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
              }`}>
                1. Chamando
              </div>
              <div className={`p-1.5 rounded-lg ${
                activeClientOrder.status === 'to_pickup' ? 'bg-orange-500 text-white animate-pulse' : 
                ['at_pickup', 'in_transit', 'completed'].includes(activeClientOrder.status || '') ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
              }`}>
                2. A caminho
              </div>
              <div className={`p-1.5 rounded-lg ${
                ['at_pickup', 'in_transit'].includes(activeClientOrder.status || '') ? 'bg-orange-500 text-white animate-pulse' : 
                activeClientOrder.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
              }`}>
                3. Trânsito
              </div>
              <div className={`p-1.5 rounded-lg ${
                activeClientOrder.status === 'completed' ? 'bg-emerald-600 text-white font-black' : 'bg-gray-100 text-gray-400'
              }`}>
                4. Entregue
              </div>
            </div>
          </div>

          {/* Map Preview */}
          <InteractiveMap
            pickup={activeClientOrder.pickup}
            delivery={activeClientOrder.delivery}
            showRoute={true}
            className="h-60 rounded-3xl shadow-sm"
          />

          {/* Driver Card (If accepted) */}
          {activeClientOrder.driverId && (
            <div className="bg-white rounded-3xl p-4 border border-gray-200/90 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-lala-orange shrink-0 bg-gray-100">
                  <img
                    src={activeClientOrder.driverAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"}
                    alt="Motorista"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Motorista Parceiro</span>
                  <h4 className="font-extrabold text-sm text-gray-900">{activeClientOrder.driverName || 'Carlos Silva'}</h4>
                  <p className="text-[11px] text-gray-500">
                    {activeClientOrder.driverModel || 'Fiat Fiorino'} • <span className="font-mono font-bold text-gray-800">{activeClientOrder.driverPlate || 'BRA-2E19'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeClientOrder.driverPhone || '11984529011'}`}
                  className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors shadow-sm"
                  title="Ligar para o motorista"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          )}

          {/* Route Summary */}
          <div className="bg-white rounded-3xl p-4 border border-gray-200/90 shadow-sm space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                A
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Coleta</span>
                <p className="font-bold text-gray-900">{activeClientOrder.pickup.address}</p>
                <p className="text-[11px] text-gray-500">Contato: {activeClientOrder.pickup.contactName}</p>
              </div>
            </div>

            <div className="ml-2.5 border-l-2 border-dashed border-gray-300 h-2" />

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                B
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Entrega</span>
                <p className="font-bold text-gray-900">{activeClientOrder.delivery.address}</p>
                <p className="text-[11px] text-gray-500">Destinatário: {activeClientOrder.delivery.contactName}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {activeClientOrder.status === 'completed' ? (
            <button
              onClick={() => {
                sound.playClick();
                setActiveClientOrder(null);
              }}
              className="w-full py-4 rounded-2xl bg-lala-orange hover:bg-lala-orangeDark active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all"
            >
              Fazer Outra Solicitação de Entrega
            </button>
          ) : (
            <div className="pt-2 text-center">
              <button
                onClick={handleCancelOrder}
                className="text-xs font-bold text-gray-400 hover:text-red-500 underline transition-colors"
              >
                Cancelar Solicitação de Entrega
              </button>
            </div>
          )}

        </div>
      ) : (
        /* VIEW 2: ORDER REQUEST FORM (Customer places an order) */
        <form onSubmit={handleRequestDelivery} className="p-4 space-y-4 max-w-lg mx-auto w-full pb-20 animate-fade-in">
          
          {/* Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-3xl p-4 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">Entrega Rápida e Segura</span>
              <p className="text-xs text-orange-100 mt-0.5">
                Chame uma moto, fiorino, van ou caminhão em instantes.
              </p>
            </div>
            <span className="text-2xl">📦</span>
          </div>

          {/* Addresses Card: Point A & Point B */}
          <div className="bg-white rounded-3xl p-4 border border-gray-200/90 shadow-sm space-y-4">
            
            {/* Point A (Pickup) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                    A
                  </div>
                  <span>Onde retirar (Coleta)</span>
                </div>
              </div>

              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Endereço de coleta (Rua, Número, Bairro)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-lala-orange focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={pickupContact}
                  onChange={(e) => setPickupContact(e.target.value)}
                  placeholder="Nome do contato"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
                <input
                  type="tel"
                  value={pickupPhone}
                  onChange={(e) => setPickupPhone(e.target.value)}
                  placeholder="Telefone do contato"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Point B (Delivery) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                  <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-black">
                    B
                  </div>
                  <span>Onde entregar (Destino)</span>
                </div>
              </div>

              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Endereço de entrega (Rua, Número, Bairro)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-lala-orange focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={deliveryContact}
                  onChange={(e) => setDeliveryContact(e.target.value)}
                  placeholder="Nome do destinatário"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
                <input
                  type="tel"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="Telefone destinatário"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

          </div>

          {/* Vehicle Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block px-1">
              Selecione o Veículo Adequado
            </label>

            <div className="grid grid-cols-2 gap-2">
              {vehicleOptions.map((v) => {
                const isSelected = selectedVehicle === v.type;
                const estPrice = (v.basePrice + simulatedDistanceKm * v.perKm).toFixed(2);
                return (
                  <button
                    key={v.type}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedVehicle(v.type);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'border-lala-orange bg-orange-50/70 ring-2 ring-lala-orange shadow-sm'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl">{v.icon}</span>
                      <span className="font-black text-xs text-lala-charcoal">
                        R$ {estPrice.replace('.', ',')}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-gray-900 block leading-tight">
                      {v.label}
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {v.capacity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cargo Details */}
          <div className="bg-white rounded-3xl p-4 border border-gray-200/90 shadow-sm space-y-3 text-xs">
            <h4 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
              Detalhes da Carga & Instruções
            </h4>

            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">O que está sendo transportado?</label>
              <input
                type="text"
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                placeholder="Ex: 5 caixas de roupas, envelope, autopeças..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Peso aprox. (kg)</label>
                <input
                  type="number"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  placeholder="30"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold"
                >
                  <option value="app">💳 Pagar no App (Pix/Cartão)</option>
                  <option value="dinheiro">💵 Pagar na Entrega</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">Instruções para o Motorista</label>
              <input
                type="text"
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Ex: Tocar o interfone 42, falar com a Maria..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              />
            </div>
          </div>

          {/* Map Preview of Route */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase px-1">Prévia da Rota</span>
            <InteractiveMap
              pickup={pickupPoint}
              delivery={deliveryPoint}
              showRoute={true}
              className="h-48 rounded-3xl shadow-sm"
            />
          </div>

          {/* Big CTA Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-lala-orange to-lala-orangeDark hover:brightness-105 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>CONFIRMAR & CHAMAR MOTORISTA</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-bold">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
