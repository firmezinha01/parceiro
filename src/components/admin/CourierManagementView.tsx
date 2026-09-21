import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CourierProfile } from '../../types';
import { formatCurrency } from '../../services/pricingEngine';
import {
  Bike,
  Car,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Eye,
  Camera,
  FileText,
  MapPin,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Filter,
  Ban,
  Unlock,
  Trash2,
  Power,
  Sparkles,
} from 'lucide-react';

interface CourierManagementViewProps {
  onOpenCourierApp?: (courierId?: string) => void;
}

export const CourierManagementView: React.FC<CourierManagementViewProps> = ({ onOpenCourierApp }) => {
  const {
    couriers,
    selectCourierSession,
    toggleCourierOnline,
    blockCourier,
    unblockCourier,
    deleteCourier,
    approveVerification,
    rejectVerification,
    orders,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterModal, setFilterModal] = useState<'all' | 'moto' | 'car'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'blocked'>('all');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{ title: string; url: string } | null>(null);

  // Cálculos de Frota
  const totalCouriers = couriers.length;
  const onlineCouriers = couriers.filter((c) => c.isOnline && !c.isBlocked).length;
  const motoCouriers = couriers.filter((c) => c.modal === 'moto').length;
  const carCouriers = couriers.filter((c) => c.modal === 'car').length;
  const totalDeliveriesAll = couriers.reduce((sum, c) => sum + c.totalDeliveries, 0);
  const totalBalanceAvailableAll = couriers.reduce((sum, c) => sum + c.balanceAvailable, 0);

  // Filtragem
  const filteredCouriers = couriers.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      c.name.toLowerCase().includes(term) ||
      c.document.includes(term) ||
      c.vehiclePlate.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term));

    const matchModal = filterModal === 'all' || c.modal === filterModal;

    let matchStatus = true;
    if (filterStatus === 'online') matchStatus = c.isOnline && !c.isBlocked;
    if (filterStatus === 'offline') matchStatus = !c.isOnline && !c.isBlocked;
    if (filterStatus === 'blocked') matchStatus = !!c.isBlocked;

    return matchSearch && matchModal && matchStatus;
  });

  const handleTestAsCourier = (courierId: string) => {
    selectCourierSession(courierId);
    if (onOpenCourierApp) {
      onOpenCourierApp(courierId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Cabeçalho da Gestão de Frotas */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Bike className="w-4 h-4" />
            <span>Gestão de Frota • Painel Administrativo Central</span>
          </div>
          <h3 className="text-base font-black mt-1">
            Controle de Entregadores Parceiros Credenciados
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Monitore em tempo real o status online/offline de cada entregador, audite documentações, controle permissões e acesse o aplicativo autônomo de qualquer parceiro para testes.
          </p>
        </div>

        {onOpenCourierApp && (
          <button
            onClick={() => onOpenCourierApp()}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir App do Entregador</span>
          </button>
        )}
      </div>

      {/* Cards de Métricas da Frota */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total de Entregadores</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {totalCouriers} parceiros
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {motoCouriers} motos • {carCouriers} carros
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Entregadores Online Agora</span>
            <Power className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1 flex items-center gap-2">
            <span>{onlineCouriers}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-2">
            Disponíveis para receber chamados na região
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total de Entregas Realizadas</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {totalDeliveriesAll}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Corridas finalizadas com sucesso
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Saldo em Carteira dos Entregadores</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            {formatCurrency(totalBalanceAvailableAll)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Disponível para repasse via Pix
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, placa ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Filtro por Modal */}
          <select
            value={filterModal}
            onChange={(e) => setFilterModal(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Modais</option>
            <option value="moto">Somente Moto</option>
            <option value="car">Somente Carro</option>
          </select>

          {/* Filtro por Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="blocked">Bloqueados</option>
          </select>
        </div>
      </div>

      {/* Lista / Tabela de Entregadores */}
      <div className="space-y-3">
        {filteredCouriers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            Nenhum entregador parceiro encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredCouriers.map((courier) => (
            <div
              key={courier.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition hover:shadow-md ${
                courier.isBlocked
                  ? 'border-rose-300 bg-rose-50/20'
                  : courier.isOnline
                  ? 'border-emerald-300/80'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Dados Principais do Entregador */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={courier.avatarUrl}
                      alt={courier.name}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        courier.isBlocked
                          ? 'bg-rose-500'
                          : courier.isOnline
                          ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-slate-400'
                      }`}
                      title={courier.isBlocked ? 'Bloqueado' : courier.isOnline ? 'Online' : 'Offline'}
                    ></span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{courier.name}</h4>

                      {/* Modal Badge */}
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1 font-mono">
                        {courier.modal === 'moto' ? <Bike className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                        <span>{courier.modal}</span>
                      </span>

                      {/* Status Online/Offline */}
                      {courier.isBlocked ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          Bloqueado
                        </span>
                      ) : courier.isOnline ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Online
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Offline
                        </span>
                      )}

                      {/* Credenciamento */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          courier.verificationStatus === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : courier.verificationStatus === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {courier.verificationStatus === 'verified'
                          ? 'Aprovado'
                          : courier.verificationStatus === 'rejected'
                          ? 'Rejeitado'
                          : 'Pendente'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                      <span>Placa: <strong>{courier.vehiclePlate}</strong></span>
                      <span>•</span>
                      <span>CPF: {courier.document}</span>
                      <span>•</span>
                      <span>CNH: {courier.cnh}</span>
                      {courier.phone && (
                        <>
                          <span>•</span>
                          <span>Tel: {courier.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Métricas e Ações */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Desempenho e Saldo */}
                  <div className="flex items-center gap-4 text-right pr-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Entregas</span>
                      <span className="text-xs font-black font-mono text-slate-800">
                        {courier.totalDeliveries} concluídas
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Atual</span>
                      <span className="text-sm font-black font-mono text-emerald-700">
                        {formatCurrency(courier.balanceAvailable)}
                      </span>
                    </div>
                  </div>

                  {/* Botões de Ação do Admin */}
                  <div className="flex items-center gap-2">
                    {/* Botão de Documentos */}
                    {courier.documentPhoto && (
                      <button
                        onClick={() =>
                          setSelectedPhotoModal({
                            title: `CNH de ${courier.name}`,
                            url: courier.documentPhoto!,
                          })
                        }
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        title="Ver Foto da CNH"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}

                    {/* Alternar Status Online Administrativamente */}
                    <button
                      onClick={() => toggleCourierOnline(courier.id)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        courier.isOnline
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                      title={courier.isOnline ? 'Colocar em Offline' : 'Colocar em Online'}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    {/* Bloquear / Desbloquear */}
                    {courier.isBlocked ? (
                      <button
                        onClick={() => unblockCourier(courier.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Desbloquear Entregador"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Desbloquear</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => blockCourier(courier.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                        title="Suspender/Bloquear Entregador"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}

                    {/* Testar / Acessar como este entregador */}
                    <button
                      onClick={() => handleTestAsCourier(courier.id)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Abrir aplicativo com a sessão isolada deste entregador"
                    >
                      <span>Acessar App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Exibição de Documentos */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900">{selectedPhotoModal.title}</h4>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img
              src={selectedPhotoModal.url}
              alt={selectedPhotoModal.title}
              className="w-full h-72 object-cover rounded-2xl border border-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
