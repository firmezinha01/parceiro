import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { User, Bike, Store, ShieldAlert, Check } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentRole, setCurrentRole, orders, dropoffPoints, courierProfile } = useApp();

  const pendingPickups = orders.filter((o) => o.status === 'created').length;
  const packagesInDropoff = orders.filter((o) => o.status === 'at_dropoff').length;

  const roles: {
    id: UserRole;
    name: string;
    subtext: string;
    icon: React.ReactNode;
    badge?: number;
    color: string;
    activeBorder: string;
  }[] = [
    {
      id: 'client',
      name: 'Cliente',
      subtext: 'Cotar, Pagar & Rastrear',
      icon: <User className="w-4 h-4" />,
      color: 'text-emerald-600',
      activeBorder: 'border-emerald-500 bg-emerald-50/80 text-emerald-900',
    },
    {
      id: 'courier',
      name: 'Entregador',
      subtext: `${courierProfile.modal.toUpperCase()} • R$ ${courierProfile.balanceAvailable.toFixed(2)}`,
      icon: <Bike className="w-4 h-4" />,
      badge: pendingPickups > 0 ? pendingPickups : undefined,
      color: 'text-amber-600',
      activeBorder: 'border-amber-500 bg-amber-50/80 text-amber-900',
    },
    {
      id: 'merchant',
      name: 'Ponto Lojista',
      subtext: `${packagesInDropoff} em custódia`,
      icon: <Store className="w-4 h-4" />,
      badge: packagesInDropoff > 0 ? packagesInDropoff : undefined,
      color: 'text-purple-600',
      activeBorder: 'border-purple-500 bg-purple-50/80 text-purple-900',
    },
    {
      id: 'admin',
      name: 'Painel Central',
      subtext: 'Configurações & Auditoria',
      icon: <ShieldAlert className="w-4 h-4" />,
      color: 'text-indigo-600',
      activeBorder: 'border-indigo-500 bg-indigo-50/80 text-indigo-900',
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold uppercase text-slate-600 tracking-wider hidden lg:block shrink-0">
            Alternar Visão do Sistema:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            {roles.map((role) => {
              const isActive = currentRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setCurrentRole(role.id)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border text-left transition-all relative ${
                    isActive
                      ? `${role.activeBorder} shadow-sm font-semibold ring-2 ring-amber-400/20`
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive ? 'bg-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {role.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold leading-tight">{role.name}</div>
                      <div className="text-[11px] text-slate-600 truncate font-normal">
                        {role.subtext}
                      </div>
                    </div>
                  </div>

                  {role.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 shrink-0">
                      {role.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
