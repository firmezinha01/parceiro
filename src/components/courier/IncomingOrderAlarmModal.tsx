import React, { useEffect, useState } from 'react';
import { Order } from '../../types';
import { formatCurrency } from '../../services/pricingEngine';
import { audioAlert } from '../../utils/audioAlert';
import {
  Bell,
  Volume2,
  VolumeX,
  Zap,
  Bike,
  Car,
  CheckCircle2,
  X,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

interface IncomingOrderAlarmModalProps {
  order: Order;
  onAccept: (orderId: string) => void;
  onDismiss: () => void;
}

export const IncomingOrderAlarmModal: React.FC<IncomingOrderAlarmModalProps> = ({
  order,
  onAccept,
  onDismiss,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [countdown, setCountdown] = useState(45);

  useEffect(() => {
    // Inicia o som de chamada em loop ao montar o modal
    audioAlert.startCourierAlarm();

    // Contagem regressiva visual
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          audioAlert.stopCourierAlarm();
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      audioAlert.stopCourierAlarm();
    };
  }, [order.id]);

  const toggleSound = () => {
    if (isMuted) {
      audioAlert.startCourierAlarm();
      setIsMuted(false);
    } else {
      audioAlert.stopCourierAlarm();
      setIsMuted(true);
    }
  };

  const handleAccept = () => {
    audioAlert.stopCourierAlarm();
    onAccept(order.id);
  };

  const handleDismiss = () => {
    audioAlert.stopCourierAlarm();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[94vh] flex flex-col shadow-2xl border-2 border-amber-400 overflow-hidden animate-in zoom-in-95 my-0 sm:my-auto">
        {/* Header com Sinalizador Pulsante de Alerta */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-4 sm:p-5 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-md animate-bounce">
                <Bell className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 block">
                  Novo Chamado na Sua Região!
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Responda em <strong className="font-mono text-sm">{countdown}s</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleSound}
                className="p-2 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-900 transition cursor-pointer"
                title={isMuted ? 'Ativar som' : 'Silenciar som'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-2 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-900 transition cursor-pointer"
                title="Recusar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Corpo do Chamado */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Card do Valor Líquido a Receber */}
          <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-center space-y-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-800">
              Seu Valor a Receber (Pix Imediato):
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono tracking-tight">
              {formatCurrency(order.price.totalCourierPayout)}
            </div>
            <p className="text-[11px] text-emerald-900 font-medium">
              Repasse livre garantido após a comprovação de entrega
            </p>
          </div>

          {/* Rota e Trajeto */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                {order.modal === 'moto' ? (
                  <Bike className="w-4 h-4 text-amber-600" />
                ) : (
                  <Car className="w-4 h-4 text-amber-600" />
                )}
                <span className="uppercase">{order.modal === 'moto' ? 'Moto Express' : 'Carro'}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
                <span>{order.price.distanceKm} km</span>
                <span>•</span>
                <span>~{order.price.durationMin} min</span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-200 pt-2.5">
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0"></span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Retirada (Coleta):</span>
                  <strong className="text-slate-900 text-xs">
                    {order.sender.address.neighborhood}, {order.sender.address.city}
                  </strong>
                  <p className="text-[11px] text-slate-500">
                    {order.sender.address.street}, {order.sender.address.number}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Destino (Entrega):</span>
                  <strong className="text-slate-900 text-xs">
                    {order.recipient.address.neighborhood}, {order.recipient.address.city}
                  </strong>
                  <p className="text-[11px] text-slate-500">
                    {order.recipient.address.street}, {order.recipient.address.number}
                  </p>
                </div>
              </div>
            </div>

            {order.isUrgent && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-red-600" />
                <span>Entrega Prioritária Urgente</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Remetente verificado • Pacote pronto para retirada imediata</span>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-3 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition text-xs sm:text-sm cursor-pointer"
          >
            Ignorar
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition text-xs sm:text-sm cursor-pointer animate-pulse"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>ACEITAR CORRIDA AGORA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
