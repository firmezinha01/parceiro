import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/pricingEngine';
import { StatusBadge } from '../common/StatusBadge';
import { PricingSettings } from './PricingSettings';
import { AuditLogViewer } from './AuditLogViewer';
import { AdminVerificationView } from './AdminVerificationView';
import { CourierManagementView } from './CourierManagementView';
import {
  TrendingUp,
  DollarSign,
  Package,
  Bike,
  Store,
  Sliders,
  ShieldCheck,
  BarChart3,
  Layers,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenCourierApp?: (courierId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenCourierApp }) => {
  const { orders, dropoffPoints, clients, couriers } = useApp();
  const [adminTab, setAdminTab] = useState<'overview' | 'couriers' | 'verification' | 'pricing' | 'audit' | 'orders'>('overview');

  // Cálculos Financeiros Globais do Sistema
  const totalOrders = orders.length;

  // Faturamento Bruto (GMV)
  const totalGMV = orders.reduce((sum, o) => sum + o.price.totalCustomerCharge, 0);

  // Total Repassado a Entregadores
  const totalCourierPayouts = orders.reduce((sum, o) => sum + o.price.totalCourierPayout, 0);

  // Total Pago a Lojistas Parceiros
  const totalMerchantPayouts = orders.reduce((sum, o) => sum + o.price.merchantPayout, 0);

  // Receita Líquida Retida pelo App (Margem da Plataforma)
  const totalPlatformRetention = orders.reduce((sum, o) => sum + o.price.platformRetention, 0);

  // Média efetiva de retenção do App
  const averageRetentionPct = totalGMV > 0 ? Math.round((totalPlatformRetention / totalGMV) * 100) : 25;

  return (
    <div className="space-y-6">
      {/* Sub-navegação do Painel Admin */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAdminTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            adminTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Métricas Operacionais</span>
        </button>

        <button
          onClick={() => setAdminTab('couriers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            adminTab === 'couriers'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bike className="w-4 h-4 text-amber-600" />
          <span>Gestão de Entregadores Parceiros</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-900 text-amber-400">
            {couriers.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('verification')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            adminTab === 'verification'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Auditoria & Compliance de Cadastros</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-white">
            {clients.length + dropoffPoints.length + couriers.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            adminTab === 'pricing'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configuração Dinâmica de Preços & Split</span>
        </button>

        <button
          onClick={() => setAdminTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            adminTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Log Imutável de Auditoria (GPS & QR)</span>
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            adminTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Todas as Encomendas ({totalOrders})</span>
        </button>
      </div>

      {/* Tab 1: Visão Geral & KPIs Operacionais */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Métricas Financeiras Consolidadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Faturamento Bruto (GMV)
              </span>
              <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                {formatCurrency(totalGMV)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                Total movimentado em fretes
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                Repassado aos Entregadores
              </span>
              <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                {formatCurrency(totalCourierPayouts)}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">
                ~{100 - averageRetentionPct}% do valor bruto repassado
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                Comissão a Lojistas Parceiros
              </span>
              <div className="text-2xl font-black font-mono text-purple-700 mt-1">
                {formatCurrency(totalMerchantPayouts)}
              </div>
              <div className="text-[11px] text-purple-600 font-medium mt-2">
                Pontos de coleta drop-off
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-indigo-900">
                Receita Líquida do App (Retenção)
              </span>
              <div className="text-2xl font-black font-mono text-indigo-700 mt-1">
                {formatCurrency(totalPlatformRetention)}
              </div>
              <div className="text-[11px] text-indigo-800 font-bold mt-2">
                {averageRetentionPct}% de retenção média efetiva
              </div>
            </div>
          </div>

          {/* Comparativo de Volume e Modalidades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase">Entregas de Moto</div>
                <div className="text-xl font-black text-slate-900">
                  {orders.filter((o) => o.modal === 'moto').length} pedidos
                </div>
                <div className="text-[11px] text-slate-500">Documentos e volumes leves</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase">Entregas de Carro</div>
                <div className="text-xl font-black text-slate-900">
                  {orders.filter((o) => o.modal === 'car').length} pedidos
                </div>
                <div className="text-[11px] text-slate-500">Caixas e utilitários</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-800 rounded-xl">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase">Pontos Lojistas Ativos</div>
                <div className="text-xl font-black text-slate-900">
                  {dropoffPoints.length} parceiros
                </div>
                <div className="text-[11px] text-slate-500">Rede de coleta física</div>
              </div>
            </div>
          </div>

          {/* Encomendas Recentes e Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Monitoramento em Tempo Real de Entregas
              </h4>
              <button
                onClick={() => setAdminTab('orders')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todas</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded">
                      {ord.trackingCode}
                    </span>
                    <StatusBadge status={ord.status} size="sm" />
                    <span className="text-xs text-slate-600">
                      {ord.sender.name} ➔ {ord.recipient.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-500">
                      Bruto: <strong>{formatCurrency(ord.price.totalCustomerCharge)}</strong>
                    </span>
                    <span className="text-emerald-700">
                      Repasse: <strong>{formatCurrency(ord.price.totalCourierPayout)}</strong>
                    </span>
                    <span className="text-indigo-700">
                      App: <strong>{formatCurrency(ord.price.platformRetention)}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Gestão de Entregadores Parceiros */}
      {adminTab === 'couriers' && <CourierManagementView onOpenCourierApp={onOpenCourierApp} />}

      {/* Tab 2: Compliance & Aprovação de Cadastros */}
      {adminTab === 'verification' && <AdminVerificationView />}

      {/* Tab 3: Configuração Dinâmica */}
      {adminTab === 'pricing' && <PricingSettings />}

      {/* Tab 4: Log Imutável de Auditoria */}
      {adminTab === 'audit' && <AuditLogViewer />}

      {/* Tab 5: Tabela Completa de Encomendas */}
      {adminTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remetente / Destino</th>
                  <th className="px-4 py-3">Modal / Rota</th>
                  <th className="px-4 py-3">Entregador Alocado</th>
                  <th className="px-4 py-3">Valor Bruto</th>
                  <th className="px-4 py-3">Repasse</th>
                  <th className="px-4 py-3">Retenção App</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      {ord.trackingCode}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={ord.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{ord.recipient.name}</div>
                      <div className="text-[11px] text-slate-500">De: {ord.sender.name}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="uppercase font-bold text-slate-700">{ord.modal}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {ord.price.distanceKm} km ({ord.weightKg} kg)
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {ord.courierName ? (
                        <div className="text-slate-900 font-semibold">{ord.courierName}</div>
                      ) : (
                        <span className="text-slate-400 italic">Pendente de aceite</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      {formatCurrency(ord.price.totalCustomerCharge)}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                      {formatCurrency(ord.price.totalCourierPayout)}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-700">
                      {formatCurrency(ord.price.platformRetention)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
