import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { MapPreview } from '../common/MapPreview';
import { DigitalLabel } from './DigitalLabel';
import { formatCurrency } from '../../services/pricingEngine';
import {
  Search,
  Package,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Bike,
  Store,
  ExternalLink,
  ChevronRight,
  User,
  XCircle,
} from 'lucide-react';

export const TrackingView: React.FC = () => {
  const { orders, activeOrderForTracking, setActiveOrderForTracking, cancelOrder } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [showLabelModal, setShowLabelModal] = useState(false);

  // Pedido em foco (se nenhum estiver selecionado, pega o primeiro)
  const currentOrder: Order | undefined =
    activeOrderForTracking || (orders.length > 0 ? orders[0] : undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    const found = orders.find(
      (o) => o.trackingCode.toUpperCase() === query || o.id.toUpperCase() === query
    );
    if (found) {
      setActiveOrderForTracking(found);
    } else {
      alert(`Nenhuma encomenda encontrada com o código ${query}`);
    }
  };

  if (!currentOrder) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Nenhuma encomenda ativa no momento</h3>
        <p className="text-xs text-slate-500 mt-1">
          Faça uma cotação na aba ao lado para gerar sua primeira etiqueta com QR Code.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Busca de Rastreamento */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Digite o código de rastreio (ex: BR481920481SP)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl uppercase font-mono font-semibold focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Buscar
          </button>
        </form>

        {/* Seletor rápido de outros pedidos existentes */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">
            Recentes:
          </span>
          {orders.slice(0, 4).map((o) => (
            <button
              key={o.id}
              onClick={() => setActiveOrderForTracking(o)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition shrink-0 ${
                currentOrder.id === o.id
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {o.trackingCode}
            </button>
          ))}
        </div>
      </div>

      {/* Cartão de Detalhes do Envio */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black font-mono tracking-wider text-amber-400">
                {currentOrder.trackingCode}
              </span>
              <StatusBadge status={currentOrder.status} size="lg" />
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Criado em: {new Date(currentOrder.createdAt).toLocaleString('pt-BR')} • Modal:{' '}
              <strong className="text-white uppercase">{currentOrder.modal}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(currentOrder.status === 'created' || currentOrder.status === 'at_dropoff') && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente cancelar esta corrida?')) {
                    cancelOrder(currentOrder.id, 'Cancelado pelo cliente antes da coleta');
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition cursor-pointer"
                title="Cancelar pedido de entrega"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancelar Corrida</span>
              </button>
            )}

            <button
              onClick={() => setShowLabelModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver Etiqueta com QR Code</span>
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline de Baixas Auditadas */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Trilha de Rastreamento (Baixas Auditadas)</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Log Imutável com GPS
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {currentOrder.scanHistory.map((scan, idx) => {
                const isLatest = idx === currentOrder.scanHistory.length - 1;
                return (
                  <div key={scan.id} className="relative group">
                    {/* Marcador na Linha */}
                    <div
                      className={`absolute -left-6 mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        isLatest
                          ? 'bg-amber-500 border-amber-600 text-slate-950 ring-4 ring-amber-400/20'
                          : 'bg-white border-slate-400 text-slate-600'
                      }`}
                    >
                      <span className="text-[9px] font-bold">{idx + 1}</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 group-hover:border-slate-300 transition space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-xs font-black text-slate-900">
                          {scan.description}
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          {new Date(scan.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Operador: <strong>{scan.operatorName}</strong> ({scan.operatorRole})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span>{scan.locationName}</span>
                        </div>
                      </div>

                      {/* Dados Criptográficos de Auditoria */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>GPS: {scan.coordinates.lat.toFixed(4)}, {scan.coordinates.lng.toFixed(4)}</span>
                        <span className="truncate max-w-[180px]" title={scan.auditHash}>
                          Hash: {scan.auditHash.substring(0, 16)}...
                        </span>
                      </div>

                      {/* Se houver comprovante de assinatura */}
                      {scan.recipientSignature && (
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 space-y-1">
                          <div className="font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Comprovante de Assinatura Digital Registrado</span>
                          </div>
                          {scan.recipientSignature.startsWith('data:image') ? (
                            <img
                              src={scan.recipientSignature}
                              alt="Assinatura Digital"
                              className="h-10 border border-slate-300 rounded bg-white p-1"
                            />
                          ) : (
                            <p className="text-[11px] text-emerald-800 italic">
                              "{scan.recipientSignature}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Direita: Mapa & Dados de Rota */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Localização & Rota
            </h4>

            <MapPreview
              origin={currentOrder.sender.address}
              destination={currentOrder.recipient.address}
              modal={currentOrder.modal}
              status={currentOrder.status}
              distanceKm={currentOrder.price.distanceKm}
              durationMin={currentOrder.price.durationMin}
            />

            {/* Informações dos Envolvidos */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Entregador:</span>
                <div className="text-slate-900 font-bold mt-0.5">
                  {currentOrder.courierName || 'Aguardando alocação de entregador'}
                </div>
                {currentOrder.courierPhone && (
                  <div className="text-slate-500 font-mono">{currentOrder.courierPhone}</div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400">Destinatário:</span>
                <div className="text-slate-900 font-bold mt-0.5">
                  {currentOrder.recipient.name}
                </div>
                <div className="text-slate-600">
                  {currentOrder.recipient.address.street}, {currentOrder.recipient.address.number} —{' '}
                  {currentOrder.recipient.address.neighborhood}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">Valor Pago:</span>
                <span className="text-sm font-black font-mono text-emerald-700">
                  {formatCurrency(currentOrder.price.totalCustomerCharge)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal da Etiqueta Digital */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8">
            <DigitalLabel order={currentOrder} onClose={() => setShowLabelModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
