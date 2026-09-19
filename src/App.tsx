import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Navbar } from './components/layout/Navbar';
import { RoleSwitcher } from './components/layout/RoleSwitcher';
import { QuoteForm } from './components/client/QuoteForm';
import { TrackingView } from './components/client/TrackingView';
import { CourierDashboard } from './components/courier/CourierDashboard';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Order } from './types';
import {
  Send,
  Search,
  Package,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  Bike,
  Store,
  Layers,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { authUser, currentRole, setCurrentRole, orders, setActiveOrderForTracking } = useApp();
  const [clientTab, setClientTab] = useState<'quote' | 'tracking'>('quote');

  // Se o usuário não estiver logado, exibe a tela de login / cadastro / Google
  if (!authUser) {
    return <AuthScreen />;
  }

  const handleOrderCreated = (order: Order) => {
    setActiveOrderForTracking(order);
    setClientTab('tracking');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      {/* Barra de Navegação Superior */}
      <Navbar />

      {/* Alternador Interativo de Perfis */}
      <RoleSwitcher />

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ========================================================
            1. VISÃO DO CLIENTE (REMETENTE / DESTINATÁRIO)
        ======================================================== */}
        {currentRole === 'client' && (
          <div className="space-y-6">
            {/* Tabs do Cliente */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setClientTab('quote')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    clientTab === 'quote'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nova Cotação de Envio</span>
                </button>

                <button
                  onClick={() => setClientTab('tracking')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    clientTab === 'tracking'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rastrear Encomenda & Etiqueta</span>
                  {orders.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                      {orders.length}
                    </span>
                  )}
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                Rede de Entregas Locais • Moto & Carro
              </span>
            </div>

            {/* Conteúdo da Tab */}
            {clientTab === 'quote' ? (
              <QuoteForm onOrderCreated={handleOrderCreated} />
            ) : (
              <TrackingView />
            )}
          </div>
        )}

        {/* ========================================================
            2. VISÃO DO ENTREGADOR PARCEIRO (MOTO / CARRO)
        ======================================================== */}
        {currentRole === 'courier' && <CourierDashboard />}

        {/* ========================================================
            3. VISÃO DO LOJISTA PARCEIRO (PONTO DE COLETA)
        ======================================================== */}
        {currentRole === 'merchant' && <MerchantDashboard />}

        {/* ========================================================
            4. VISÃO DO ADMINISTRADOR / PAINEL CENTRAL
        ======================================================== */}
        {currentRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Rodapé Informativo */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">Correios Parceiros</span>
            <span>—</span>
            <span>Plataforma de Retirada e Entrega Descentralizada (MVP Local)</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Baixas Auditáveis com GPS
            </span>
            <span className="flex items-center gap-1">
              <Bike className="w-3.5 h-3.5 text-amber-600" /> Repasse por Km/Tempo (65/85/75)
            </span>
            <span className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-purple-600" /> Pontos Lojistas Drop-off
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
