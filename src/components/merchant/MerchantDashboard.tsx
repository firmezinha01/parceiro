import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/pricingEngine';
import { StatusBadge } from '../common/StatusBadge';
import { RegisterMerchantModal } from '../auth/RegisterMerchantModal';
import {
  Store,
  Package,
  ArrowUpRight,
  DollarSign,
  Sparkles,
  MapPin,
  ShieldCheck,
  PlusCircle,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MerchantDashboard: React.FC = () => {
  const { dropoffPoints, orders, pricingConfig, recordDropoffIn, recordDropoffOut } = useApp();
  const [selectedPointId, setSelectedDropoffId] = useState(dropoffPoints[0]?.id || 'drop_01');
  const [isRegisterMerchantOpen, setIsRegisterMerchantOpen] = useState(false);

  const activePoint = dropoffPoints.find((p) => p.id === selectedPointId) || dropoffPoints[0];

  // Pacotes que estão sob custódia física no ponto de coleta
  const packagesInCustody = orders.filter(
    (o) => o.pickupMethod === 'dropoff_point' && o.status === 'at_dropoff'
  );

  // Histórico de pacotes movimentados por este ponto
  const allDropoffOrders = orders.filter(
    (o) => o.pickupMethod === 'dropoff_point'
  );

  const handleSimulateDropoffScan = (orderId: string, type: 'in' | 'out') => {
    if (!activePoint) return;
    if (type === 'in') {
      recordDropoffIn(orderId, activePoint.id);
    } else {
      recordDropoffOut(orderId, activePoint.id);
    }
    confetti({ particleCount: 60, spread: 60 });
  };

  if (!activePoint) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-purple-200 p-8 rounded-3xl text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Nenhum Ponto Lojista Cadastrado no Modo Teste Real</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              Cadastre seu comércio com foto da fachada, CNPJ e endereço para começar a receber pacotes e ganhar R$ 3,50 por pacote em custódia.
            </p>
          </div>
          <button
            onClick={() => setIsRegisterMerchantOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Ponto Lojista Agora</span>
          </button>
        </div>

        {isRegisterMerchantOpen && (
          <RegisterMerchantModal
            onClose={() => setIsRegisterMerchantOpen(false)}
            onSuccess={() => setIsRegisterMerchantOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informações da Loja & Ponto de Coleta */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-400">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black">{activePoint.name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Ponto de Coleta Oficial
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Auditado (CNPJ + Fachada)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              {activePoint.address.street}, {activePoint.address.number} — {activePoint.address.neighborhood} (
              {activePoint.address.city})
            </p>
          </div>
        </div>

        {/* Botão de Cadastrar Nova Loja & Seletor */}
        <div className="flex items-center gap-2">
          {dropoffPoints.length > 1 && (
            <select
              value={selectedPointId}
              onChange={(e) => setSelectedDropoffId(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 outline-hidden"
            >
              {dropoffPoints.map((dp) => (
                <option key={dp.id} value={dp.id}>
                  {dp.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsRegisterMerchantOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Novo Ponto</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas do Lojista */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pacotes em Custódia no Balcão</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-700 font-mono mt-2">
            {packagesInCustody.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Aguardando retirada pelo motorista parceiro
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Ganhos Totais Acumulados</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 font-mono mt-2">
            {formatCurrency(activePoint.totalEarnings)}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-2">
            + {formatCurrency(pricingConfig.merchantFixedFee)} por pacote movimentado
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Histórico Movimentado</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">
            {activePoint.packageCount} pacotes
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Elegível para bônus de volume mensal
          </div>
        </div>
      </div>

      {/* Regra de Monetização do Lojista & Segurança */}
      <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>Modelo de Parceria & Guarda Intermediária Segura:</span>
          </h4>
          <p className="text-xs text-purple-800 mt-0.5 leading-relaxed">
            Sua loja física recebe <strong>{formatCurrency(pricingConfig.merchantFixedFee)} fixos</strong> por cada pacote recebido e entregue aos motoristas parceiros. Como ponto de guarda auditado, todas as entradas e saídas exigem conferência de QR Code contra extravios.
          </p>
        </div>
      </div>

      {/* Lista de Pacotes em Custódia com Ações de Baixa */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Pacotes no Ponto de Coleta ({packagesInCustody.length})
          </h4>
          <span className="text-[11px] text-slate-500">
            Escaneie o QR Code na entrada e saída do balcão
          </span>
        </div>

        {packagesInCustody.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Nenhum pacote sob custódia no momento. Quando um cliente optar por "Levar ao Ponto Lojista", ele aparecerá aqui para você dar a baixa de entrada.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {packagesInCustody.map((ord) => (
              <div key={ord.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-purple-50/20 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {ord.trackingCode}
                    </span>
                    <StatusBadge status={ord.status} size="sm" />
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {ord.modal} • {ord.weightKg} kg
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    <strong>Destino:</strong> {ord.recipient.name} ({ord.recipient.address.neighborhood})
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Deixado por: {ord.sender.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSimulateDropoffScan(ord.id, 'out')}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Baixa de Saída (Entregador Retirou)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico Geral de Pacotes do Ponto */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Histórico de Todos os Pacotes Despachados por este Ponto
          </h4>
        </div>

        <div className="divide-y divide-slate-100">
          {allDropoffOrders.map((ord) => (
            <div key={ord.id} className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900">{ord.trackingCode}</span>
                <StatusBadge status={ord.status} size="sm" />
                <span className="text-slate-500">
                  {ord.sender.name} ➔ {ord.recipient.name}
                </span>
              </div>
              <div className="font-mono font-bold text-emerald-700">
                + {formatCurrency(pricingConfig.merchantFixedFee)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Cadastro Seguro de Ponto Lojista */}
      {isRegisterMerchantOpen && (
        <RegisterMerchantModal
          onClose={() => setIsRegisterMerchantOpen(false)}
          onSuccess={() => setIsRegisterMerchantOpen(false)}
        />
      )}
    </div>
  );
};
