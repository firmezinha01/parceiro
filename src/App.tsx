import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Navbar } from './components/layout/Navbar';
import { QuoteForm } from './components/client/QuoteForm';
import { TrackingView } from './components/client/TrackingView';
import { CourierStandaloneApp } from './components/courier/CourierStandaloneApp';
import { Order } from './types';
import {
  Send,
  Search,
  ShieldCheck,
  Bike,
  Store,
} from 'lucide-react';

type ActivePortal = 'main' | 'courier';

function detectPortal(): ActivePortal {
  if (typeof window === 'undefined') return 'main';
  const pathname = window.location.pathname.toLowerCase();
  const search = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();

  if (
    pathname.startsWith('/entregador') ||
    pathname.startsWith('/courier') ||
    search.get('portal') === 'courier' ||
    search.get('portal') === 'entregador' ||
    search.get('app') === 'courier' ||
    search.get('app') === 'entregador' ||
    hash.includes('entregador') ||
    hash.includes('courier')
  ) {
    return 'courier';
  }
  return 'main';
}

const MainContent: React.FC = () => {
  const { authUser, currentRole, setCurrentRole, orders, setActiveOrderForTracking } = useApp();
  const [clientTab, setClientTab] = useState<'quote' | 'tracking'>('quote');

  // Garante que o papel esteja sempre como 'client' no portal principal
  useEffect(() => {
    if (currentRole !== 'client') {
      setCurrentRole('client');
    }
  }, [currentRole, setCurrentRole]);

  // Se o usuário não estiver logado no portal principal, exibe a tela de login / cadastro
  if (!authUser) {
    return <AuthScreen />;
  }

  const handleOrderCreated = (order: Order) => {
    setActiveOrderForTracking(order);
    setClientTab('tracking');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      {/* Barra de Navegação Superior do Portal do Cliente */}
      <Navbar />

      {/* Área Principal de Conteúdo do Cliente */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Tabs do Cliente */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setClientTab('quote')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
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
      </main>

      {/* Rodapé Informativo */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">Correios Parceiros</span>
            <span>—</span>
            <span>Plataforma de Retirada e Entrega Descentralizada</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Baixas Auditáveis com GPS
            </span>
            <span className="flex items-center gap-1">
              <Bike className="w-3.5 h-3.5 text-amber-600" /> Repasse por Componente
            </span>
            <span className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-purple-600" /> Entregadores Credenciados
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [activePortal, setActivePortal] = useState<ActivePortal>(detectPortal);

  useEffect(() => {
    const handlePopState = () => {
      setActivePortal(detectPortal());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <AppProvider>
      {activePortal === 'courier' ? (
        <CourierStandaloneApp />
      ) : (
        <MainContent />
      )}
    </AppProvider>
  );
}
