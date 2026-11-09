import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, MessageSquare, Navigation, CheckCircle2, 
  MapPin, Package, AlertTriangle, Camera, Upload, ArrowRight, 
  ShieldCheck, ChevronRight, Clock, KeyRound, AlertCircle, Compass
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { sound } from '../sound';

interface ActiveOrderViewProps {
  order: Order;
  onUpdateStatus: (status: OrderStatus, extra?: any) => void;
  onComplete: (order: Order, receiptName: string) => void;
  onCancel: (orderId: string) => void;
  onMinimize?: () => void;
  driverId?: string;
}

// Distance helper in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const ActiveOrderView: React.FC<ActiveOrderViewProps> = ({
  order,
  onUpdateStatus,
  onComplete,
  onCancel,
  onMinimize,
}) => {
  const [currentStep, setCurrentStep] = useState<OrderStatus>(order.status || 'to_pickup');
  const [receiverName, setReceiverName] = useState(order.recipientName || 'Destinatário');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  
  // Real GPS tracking state
  const [driverGps, setDriverGps] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceToTargetMeters, setDistanceToTargetMeters] = useState<number | null>(null);
  const [hasAutoArrivedPickup, setHasAutoArrivedPickup] = useState(false);
  const [hasAutoArrivedDelivery, setHasAutoArrivedDelivery] = useState(false);
  const [gpsWatchError, setGpsWatchError] = useState<string | null>(null);

  // Waiting Time Counter at pickup
  const [waitingSeconds, setWaitingSeconds] = useState(order.waitingTimeSeconds || 0);

  // Verification at Pickup
  const [pickupInputPin, setPickupInputPin] = useState('');
  const [pickupPhoto, setPickupPhoto] = useState<string | null>(order.pickupPhotoUrl || null);
  const [pickupPinError, setPickupPinError] = useState(false);
  const [pickupPinVerified, setPickupPinVerified] = useState(false);
  const pickupFileInputRef = useRef<HTMLInputElement>(null);

  // Verification at Delivery
  const [deliveryInputPin, setDeliveryInputPin] = useState('');
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(order.deliveryPhotoUrl || null);
  const [deliveryPinError, setDeliveryPinError] = useState(false);
  const [deliveryPinVerified, setDeliveryPinVerified] = useState(false);
  const deliveryFileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [showCallAlert, setShowCallAlert] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'client', text: 'Olá! Estou no aguardo da entrega.', time: 'Agora' },
  ]);
  const [newMsg, setNewMsg] = useState('');

  // 1. REAL DEVICE GPS: Watch driver position continuously
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsWatchError('Geolocalização não suportada neste dispositivo.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDriverGps({ lat, lng });
        setGpsWatchError(null);

        // Check distance to target
        if (currentStep === 'to_pickup') {
          const dist = getDistanceMeters(lat, lng, order.pickup.lat, order.pickup.lng);
          setDistanceToTargetMeters(dist);

          // Auto arrival detection within 100 meters
          if (dist <= 100 && !hasAutoArrivedPickup) {
            setHasAutoArrivedPickup(true);
            setCurrentStep('at_pickup');
            sound.playNewOrderAlert();
            onUpdateStatus('at_pickup', { waitingTimeSeconds: 0 });
          }
        } else if (currentStep === 'in_transit') {
          const dist = getDistanceMeters(lat, lng, order.delivery.lat, order.delivery.lng);
          setDistanceToTargetMeters(dist);

          // Auto arrival detection within 100 meters
          if (dist <= 100 && !hasAutoArrivedDelivery) {
            setHasAutoArrivedDelivery(true);
            setCurrentStep('at_delivery');
            sound.playNewOrderAlert();
            onUpdateStatus('at_delivery');
          }
        }
      },
      (err) => {
        console.warn('GPS watchPosition alert:', err.message);
        setGpsWatchError('Ative a localização precisa do celular.');
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 12000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [currentStep, hasAutoArrivedPickup, hasAutoArrivedDelivery, order.pickup, order.delivery]);

  // 2. WAITING TIMER: Ticks every second while at pickup
  useEffect(() => {
    let interval: any = null;
    if (currentStep === 'at_pickup') {
      interval = setInterval(() => {
        setWaitingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep]);

  // Format seconds to MM:SS
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // Real Photo Upload handler (reads as DataURL)
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>, isPickup: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (isPickup) {
        setPickupPhoto(result);
      } else {
        setDeliveryPhoto(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Check 4-digit pickup security PIN
  const handleVerifyPickupPin = () => {
    const expected = order.pickupSecurityCode || '1234';
    if (pickupInputPin.trim() === expected.trim()) {
      sound.playClick();
      setPickupPinVerified(true);
      setPickupPinError(false);
    } else {
      sound.playClick();
      setPickupPinError(true);
    }
  };

  // Check 4-digit delivery security PIN
  const handleVerifyDeliveryPin = () => {
    const expected = order.deliverySecurityCode || '5678';
    if (deliveryInputPin.trim() === expected.trim()) {
      sound.playClick();
      setDeliveryPinVerified(true);
      setDeliveryPinError(false);
    } else {
      sound.playClick();
      setDeliveryPinError(true);
    }
  };

  // Manual Trigger: Arrived at Pickup (fallback if inside building / GPS off)
  const handleManualArrivedPickup = () => {
    sound.playClick();
    setHasAutoArrivedPickup(true);
    setCurrentStep('at_pickup');
    onUpdateStatus('at_pickup', { waitingTimeSeconds: 0 });
  };

  // Step 2 -> 3: Confirm loaded cargo, verified PIN & photo -> Start transit
  const handleConfirmPickupAndStartTrip = () => {
    if (!pickupPinVerified) {
      alert('Por favor, valide o código de 4 dígitos da coleta fornecido pelo cliente.');
      return;
    }
    if (!pickupPhoto) {
      alert('Por favor, tire uma foto da carga/mercadoria coletada antes de iniciar.');
      return;
    }

    sound.playCashSuccess();
    setCurrentStep('in_transit');
    onUpdateStatus('in_transit', {
      pickupPhotoUrl: pickupPhoto,
      waitingTimeSeconds: waitingSeconds,
    });
  };

  // Manual Trigger: Arrived at Delivery
  const handleManualArrivedDelivery = () => {
    sound.playClick();
    setHasAutoArrivedDelivery(true);
    setCurrentStep('at_delivery');
    onUpdateStatus('at_delivery');
  };

  // Step 4: Finalize delivery
  const handleFinalizeDelivery = () => {
    if (!deliveryPinVerified) {
      alert('Por favor, valide a senha de 4 dígitos informada pelo destinatário.');
      return;
    }
    if (!deliveryPhoto) {
      alert('Por favor, tire uma foto do pacote entregue no destino.');
      return;
    }

    sound.playCashSuccess();
    onUpdateStatus('completed', {
      deliveryPhotoUrl: deliveryPhoto,
    });
    onComplete(order, receiverName || 'Destinatário');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'driver', text: newMsg.trim(), time: 'Agora' }]);
    setNewMsg('');
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: 'client', text: 'Perfeito, aguardo!', time: 'Agora' }]);
    }, 1200);
  };

  // Target coordinates for active map
  const activeTargetPoint = ['to_pickup', 'at_pickup'].includes(currentStep) 
    ? order.pickup 
    : order.delivery;

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto pb-28">
      
      {/* Top Header */}
      <div className="bg-lala-charcoal text-white px-4 py-3 shadow-md sticky top-0 z-20">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {onMinimize && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onMinimize();
                }}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-[10px] font-bold flex items-center gap-1"
                title="Minimizar corrida"
              >
                <span>← Voltar</span>
              </button>
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              {currentStep === 'to_pickup' && 'Etapa 1: A caminho da Coleta'}
              {currentStep === 'at_pickup' && 'Etapa 2: No Local da Coleta'}
              {currentStep === 'in_transit' && 'Etapa 3: A caminho da Entrega'}
              {currentStep === 'at_delivery' && 'Etapa 4: No Local de Entrega'}
            </span>
          </div>

          <div className="bg-lala-orange text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow-sm">
            R$ {order.price.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm font-black text-white truncate">
              {currentStep === 'to_pickup' && 'Dirija-se ao Ponto A (Coleta)'}
              {currentStep === 'at_pickup' && 'Coletando Carga no Ponto A'}
              {currentStep === 'in_transit' && 'Transportando até o Ponto B (Entrega)'}
              {currentStep === 'at_delivery' && 'Entregando no Ponto B'}
            </h2>
            <p className="text-[11px] text-gray-300 truncate">
              {['to_pickup', 'at_pickup'].includes(currentStep) ? order.pickup.address : order.delivery.address}
            </p>
          </div>

          {/* Real GPS Live Distance Badge */}
          {distanceToTargetMeters !== null && ['to_pickup', 'in_transit'].includes(currentStep) && (
            <div className="bg-white/10 px-2 py-1 rounded-xl text-right shrink-0">
              <span className="text-[9px] text-gray-400 uppercase font-bold block">Distância GPS</span>
              <span className="text-xs font-black text-emerald-400">
                {distanceToTargetMeters >= 1000 
                  ? `${(distanceToTargetMeters / 1000).toFixed(1)} km` 
                  : `${distanceToTargetMeters} m`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Real Interactive Map with live GPS */}
      <div ref={mapSectionRef} className="p-3 transition-all duration-300">
        {isMapExpanded && (
          <div className="mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-2xl flex items-center justify-between shadow-md animate-fade-in">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-200 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase font-black text-emerald-100 block">Navegando no Aplicativo Parceiro</span>
                <p className="text-xs font-bold truncate max-w-[220px]">
                  Rumo a: {activeTargetPoint.address}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMapExpanded(false)}
              className="text-xs bg-black/25 hover:bg-black/40 text-white px-2.5 py-1 rounded-xl font-bold transition-colors"
            >
              ✕ Reduzir
            </button>
          </div>
        )}

        <InteractiveMap
          pickup={['to_pickup', 'at_pickup'].includes(currentStep) ? order.pickup : undefined}
          delivery={['in_transit', 'at_delivery'].includes(currentStep) ? order.delivery : undefined}
          driverPosition={driverGps || undefined}
          showRoute={true}
          className={`${isMapExpanded ? 'h-96' : 'h-56'} shadow-md rounded-2xl transition-all duration-300`}
        />
      </div>

      <div className="px-3 space-y-3">
        
        {/* Contact Bar */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-lala-orange flex items-center justify-center font-bold text-sm shrink-0">
              {['to_pickup', 'at_pickup'].includes(currentStep) 
                ? (order.pickup.contactName || order.senderName).slice(0, 2).toUpperCase()
                : (order.delivery.contactName || order.recipientName).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                {['to_pickup', 'at_pickup'].includes(currentStep) ? 'Remetente (Coleta)' : 'Destinatário (Entrega)'}
              </span>
              <p className="text-xs font-bold text-gray-900 truncate">
                {['to_pickup', 'at_pickup'].includes(currentStep) 
                  ? (order.pickup.contactName || order.senderName)
                  : (order.delivery.contactName || order.recipientName)}
              </p>
              <p className="text-[11px] text-gray-500">
                {['to_pickup', 'at_pickup'].includes(currentStep) 
                  ? (order.pickup.contactPhone || '(11) 98765-4321')
                  : (order.delivery.contactPhone || '(11) 98765-4321')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowChatModal(true)}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 flex items-center justify-center transition-all"
              title="Abrir Chat"
            >
              <MessageSquare className="w-4 h-4 text-lala-orange" />
            </button>
            <button
              onClick={() => setShowCallAlert(true)}
              className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 flex items-center justify-center transition-all"
              title="Ligar"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsMapExpanded(!isMapExpanded);
                mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                isMapExpanded ? 'bg-zinc-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Abrir rota no mapa interno do aplicativo"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isMapExpanded ? 'Reduzir' : 'Rotas'}</span>
            </button>
          </div>
        </div>

        {/* ---------------- STAGE 1: TO PICKUP ---------------- */}
        {currentStep === 'to_pickup' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-lala-orange animate-spin" />
                <span>Navegação GPS Ativa até o Ponto A</span>
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">
                {order.vehicleType}
              </span>
            </div>

            <p className="text-xs text-gray-600">
              Dirija-se ao endereço de coleta. O sistema detectará automaticamente quando você estiver a menos de 100m do local e notificará o cliente.
            </p>

            <button
              onClick={handleManualArrivedPickup}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>CHEGUEI NA COLETA (PONTO A)</span>
            </button>
          </div>
        )}

        {/* ---------------- STAGE 2: AT PICKUP ---------------- */}
        {currentStep === 'at_pickup' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-200 space-y-4">
            
            {/* Live Waiting Time Counter */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 animate-spin" />
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider block text-orange-100">
                    Tempo de Espera na Coleta
                  </span>
                  <span className="text-xs font-bold">Cliente notificado da sua chegada!</span>
                </div>
              </div>
              <div className="bg-black/30 backdrop-blur px-3 py-1 rounded-xl font-mono font-black text-xl tracking-wider">
                {formatSeconds(waitingSeconds)}
              </div>
            </div>

            {/* Sub-step A: Photo of Cargo */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                1. Foto da Carga Embarcada
              </label>

              <input
                ref={pickupFileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture(e, true)}
                className="hidden"
              />

              {pickupPhoto ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-gray-50 h-36 flex items-center justify-center group">
                  <img src={pickupPhoto} alt="Carga" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => pickupFileInputRef.current?.click()}
                      className="bg-white text-gray-900 font-bold text-xs px-3 py-1.5 rounded-xl shadow"
                    >
                      Tirar Outra Foto
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    ✓ Foto Anexada
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => pickupFileInputRef.current?.click()}
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-orange-300 hover:border-lala-orange bg-orange-50/50 flex flex-col items-center justify-center transition-colors active:scale-95"
                >
                  <Camera className="w-8 h-8 text-lala-orange mb-1" />
                  <span className="text-xs font-bold text-gray-800">Tirar Foto da Carga / Volumes</span>
                  <span className="text-[10px] text-gray-500">Câmera do celular obrigatória</span>
                </button>
              )}
            </div>

            {/* Sub-step B: 4-digit Pickup Security PIN */}
            <div className="space-y-1.5 pt-1 border-t border-gray-100">
              <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                2. Senha de Segurança da Coleta (4 dígitos)
              </label>
              <p className="text-[11px] text-gray-500">
                Peça o código de 4 dígitos para quem está entregando a carga.
              </p>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    maxLength={4}
                    value={pickupInputPin}
                    onChange={(e) => {
                      setPickupInputPin(e.target.value.slice(0, 4));
                      setPickupPinError(false);
                      setPickupPinVerified(false);
                    }}
                    placeholder="Digite os 4 dígitos"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-base font-mono font-bold tracking-widest focus:outline-none ${
                      pickupPinVerified 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                        : pickupPinError 
                        ? 'border-red-500 bg-red-50 text-red-800' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyPickupPin}
                  disabled={pickupInputPin.length < 4 || pickupPinVerified}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow transition-all ${
                    pickupPinVerified 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-lala-charcoal hover:bg-black text-white active:scale-95'
                  }`}
                >
                  {pickupPinVerified ? '✓ Validado' : 'Validar'}
                </button>
              </div>

              {pickupPinError && (
                <div className="text-[11px] text-red-600 font-bold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Código incorreto! Peça o código de 4 dígitos correto ao cliente.</span>
                </div>
              )}
            </div>

            {/* Confirm Pickup CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmPickupAndStartTrip}
                disabled={!pickupPinVerified || !pickupPhoto}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                  pickupPinVerified && pickupPhoto
                    ? 'bg-gradient-to-r from-lala-orange to-lala-orangeDark hover:brightness-105 active:scale-95 text-white shadow-orange-500/30'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>CONFIRMAR EMBARQUE & INICIAR VIAGEM</span>
                <ChevronRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

          </div>
        )}

        {/* ---------------- STAGE 3: IN TRANSIT ---------------- */}
        {currentStep === 'in_transit' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600 animate-spin" />
                <span>Navegando até o Destino (Ponto B)</span>
              </span>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                Carga em Trânsito
              </span>
            </div>

            <p className="text-xs text-gray-600">
              O cliente está acompanhando seu deslocamento no mapa em tempo real. Ao chegar a menos de 100m, o destinatário será alertado automaticamente.
            </p>

            <button
              onClick={handleManualArrivedDelivery}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>CHEGUEI NO DESTINO (PONTO B)</span>
            </button>
          </div>
        )}

        {/* ---------------- STAGE 4: AT DELIVERY ---------------- */}
        {currentStep === 'at_delivery' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-300 space-y-4">
            
            <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-sm">
              <span className="text-[10px] uppercase font-black tracking-wider block text-emerald-100">
                Local de Entrega Atingido
              </span>
              <p className="text-xs font-bold mt-0.5">
                Destinatário notificado. Solicite a senha de 4 dígitos para finalizar.
              </p>
            </div>

            {/* Receiver Name */}
            <div>
              <label className="text-xs font-black text-gray-800 uppercase tracking-wider block mb-1">
                Nome de Quem Recebeu
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Ex: Carlos / Porteiro"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* 4-digit Delivery Security PIN */}
            <div className="space-y-1.5 pt-1 border-t border-gray-100">
              <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                Senha de Finalização (4 dígitos)
              </label>
              <p className="text-[11px] text-gray-500">
                Peça ao destinatário a senha gerada pelo app dele.
              </p>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    maxLength={4}
                    value={deliveryInputPin}
                    onChange={(e) => {
                      setDeliveryInputPin(e.target.value.slice(0, 4));
                      setDeliveryPinError(false);
                      setDeliveryPinVerified(false);
                    }}
                    placeholder="Digite os 4 dígitos"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-base font-mono font-bold tracking-widest focus:outline-none ${
                      deliveryPinVerified 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                        : deliveryPinError 
                        ? 'border-red-500 bg-red-50 text-red-800' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyDeliveryPin}
                  disabled={deliveryInputPin.length < 4 || deliveryPinVerified}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow transition-all ${
                    deliveryPinVerified 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-lala-charcoal hover:bg-black text-white active:scale-95'
                  }`}
                >
                  {deliveryPinVerified ? '✓ Validado' : 'Validar'}
                </button>
              </div>

              {deliveryPinError && (
                <div className="text-[11px] text-red-600 font-bold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Código incorreto! Peça a senha de 4 dígitos correta ao destinatário.</span>
                </div>
              )}
            </div>

            {/* Photo of Delivery / Proof */}
            <div className="space-y-1.5 pt-1 border-t border-gray-100">
              <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                Foto do Pacote Entregue
              </label>

              <input
                ref={deliveryFileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture(e, false)}
                className="hidden"
              />

              {deliveryPhoto ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-gray-50 h-36 flex items-center justify-center group">
                  <img src={deliveryPhoto} alt="Entrega" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => deliveryFileInputRef.current?.click()}
                      className="bg-white text-gray-900 font-bold text-xs px-3 py-1.5 rounded-xl shadow"
                    >
                      Alterar Foto
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    ✓ Comprovante Anexado
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => deliveryFileInputRef.current?.click()}
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 flex flex-col items-center justify-center transition-colors active:scale-95"
                >
                  <Camera className="w-8 h-8 text-emerald-600 mb-1" />
                  <span className="text-xs font-bold text-gray-800">Tirar Foto do Pacote Entregue</span>
                  <span className="text-[10px] text-gray-500">Comprovante de entrega obrigatório</span>
                </button>
              )}
            </div>

            {/* Payout Display */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-bold">Valor a receber na carteira:</span>
              <span className="font-black text-lala-charcoal text-base">
                R$ {order.price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Finalize Button */}
            <button
              type="button"
              onClick={handleFinalizeDelivery}
              disabled={!deliveryPinVerified || !deliveryPhoto}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                deliveryPinVerified && deliveryPhoto
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 active:scale-95 text-white shadow-emerald-600/30'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>CONCLUIR ENTREGA & RECEBER PAGAMENTO</span>
            </button>

          </div>
        )}

        {/* Cargo Details Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="font-black text-gray-800 uppercase tracking-wider">Itens e Mercadoria</span>
            <span className="font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded">
              {order.vehicleType}
            </span>
          </div>
          <p className="font-bold text-gray-900">{order.cargoType}</p>
          {order.clientNotes && (
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/70 text-amber-900">
              <span className="font-bold block text-[10px] uppercase">Instrução do Cliente:</span>
              <span>{order.clientNotes}</span>
            </div>
          )}
        </div>

        {/* Cancel Button */}
        <div className="text-center pt-1 pb-4">
          <button
            onClick={() => {
              if (confirm('Deseja realmente cancelar esta corrida?')) {
                onCancel(order.id);
              }
            }}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 underline transition-colors"
          >
            Problemas com a entrega? Cancelar pedido
          </button>
        </div>

      </div>

      {/* Simulated Call Modal */}
      {showCallAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Phone className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Ligando para o cliente...</h4>
              <p className="text-xs text-gray-500 mt-1">
                {['to_pickup', 'at_pickup'].includes(currentStep) ? order.pickup.contactPhone : order.delivery.contactPhone}
              </p>
            </div>
            <button
              onClick={() => setShowCallAlert(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              Encerrar Chamada
            </button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b flex items-center justify-between bg-lala-charcoal text-white rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-lala-orange flex items-center justify-center font-bold text-xs">
                  💬
                </div>
                <div>
                  <h4 className="font-bold text-xs">Chat com Cliente</h4>
                  <span className="text-[10px] text-emerald-400">Online</span>
                </div>
              </div>
              <button onClick={() => setShowChatModal(false)} className="text-gray-400 font-bold p-1">
                ✕
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${
                    msg.sender === 'driver' 
                      ? 'bg-lala-orange text-white rounded-br-none' 
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="block text-[9px] text-right opacity-70 mt-1">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex items-center gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Digite sua mensagem ao cliente..."
                className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-lala-orange"
              />
              <button 
                type="submit"
                className="bg-lala-orange text-white px-3.5 py-2.5 rounded-xl text-xs font-bold hover:bg-lala-orangeDark"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
