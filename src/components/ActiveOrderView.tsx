import React, { useState } from 'react';
import { 
  Phone, MessageSquare, Navigation, CheckCircle2, 
  MapPin, Package, AlertTriangle, Camera, Upload, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { sound } from '../sound';

interface ActiveOrderViewProps {
  order: Order;
  onUpdateStatus: (status: OrderStatus) => void;
  onComplete: (order: Order, receiptName: string) => void;
  onCancel: (orderId: string) => void;
  onMinimize?: () => void;
}

export const ActiveOrderView: React.FC<ActiveOrderViewProps> = ({
  order,
  onUpdateStatus,
  onComplete,
  onCancel,
  onMinimize,
}) => {
  const [currentStep, setCurrentStep] = useState<OrderStatus>('to_pickup');
  const [receiverName, setReceiverName] = useState(order.recipientName);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showCallAlert, setShowCallAlert] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'client', text: 'Olá! Estou no aguardo da coleta, já separei os volumes.', time: '14:20' },
  ]);
  const [newMsg, setNewMsg] = useState('');

  const handleNextStep = () => {
    sound.playClick();
    if (currentStep === 'to_pickup') {
      setCurrentStep('at_pickup');
      onUpdateStatus('at_pickup');
    } else if (currentStep === 'at_pickup') {
      setCurrentStep('in_transit');
      onUpdateStatus('in_transit');
    } else if (currentStep === 'in_transit') {
      setCurrentStep('at_delivery');
      onUpdateStatus('at_delivery');
    } else if (currentStep === 'at_delivery') {
      setShowPhotoModal(true);
    }
  };

  const handleFinalize = () => {
    sound.playCashSuccess();
    setShowPhotoModal(false);
    onComplete(order, receiverName || 'Destinatário');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'driver', text: newMsg.trim(), time: 'Agora' }]);
    setNewMsg('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'client', text: 'Perfeito, obrigado!', time: 'Agora' }]);
    }, 1200);
  };

  // Current instructions based on step
  const stepInfo = {
    to_pickup: {
      title: 'A caminho da Coleta',
      badge: 'ETAPA 1/4',
      targetAddress: order.pickup.address,
      contact: order.pickup.contactName || order.senderName,
      phone: order.pickup.contactPhone || '(11) 98765-4321',
      actionText: 'CHEGUEI NA COLETA (PONTO A)',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    },
    at_pickup: {
      title: 'No Local da Coleta',
      badge: 'ETAPA 2/4',
      targetAddress: order.pickup.address,
      contact: order.pickup.contactName || order.senderName,
      phone: order.pickup.contactPhone || '(11) 98765-4321',
      actionText: 'CARGA COLETADA • INICIAR ENTREGA',
      btnColor: 'bg-lala-orange hover:bg-lala-orangeDark',
    },
    in_transit: {
      title: 'A caminho da Entrega',
      badge: 'ETAPA 3/4',
      targetAddress: order.delivery.address,
      contact: order.delivery.contactName || order.recipientName,
      phone: order.delivery.contactPhone || '(11) 98765-4321',
      actionText: 'CHEGUEI NO DESTINO (PONTO B)',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
    },
    at_delivery: {
      title: 'No Local de Entrega',
      badge: 'ETAPA 4/4',
      targetAddress: order.delivery.address,
      contact: order.delivery.contactName || order.recipientName,
      phone: order.delivery.contactPhone || '(11) 98765-4321',
      actionText: 'CONCLUIR ENTREGA & RECEBER R$ ' + order.price.toFixed(2),
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    },
  }[currentStep as 'to_pickup' | 'at_pickup' | 'in_transit' | 'at_delivery'] || {
    title: 'Pedido Ativo',
    badge: 'EM ANDAMENTO',
    targetAddress: order.delivery.address,
    contact: order.recipientName,
    phone: '(11) 98765-4321',
    actionText: 'AVANÇAR ETAPA',
    btnColor: 'bg-lala-orange',
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto pb-24">
      {/* Top Status Header */}
      <div className="bg-lala-charcoal text-white px-4 py-3 shadow-md sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {onMinimize && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onMinimize();
                }}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-[10px] font-bold flex items-center gap-1 mr-1"
                title="Minimizar tela da corrida"
              >
                <span>← Minimizar</span>
              </button>
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {stepInfo.badge}
            </span>
            <span className="text-xs font-bold text-gray-300">
              • Pedido {order.code}
            </span>
          </div>

          <div className="bg-lala-orange/20 border border-lala-orange/40 text-lala-orange font-black text-xs px-2.5 py-0.5 rounded-full">
            R$ {order.price.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          {stepInfo.title}
        </h2>
        <p className="text-xs text-gray-300 truncate">
          {stepInfo.targetAddress}
        </p>
      </div>

      {/* Interactive Live Map */}
      <div className="p-3">
        <InteractiveMap
          pickup={order.pickup}
          delivery={order.delivery}
          showRoute={true}
          className="h-64 shadow-md rounded-2xl"
        />
      </div>

      {/* Contact & Navigation Quick Bar */}
      <div className="px-3 pb-3">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-lala-orange flex items-center justify-center font-bold text-sm shrink-0">
              {stepInfo.contact.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Contato Atual</span>
              <p className="text-xs font-bold text-gray-900 truncate">{stepInfo.contact}</p>
              <p className="text-[11px] text-gray-500">{stepInfo.phone}</p>
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
              title="Ligar para o cliente"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stepInfo.targetAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
              title="Navegar no Google Maps"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Rotas</span>
            </a>
          </div>
        </div>
      </div>

      {/* Cargo & Instructions Card */}
      <div className="px-3 space-y-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-lala-orange" />
              <span className="text-xs font-bold text-gray-800">Itens e Mercadoria</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded">
              {order.vehicleType}
            </span>
          </div>

          <div className="text-xs text-gray-700 space-y-1">
            <p className="font-semibold text-gray-900">{order.cargoType}</p>
            {order.cargoWeightKg && (
              <p className="text-gray-500">Peso aproximado: {order.cargoWeightKg} kg</p>
            )}
            {order.clientNotes && (
              <div className="mt-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200/70 text-amber-900 text-xs">
                <span className="font-bold block text-[10px] uppercase">Instrução Especial:</span>
                <span>{order.clientNotes}</span>
              </div>
            )}
          </div>

          {/* Stepper Progress Visualizer */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Fluxo da Corrida</span>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
              <div className={`p-1.5 rounded-lg font-bold ${
                currentStep === 'to_pickup' ? 'bg-orange-500 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                1. Coleta
              </div>
              <div className={`p-1.5 rounded-lg font-bold ${
                currentStep === 'at_pickup' ? 'bg-orange-500 text-white' : 
                ['in_transit', 'at_delivery'].includes(currentStep) ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
              }`}>
                2. Cheguei
              </div>
              <div className={`p-1.5 rounded-lg font-bold ${
                currentStep === 'in_transit' ? 'bg-orange-500 text-white' : 
                currentStep === 'at_delivery' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
              }`}>
                3. Trânsito
              </div>
              <div className={`p-1.5 rounded-lg font-bold ${
                currentStep === 'at_delivery' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'
              }`}>
                4. Concluir
              </div>
            </div>
          </div>
        </div>

        {/* Big Action Button for next step */}
        <button
          onClick={handleNextStep}
          className={`w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${stepInfo.btnColor}`}
        >
          <span>{stepInfo.actionText}</span>
          <ChevronRight className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Cancel button */}
        <div className="text-center pt-1 pb-4">
          <button
            onClick={() => {
              if (confirm('Deseja realmente cancelar esta corrida em andamento?')) {
                onCancel(order.id);
              }
            }}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 underline transition-colors"
          >
            Problemas com a coleta? Cancelar pedido
          </button>
        </div>
      </div>

      {/* Completion & Proof of Delivery Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-gray-900 text-base">Comprovante de Entrega</h3>
              </div>
              <button 
                onClick={() => setShowPhotoModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Nome de quem recebeu o pacote:
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
                placeholder="Ex: Porteiro José / Juliana"
              />
            </div>

            {/* Photo preview / camera */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Foto da entrega / Mercadoria entregue:
              </label>
              <div 
                onClick={() => setPhotoTaken(!photoTaken)}
                className={`w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  photoTaken ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {photoTaken ? (
                  <div className="text-center text-emerald-700">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-xs font-bold block">Foto do comprovante anexada!</span>
                    <span className="text-[10px] text-emerald-600">Clique para alterar foto</span>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Camera className="w-8 h-8 mx-auto mb-1 text-lala-orange" />
                    <span className="text-xs font-bold block">Tirar foto ou anexar comprovante</span>
                    <span className="text-[10px] text-gray-400">Clique para simular captura</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-gray-600">Valor a ser creditado:</span>
              <span className="font-extrabold text-lala-charcoal text-base">
                R$ {order.price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <button
              onClick={handleFinalize}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>CONFIRMAR ENTREGA & FINALIZAR</span>
            </button>
          </div>
        </div>
      )}

      {/* Simulated Call Modal */}
      {showCallAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Phone className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Ligando para {stepInfo.contact}...</h4>
              <p className="text-xs text-gray-500 mt-1">{stepInfo.phone}</p>
            </div>
            <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
              Número protegido pelo sistema Parceiro Masked Call.
            </p>
            <button
              onClick={() => setShowCallAlert(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              Encerrar Chamada
            </button>
          </div>
        </div>
      )}

      {/* Simulated Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b flex items-center justify-between bg-lala-charcoal text-white rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-lala-orange flex items-center justify-center font-bold text-xs">
                  {stepInfo.contact.slice(0, 1)}
                </div>
                <div>
                  <h4 className="font-bold text-xs">{stepInfo.contact}</h4>
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
