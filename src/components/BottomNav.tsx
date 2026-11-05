import React from 'react';
import { Package, Map, Wallet, User, Radio } from 'lucide-react';
import { sound } from '../sound';

export type NavTab = 'orders' | 'map' | 'wallet' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  availableOrdersCount: number;
  hasActiveOrder: boolean;
  onOpenActiveOrder: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  availableOrdersCount,
  hasActiveOrder,
  onOpenActiveOrder,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center pointer-events-none">
      {/* Active Order Float Banner if not currently on active order */}
      {hasActiveOrder && (
        <div className="w-full max-w-md px-3 mb-2 pointer-events-auto">
          <button
            onClick={() => {
              sound.playClick();
              onOpenActiveOrder();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-extrabold text-xs flex items-center justify-between shadow-xl shadow-emerald-600/40 animate-bounce active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>VOCÊ TEM UMA CORRIDA EM ANDAMENTO</span>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px]">
              Ver Rota →
            </span>
          </button>
        </div>
      )}

      {/* Main Bar */}
      <nav className="w-full max-w-md bg-white border-t border-gray-200/90 shadow-2xl px-2 py-1.5 flex items-center justify-around pointer-events-auto">
        {/* Tab 1: Pedidos */}
        <button
          onClick={() => {
            sound.playClick();
            onSelectTab('orders');
          }}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center relative transition-colors ${
            activeTab === 'orders' ? 'text-lala-orange font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {availableOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-lala-orange text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {availableOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-bold">Pedidos</span>
        </button>

        {/* Tab 2: Mapa */}
        <button
          onClick={() => {
            sound.playClick();
            onSelectTab('map');
          }}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-colors ${
            activeTab === 'map' ? 'text-lala-orange font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold">Mapa</span>
        </button>

        {/* Tab 3: Carteira */}
        <button
          onClick={() => {
            sound.playClick();
            onSelectTab('wallet');
          }}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-colors ${
            activeTab === 'wallet' ? 'text-lala-orange font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold">Carteira</span>
        </button>

        {/* Tab 4: Perfil */}
        <button
          onClick={() => {
            sound.playClick();
            onSelectTab('profile');
          }}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-colors ${
            activeTab === 'profile' ? 'text-lala-orange font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold">Perfil</span>
        </button>
      </nav>
    </div>
  );
};
