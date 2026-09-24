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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Barra de Navegação Superior do Portal do Cliente */}
      <Navbar />

      {/* Área Principal de Conteúdo do Cliente */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Tabs do Cliente */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setClientTab('quote')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  clientTab === 'quote'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-slate-950" />
                <span>Nova Cotação de Envio</span>
              </button>

              <button
                onClick={() => setClientTab('tracking')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  clientTab === 'tracking'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-slate-950" />
                <span>Rastrear Encomenda & Etiqueta</span>
                {orders.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-900 text-amber-400">
                    {orders.length}
                  </span>
                )}
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
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
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">Parceiro</span>
            <span className="text-slate-600">—</span>
            <span className="text-slate-400">Plataforma de Retirada e Entrega Descentralizada</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Baixas Auditáveis com GPS
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Bike className="w-3.5 h-3.5 text-amber-400" /> Repasse por Componente
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Store className="w-3.5 h-3.5 text-purple-400" /> Entregadores Credenciados
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
