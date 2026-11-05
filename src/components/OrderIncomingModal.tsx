import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Package, ArrowRight, X, Check, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { sound } from '../sound';

interface OrderIncomingModalProps {
  order: Order | null;
  onAccept: (order: Order) => void;
  onDecline: (orderId: string) => void;
}

export const OrderIncomingModal: React.FC<OrderIncomingModalProps> = ({
  order,
  onAccept,
  onDecline,
}) => {
  const [timeLeft, setTimeLeft] = useState(25);
  const totalTime = 25;

  useEffect(() => {
    if (!order) return;
    setTimeLeft(totalTime);
    sound.playNewOrderAlert();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline(order.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.id]);

  if (!order) return null;

  const progressPercent = (timeLeft / totalTime) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-slide-up flex flex-col max-h-[92vh]">
        
        {/* Top Header with Countdown Bar */}
        <div className="relative bg-gradient-to-r from-lala-charcoal to-zinc-800 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lala-orange animate-ping" />
              <span className="text-xs font-black tracking-wider uppercase text-lala-orange">
                NOVO PEDIDO DISPONÍVEL
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-lala-orange" />
              <span className={timeLeft <= 5 ? 'text-red-400 font-extrabold animate-pulse' : 'text-gray-200'}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                timeLeft > 10 ? 'bg-lala-orange' : 'bg-red-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Main Price & Route Banner */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 block">Você vai receber</span>
              <div className="text-3xl font-black text-lala-charcoal tracking-tight">
                R$ {order.price.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Pago via App Parceiro</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-lala-orange text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg uppercase shadow-sm">
                {order.vehicleType.toUpperCase()}
              </span>
              <div className="text-xs font-bold text-gray-600 mt-1">
                {order.distanceToPickupKm} km até coleta
              </div>
              <div className="text-[11px] text-gray-500">
                {order.totalDistanceKm} km percurso total (~{order.estimatedMinutes} min)
              </div>
            </div>
          </div>

          {/* Route details: A -> B */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative">
            <div className="space-y-4">
              
              {/* Point A: Pickup */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm mt-0.5">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      COLETA • {order.distanceToPickupKm} KM DE VOCÊ
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 leading-snug truncate">
                    {order.pickup.address}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {order.pickup.neighborhood}, {order.pickup.city}
                  </p>
                  {order.pickup.contactName && (
                    <p className="text-[10px] text-gray-600 font-medium mt-0.5">
                      Contato: {order.pickup.contactName}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting line */}
              <div className="ml-3 pl-3 border-l-2 border-dashed border-gray-300 py-0.5 my-[-4px]"></div>

              {/* Point B: Delivery */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm mt-0.5">
                  B
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
                    ENTREGA FINAL
                  </span>
                  <p className="text-xs font-bold text-gray-900 leading-snug truncate">
                    {order.delivery.address}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {order.delivery.neighborhood}, {order.delivery.city}
                  </p>
                  {order.delivery.contactName && (
                    <p className="text-[10px] text-gray-600 font-medium mt-0.5">
                      Destinatário: {order.delivery.contactName}
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Cargo Details */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-lala-orange flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <span className="text-gray-500 block text-[10px] uppercase font-semibold">Carga & Detalhes</span>
              <span className="font-bold text-gray-800">{order.cargoType}</span>
              {order.cargoWeightKg && (
                <span className="text-gray-500 text-[11px]"> (~{order.cargoWeightKg} kg)</span>
              )}
            </div>
          </div>

          {order.clientNotes && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-[10px] uppercase">Nota do Cliente</span>
                <span>{order.clientNotes}</span>
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons: Accept / Decline */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onDecline(order.id);
            }}
            className="w-1/3 py-3.5 rounded-2xl bg-gray-200 hover:bg-gray-300 active:scale-95 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <X className="w-4 h-4" />
            <span>Recusar</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onAccept(order);
            }}
            className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-lala-orange to-lala-orangeDark hover:brightness-105 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-all"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>ACEITAR CORRIDA</span>
          </button>
        </div>

      </div>
    </div>
  );
};
