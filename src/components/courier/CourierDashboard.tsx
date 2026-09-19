import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { formatCurrency } from '../../services/pricingEngine';
import { StatusBadge } from '../common/StatusBadge';
import { CourierScanner } from './CourierScanner';
import { CourierWallet } from './CourierWallet';
import { RegisterCourierModal } from '../auth/RegisterCourierModal';
import { IncomingOrderAlarmModal } from './IncomingOrderAlarmModal';
import { CourierNavigationModal } from './CourierNavigationModal';
import { audioAlert } from '../../utils/audioAlert';
import {
  Bike,
  Car,
  MapPin,
  Clock,
  QrCode,
  CheckCircle2,
  Navigation,
  Wallet,
  Compass,
  AlertCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  UserPlus,
  Bell,
  Volume2,
} from 'lucide-react';

export const CourierDashboard: React.FC = () => {
  const {
    orders,
    courierProfile,
    setCourierProfile,
    couriers,
    acceptOrder,
    recordCourierPickup,
    completeDelivery,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'radar' | 'active' | 'wallet'>('radar');
  const [isRegisterCourierOpen, setIsRegisterCourierOpen] = useState(false);
  const [selectedOrderForScan, setSelectedOrderForScan] = useState<{
    order: Order;
    type: 'pickup' | 'delivery';
  } | null>(null);
  const [selectedOrderForNavigation, setSelectedOrderForNavigation] = useState<Order | null>(null);
  const [alarmOrder, setAlarmOrder] = useState<Order | null>(null);
  const [dismissedAlarmIds, setDismissedAlarmIds] = useState<Set<string>>(new Set());

  // Pedidos disponíveis para aceite no radar (status 'created' e sem entregador alocado)
  const availableOrders = orders.filter(
    (o) => (o.status === 'created' || o.status === 'at_dropoff') && (!o.courierId || o.courierId === '')
  );

  // Pedidos em andamento aceitos por este entregador
  const myActiveOrders = orders.filter(
    (o) =>
      (o.courierId === courierProfile.id || (courierProfile.id === 'courier_unregistered' && !!o.courierId)) &&
      (o.status === 'created' || o.status === 'in_transit' || o.status === 'at_dropoff')
  );

  // Escuta novos chamados no radar e dispara alarme sonoro
  useEffect(() => {
    const unread = availableOrders.find((o) => !dismissedAlarmIds.has(o.id));
    if (unread) {
      setAlarmOrder(unread);
    } else {
      setAlarmOrder(null);
      audioAlert.stopCourierAlarm();
    }
  }, [availableOrders.length]);

  const handleAcceptOrder = (orderId: string) => {
    audioAlert.stopCourierAlarm();
    setAlarmOrder(null);
    acceptOrder(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setSelectedOrderForNavigation(ord);
    }
    setActiveTab('active');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner do Entregador */}
      {couriers.length === 0 || courierProfile.id === 'courier_unregistered' ? (
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">Nenhum Entregador Credenciado no Modo Teste Real</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Aguardando Cadastro
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cadastre-se para receber chamados de entregas via Moto ou Carro e repasses transparentes via Pix.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRegisterCourierOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Quero ser Entregador</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={courierProfile.avatarUrl}
                alt={courierProfile.name}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-amber-400"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">{courierProfile.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  {courierProfile.modal}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Credenciado
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Placa: {courierProfile.vehiclePlate} • CPF: {courierProfile.document}
              </p>
            </div>
          </div>

          {/* Resumo Rápido da Carteira & Ações de Cadastro */}
          <div className="flex items-center gap-3">
            {couriers.length > 1 && (
              <select
                value={courierProfile.id}
                onChange={(e) => {
                  const found = couriers.find((c) => c.id === e.target.value);
                  if (found) setCourierProfile(found);
                }}
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 outline-hidden"
              >
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.modal.toUpperCase()})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setIsRegisterCourierOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cadastrar Outro</span>
            </button>

            <div className="text-right pl-2 border-l border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Saldo Disponível:</span>
              <div className="text-xl font-black font-mono text-amber-400">
                {formatCurrency(courierProfile.balanceAvailable)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'radar'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Radar de Chamados</span>
          {availableOrders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-950 text-amber-400">
              {availableOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'active'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Minhas Corridas Ativas</span>
          {myActiveOrders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-600 text-white">
              {myActiveOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'wallet'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Carteira & Repasses</span>
        </button>
      </div>

      {/* Tab 1: Radar de Chamados Disponíveis */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Coletas Disponíveis na Região ({availableOrders.length})
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => audioAlert.playChime()}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="Testar barulhinho de chamada de corrida"
              >
                <Bell className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
                <span>Testar Barulhinho</span>
              </button>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Modal: <strong className="uppercase">{courierProfile.modal}</strong>
              </span>
            </div>
          </div>

          {availableOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-spin" />
              <h4 className="text-sm font-bold text-slate-800">
                Nenhum novo chamado aguardando no radar
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Novas coletas geradas pelos clientes aparecem instantaneamente aqui com alerta sonoro. Crie uma cotação na aba "Cliente" para testar o chamado real!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-400 p-5 shadow-xs transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {ord.trackingCode}
                      </span>
                      {ord.isUrgent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-700 flex items-center gap-0.5">
                          <Zap className="w-3 h-3" /> URGENTE
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Líquido:</span>
                      <div className="text-lg font-black font-mono text-emerald-700">
                        {formatCurrency(ord.price.totalCourierPayout)}
                      </div>
                    </div>
                  </div>

                  {/* Endereços da Rota */}
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-start gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0"></span>
                      <div>
                        <strong>Coleta:</strong> {ord.sender.address.neighborhood} (
                        {ord.pickupMethod === 'dropoff_point' ? 'No Ponto Lojista' : 'Porta a Porta'})
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
                      <div>
                        <strong>Entrega:</strong> {ord.recipient.address.neighborhood}
                      </div>
                    </div>
                  </div>

                  {/* Segurança do Remetente (KYC) para tranquilidade do motorista */}
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Remetente Verificado: <strong>{ord.sender.name}</strong> • Carga Lícita Declarada
                    </span>
                  </div>

                  {/* Detalhes de Distância e Split */}
                  <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>{ord.price.distanceKm} km (~{ord.price.durationMin}m)</span>
                    <span>Peso: {ord.weightKg} kg</span>
                    <span className="text-amber-700 font-bold uppercase">{ord.modal}</span>
                  </div>

                  <button
                    onClick={() => handleAcceptOrder(ord.id)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Aceitar Chamado & Ver Rota no Mapa</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Minhas Corridas Ativas */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Minhas Entregas em Curso ({myActiveOrders.length})
          </h4>

          {myActiveOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Navigation className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">
                Você não tem nenhuma corrida em andamento
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Acesse a aba "Radar de Chamados" para aceitar uma nova corrida.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myActiveOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border-2 border-amber-300 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          {ord.trackingCode}
                        </span>
                        <StatusBadge status={ord.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pacote: {ord.packageDescription} ({ord.weightKg} kg)
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Seu Repasse Garantido:
                      </span>
                      <div className="text-lg font-black font-mono text-emerald-700">
                        {formatCurrency(ord.price.totalCourierPayout)}
                      </div>
                    </div>
                  </div>

                  {/* Endereços da Rota */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-800 uppercase">
                        Endereço de Coleta (Origem):
                      </span>
                      <div className="font-bold text-slate-900 mt-1">
                        {ord.sender.name} ({ord.sender.phone})
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        {ord.sender.address.street}, {ord.sender.address.number} —{' '}
                        {ord.sender.address.neighborhood}
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">
                        Endereço de Entrega (Destino):
                      </span>
                      <div className="font-bold text-slate-900 mt-1">
                        {ord.recipient.name} ({ord.recipient.phone})
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        {ord.recipient.address.street}, {ord.recipient.address.number} —{' '}
                        {ord.recipient.address.neighborhood}
                      </div>
                    </div>
                  </div>

                  {/* Botão Principal: Ver Mapa e Iniciar Navegação GPS */}
                  <button
                    onClick={() => setSelectedOrderForNavigation(ord)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span>
                      {ord.status === 'in_transit'
                        ? '🗺️ Ver Mapa & Iniciar Navegação até a Entrega'
                        : '🗺️ Ver Mapa & Iniciar Navegação até a Retirada'}
                    </span>
                  </button>

                  {/* Ações do Fluxo Operacional de Escaneamento de QR Code */}
                  <div className="pt-1 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    {(ord.status === 'created' || ord.status === 'at_dropoff') && (
                      <button
                        onClick={() => setSelectedOrderForScan({ order: ord, type: 'pickup' })}
                        className="w-full sm:w-auto flex-1 py-2.5 px-3 rounded-xl border border-amber-400/80 bg-amber-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-700" />
                        <span>Escanear QR de Coleta (Baixa 1)</span>
                      </button>
                    )}

                    {ord.status === 'in_transit' && (
                      <button
                        onClick={() => setSelectedOrderForScan({ order: ord, type: 'delivery' })}
                        className="w-full sm:w-auto flex-1 py-2.5 px-3 rounded-xl border border-emerald-400 bg-emerald-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Escanear QR de Entrega Final</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Carteira */}
      {activeTab === 'wallet' && <CourierWallet />}

      {/* Modal de Navegação GPS e Check-ins Passo a Passo */}
      {selectedOrderForNavigation && (
        <CourierNavigationModal
          order={orders.find((o) => o.id === selectedOrderForNavigation.id) || selectedOrderForNavigation}
          onClose={() => setSelectedOrderForNavigation(null)}
          onPickupComplete={(orderId, photo) => {
            recordCourierPickup(orderId, photo);
          }}
          onDeliveryComplete={(orderId, sig, photo) => {
            completeDelivery(orderId, sig, photo);
          }}
        />
      )}

      {/* Modal de Alerta de Chamada Sonoro */}
      {alarmOrder && (
        <IncomingOrderAlarmModal
          order={alarmOrder}
          onAccept={handleAcceptOrder}
          onDismiss={() => {
            audioAlert.stopCourierAlarm();
            setDismissedAlarmIds((prev) => new Set([...prev, alarmOrder.id]));
            setAlarmOrder(null);
          }}
        />
      )}

      {/* Modal do Scanner de QR Code e Assinatura */}
      {selectedOrderForScan && (
        <CourierScanner
          order={selectedOrderForScan.order}
          scanType={selectedOrderForScan.type}
          onComplete={() => {
            setSelectedOrderForScan(null);
            setActiveTab('active');
          }}
          onCancel={() => setSelectedOrderForScan(null)}
        />
      )}

      {/* Modal de Cadastro de Entregador */}
      {isRegisterCourierOpen && (
        <RegisterCourierModal
          onClose={() => setIsRegisterCourierOpen(false)}
          onSuccess={() => setIsRegisterCourierOpen(false)}
        />
      )}
    </div>
  );
};
