import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, CourierProfile } from '../../types';
import { formatCurrency } from '../../services/pricingEngine';
import { StatusBadge } from '../common/StatusBadge';
import { CourierWallet } from './CourierWallet';
import { IncomingOrderAlarmModal } from './IncomingOrderAlarmModal';
import { CourierNavigationModal } from './CourierNavigationModal';
import { CourierAuthPortal } from './CourierAuthPortal';
import { audioAlert } from '../../utils/audioAlert';
import {
  Bike,
  Car,
  Compass,
  MapPin,
  Clock,
  QrCode,
  CheckCircle2,
  Navigation,
  Wallet,
  User,
  ShieldCheck,
  Bell,
  Power,
  ExternalLink,
  ChevronRight,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  Users,
} from 'lucide-react';

interface CourierStandaloneAppProps {
  onBackToMain?: () => void;
}

interface CourierDashboardViewProps {
  courierSession: CourierProfile;
  onBackToMain?: () => void;
}

const CourierDashboardView: React.FC<CourierDashboardViewProps> = ({ courierSession }) => {
  const {
    toggleCourierOnline,
    logoutCourier,
    orders,
    acceptOrder,
    recordCourierPickup,
    completeDelivery,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'radar' | 'my_orders' | 'wallet' | 'profile'>('radar');
  const [selectedOrderForNavigation, setSelectedOrderForNavigation] = useState<Order | null>(null);
  const [alarmOrder, setAlarmOrder] = useState<Order | null>(null);

  // Armazena e persiste IDs de chamados ignorados exclusivamente por este entregador
  const [ignoredOrderIds, setIgnoredOrderIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`parceiro_ignored_orders_${courierSession.id}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const isOnline = Boolean(courierSession.isOnline);

  // Pedidos disponíveis no radar: status 'created' ou 'at_dropoff', sem entregador alocado e NÃO ignorados por este entregador
  const availableOrders = orders.filter(
    (o) =>
      (o.status === 'created' || o.status === 'at_dropoff') &&
      (!o.courierId || o.courierId === '') &&
      !ignoredOrderIds.has(o.id)
  );

  // Pedidos atribuídos exclusivamente a este entregador
  const myActiveOrders = orders.filter(
    (o) =>
      o.courierId === courierSession.id &&
      (o.status === 'created' || o.status === 'in_transit' || o.status === 'at_dropoff')
  );

  const myDeliveredOrders = orders.filter(
    (o) => o.courierId === courierSession.id && o.status === 'delivered'
  );

  // Ignora permanentemente um chamado no radar para este entregador
  const handleIgnoreOrder = (orderId: string) => {
    audioAlert.stopCourierAlarm();
    if (alarmOrder?.id === orderId) {
      setAlarmOrder(null);
    }
    setIgnoredOrderIds((prev) => {
      const updated = new Set(prev);
      updated.add(orderId);
      try {
        localStorage.setItem(
          `parceiro_ignored_orders_${courierSession.id}`,
          JSON.stringify(Array.from(updated))
        );
      } catch (err) {
        console.warn('Erro ao salvar pedidos ignorados:', err);
      }
      return updated;
    });
  };

  // Escuta novos chamados no radar apenas se o entregador estiver ONLINE
  useEffect(() => {
    if (!isOnline) {
      setAlarmOrder(null);
      audioAlert.stopCourierAlarm();
      return;
    }

    const unread = availableOrders.find((o) => !ignoredOrderIds.has(o.id));
    if (unread) {
      setAlarmOrder(unread);
    } else {
      setAlarmOrder(null);
      audioAlert.stopCourierAlarm();
    }
  }, [availableOrders.length, isOnline, ignoredOrderIds]);

  const handleAcceptOrder = (orderId: string) => {
    audioAlert.stopCourierAlarm();
    setAlarmOrder(null);
    acceptOrder(orderId, courierSession);

    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setSelectedOrderForNavigation(ord);
    }
    setActiveTab('my_orders');
  };

  const handleToggleOnline = () => {
    toggleCourierOnline(courierSession.id);
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente sair da sua conta de entregador?')) {
      audioAlert.stopCourierAlarm();
      logoutCourier();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950 pb-20 sm:pb-8">
      {/* ========================================================
          CABEÇALHO SUPERIOR DO APP DO ENTREGADOR
      ======================================================== */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Perfil Rápido do Entregador */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={courierSession.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={courierSession.name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-400 shadow-sm"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  isOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/30' : 'bg-slate-600'
                }`}
              ></span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-sm font-black text-white truncate">{courierSession.name}</span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono shrink-0">
                  {courierSession.modal}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                {courierSession.vehiclePlate} • {courierSession.vehicleModel || 'Veículo Parceiro'}
              </p>
            </div>
          </div>

          {/* Controles de Status (Online/Offline) e Saldo */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Botão de Disponibilidade Online / Offline */}
            <button
              onClick={handleToggleOnline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                isOnline
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </button>

            {/* Badge de Saldo Pix */}
            <button
              onClick={() => setActiveTab('wallet')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/40 text-amber-400 text-xs font-mono font-bold transition cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatCurrency(courierSession.balanceAvailable ?? 0)}</span>
            </button>

            {/* Botão Sair da Conta */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 transition cursor-pointer text-xs font-bold"
              title="Sair da Conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Sub-barra com abas desktop */}
        <div className="hidden sm:block border-t border-slate-800/60 bg-slate-900/60">
          <div className="max-w-5xl mx-auto px-4 flex items-center gap-2 py-1.5">
            <button
              onClick={() => setActiveTab('radar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'radar'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Radar de Chamados</span>
              {availableOrders.length > 0 && isOnline && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {availableOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('my_orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'my_orders'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Minhas Corridas</span>
              {myActiveOrders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                  {myActiveOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'wallet'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Carteira Pix</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Meu Veículo & Cadastro</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          CONTEÚDO PRINCIPAL DO APP DO ENTREGADOR
      ======================================================== */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {/* ========================================================
            TAB 1: RADAR DE CHAMADOS NA REGIÃO
        ======================================================== */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            {!isOnline ? (
              /* ESTADO OFFLINE */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xl my-8">
                <div className="w-20 h-20 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <Power className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-white">Você está Desconectado (OFFLINE)</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Para começar a receber chamados de entregas com alarme sonoro na sua região, fique Online agora.
                </p>
                <button
                  onClick={handleToggleOnline}
                  className="mt-6 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  <Power className="w-4 h-4" />
                  <span>Ficar Online Agora</span>
                </button>
              </div>
            ) : (
              /* ESTADO ONLINE: RADAR ATIVO */
              <div className="space-y-6">
                {/* Banner de Radar Ativo */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Compass className="w-6 h-6 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
                      </div>
                      <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping"></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">Radar de Chamados Ativo</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Sinal Sonoro Ativado
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Procurando solicitações de clientes em um raio de até 5 km para {courierSession.modal.toUpperCase()}.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">
                      {availableOrders.length} {availableOrders.length === 1 ? 'corrida disponível' : 'corridas disponíveis'}
                    </span>
                  </div>
                </div>

                {/* Lista de Chamados Disponíveis */}
                {availableOrders.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
                      <Compass className="w-7 h-7 text-amber-400/60" />
                    </div>
                    <h4 className="text-sm font-black text-white">Nenhum chamado no radar no momento</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Mantenha o app aberto. Assim que um cliente solicitar um envio, o alarme tocará automaticamente aqui!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-slate-900 border border-amber-500/30 hover:border-amber-400 rounded-3xl p-5 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Top Card: Modal & Valor Líquido */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 font-bold flex items-center gap-1.5 uppercase">
                              {order.modal === 'moto' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                              <span>{order.modal} • {order.price.distanceKm} km</span>
                            </span>

                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Você recebe</span>
                              <span className="text-xl font-black font-mono text-emerald-400">
                                {formatCurrency(order.price.totalCourierPayout)}
                              </span>
                            </div>
                          </div>

                          {/* Rota Coleta -> Entrega */}
                          <div className="space-y-2 py-2 border-y border-slate-800 text-xs">
                            <div className="flex items-start gap-2.5">
                              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">1. Coleta</span>
                                <div className="text-slate-200 font-semibold leading-tight">
                                  {order.sender.address.neighborhood || order.sender.address.street}, {order.sender.address.city}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">2. Entrega</span>
                                <div className="text-slate-200 font-semibold leading-tight">
                                  {order.recipient.address.neighborhood || order.recipient.address.street}, {order.recipient.address.city}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{order.packageDescription || 'Pacote padrão'}</span>
                            <span className="font-mono">~{order.price.durationMin} min</span>
                          </div>
                        </div>

                        {/* Ações: Ignorar e Aceitar */}
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleIgnoreOrder(order.id)}
                            className="py-3 px-3.5 rounded-xl border border-slate-700 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 font-bold text-xs transition cursor-pointer"
                            title="Não tenho interesse nesta corrida"
                          >
                            Ignorar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAcceptOrder(order.id)}
                            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                          >
                            <span>Aceitar Corrida</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: MINHAS CORRIDAS (EM ANDAMENTO & CONCLUÍDAS)
        ======================================================== */}
        {activeTab === 'my_orders' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-white">Minhas Corridas</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gerencie suas coletas e entregas ativas, acione a navegação GPS e faça check-in com assinatura.
              </p>
            </div>

            {/* Corridas Ativas */}
            {myActiveOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
                <Navigation className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">Nenhuma corrida em andamento no momento</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Vá para a aba <strong>Radar de Chamados</strong> para aceitar novas entregas disponíveis.
                </p>
                <button
                  onClick={() => setActiveTab('radar')}
                  className="mt-4 px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Ver Radar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myActiveOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">{ord.trackingCode}</span>
                        <StatusBadge status={ord.status} />
                      </div>
                      <span className="text-base font-black font-mono text-emerald-400">
                        {formatCurrency(ord.price.totalCourierPayout)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Origem (Coleta):</span>
                        <div className="text-slate-200 font-semibold">{ord.sender.name}</div>
                        <div className="text-slate-400 text-[11px] truncate">
                          {ord.sender.address.street}, {ord.sender.address.number}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Destino (Entrega):</span>
                        <div className="text-slate-200 font-semibold">{ord.recipient.name}</div>
                        <div className="text-slate-400 text-[11px] truncate">
                          {ord.recipient.address.street}, {ord.recipient.address.number}
                        </div>
                      </div>
                    </div>

                    {/* Botão de Ação GPS */}
                    <button
                      onClick={() => setSelectedOrderForNavigation(ord)}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Abrir Mapa & Navegação GPS (Coleta / Entrega)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Histórico Recente de Entregas Deste Entregador */}
            {myDeliveredOrders.length > 0 && (
              <div className="pt-4 border-t border-slate-900">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Entregas Concluídas Recentemente ({myDeliveredOrders.length}):
                </h4>
                <div className="space-y-2">
                  {myDeliveredOrders.slice(0, 5).map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-mono font-bold text-slate-200">{ord.trackingCode}</div>
                          <div className="text-[10px] text-slate-400">
                            Entregue para {ord.recipient.name}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        +{formatCurrency(ord.price.totalCourierPayout)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: MINHA CARTEIRA PIX INDIVIDUAL
        ======================================================== */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-white">Minha Carteira Pix</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Acompanhe seus repasses por corrida e solicite transferências instantâneas via Pix.
              </p>
            </div>
            <CourierWallet />
          </div>
        )}

        {/* ========================================================
            TAB 4: MEU PERFIL & DADOS DO VEÍCULO
        ======================================================== */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={courierSession.avatarUrl}
                  alt={courierSession.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
                />
                <div>
                  <h3 className="text-lg font-black text-white">{courierSession.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Credenciado Ativo
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 uppercase">
                      {courierSession.modal}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-800 pt-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">CPF</span>
                  <div className="text-slate-200 font-mono font-semibold">{courierSession.document}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">CNH</span>
                  <div className="text-slate-200 font-mono font-semibold">{courierSession.cnh}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Placa</span>
                  <div className="text-slate-200 font-mono font-semibold uppercase">{courierSession.vehiclePlate}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Modelo</span>
                  <div className="text-slate-200 font-semibold">{courierSession.vehicleModel || 'Padrão'}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Chave Pix Cadastrada</span>
                  <div className="text-slate-200 font-mono font-semibold">{courierSession.pixKey}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Desconectar Deste Entregador</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          BARRA DE NAVEGAÇÃO INFERIOR (MOBILE-FIRST)
      ======================================================== */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition cursor-pointer relative ${
              activeTab === 'radar' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px]">Radar</span>
            {availableOrders.length > 0 && isOnline && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('my_orders')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition cursor-pointer relative ${
              activeTab === 'my_orders' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-5 h-5" />
            <span className="text-[10px]">Corridas</span>
            {myActiveOrders.length > 0 && (
              <span className="absolute top-1 right-3 px-1 py-0.2 rounded-full text-[9px] bg-amber-500 text-slate-950 font-bold">
                {myActiveOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'wallet' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px]">Carteira</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'profile' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Perfil</span>
          </button>
        </div>
      </nav>

      {/* ========================================================
          MODAIS OPERACIONAIS: ALARME E NAVEGAÇÃO GPS
      ======================================================== */}
      {/* Modal de Alarme Sonoro Pulsante de Chamado */}
      {alarmOrder && isOnline && (
        <IncomingOrderAlarmModal
          order={alarmOrder}
          onAccept={() => handleAcceptOrder(alarmOrder.id)}
          onDismiss={() => handleIgnoreOrder(alarmOrder.id)}
        />
      )}

      {/* Modal de Navegação GPS Passo a Passo (Coleta & Entrega) */}
      {selectedOrderForNavigation && (
        <CourierNavigationModal
          order={selectedOrderForNavigation}
          onClose={() => setSelectedOrderForNavigation(null)}
          onPickupComplete={recordCourierPickup}
          onDeliveryComplete={completeDelivery}
        />
      )}
    </div>
  );
};

export const CourierStandaloneApp: React.FC<CourierStandaloneAppProps> = ({ onBackToMain }) => {
  const { courierSession } = useApp();

  // Quando nenhum entregador estiver logado, exibe apenas a tela de autenticação
  if (!courierSession) {
    return <CourierAuthPortal onBackToMain={onBackToMain} />;
  }

  // Quando logado, monta o painel do entregador com todos os hooks internos isolados
  return <CourierDashboardView courierSession={courierSession} onBackToMain={onBackToMain} />;
};
